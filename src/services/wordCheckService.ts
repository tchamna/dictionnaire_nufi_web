import { supabase } from '@/lib/supabase';
import { cleanWord } from '@/lib/clafricaMapping';
import { hasAudio } from '@/data/audioMapping';

// Cache for words that exist in the dictionary to reduce database queries
const wordExistsCache = new Map<string, boolean>();

/**
 * Check if a word exists in the dictionary
 * @param word The word to check
 * @returns A promise that resolves to true if the word exists, false otherwise
 */
export async function checkWordExists(word: string): Promise<boolean> {
  // Clean the word first - but preserve the original for logging
  const originalWord = word;
  const cleanedWord = cleanWord(word);
  if (!cleanedWord) return false;
  
  // Add logging to help diagnose issues
  console.log(`🔎 Checking if word exists: "${originalWord}" (cleaned: "${cleanedWord}")`);
  
  // Check cache first
  if (wordExistsCache.has(cleanedWord)) {
    const exists = wordExistsCache.get(cleanedWord) || false;
    console.log(`📂 Cache hit for "${cleanedWord}": ${exists}`);
    return exists;
  }
  
  // Special case: Check if the word has audio mapping
  // This ensures words with audio are always clickable
  if (hasAudio(cleanedWord)) {
    console.log(`🔊 Word "${cleanedWord}" has audio mapping, marking as existing`);
    wordExistsCache.set(cleanedWord, true);
    return true;
  }
  
  try {
    // First try exact match
    const { data, error } = await supabase
      .from('definitions')
      .select('definition_index')
      .eq('word', cleanedWord)
      .limit(1);
    
    if (error) {
      console.error('❌ Error in word exists query:', error);
      return false;
    }
    
    let exists = data && data.length > 0;
    console.log(`📊 Exact match query for "${cleanedWord}": ${exists}`);
    
    // If no exact match, try case-insensitive match
    if (!exists) {
      console.log(`🔄 No exact match for "${cleanedWord}", trying case-insensitive match`);
      const { data: idata, error: ierror } = await supabase
        .from('definitions')
        .select('definition_index')
        .ilike('word', cleanedWord)
        .limit(1);
      
      if (!ierror && idata && idata.length > 0) {
        exists = true;
        console.log(`✅ Found case-insensitive match for "${cleanedWord}"`);
      } else {
        console.log(`❌ No case-insensitive match found for "${cleanedWord}"`);
        
        // Try a more flexible approach for words with diacritical marks
        // First, normalize the word by removing all diacritical marks
        const normalizedWord = cleanedWord.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        if (normalizedWord !== cleanedWord) {
          console.log(`🔍 Trying normalized match without diacritics: "${normalizedWord}"`);
          const { data: ndata, error: nerror } = await supabase
            .from('definitions')
            .select('definition_index, word')
            .ilike('word', normalizedWord)
            .limit(10);
          
          if (!nerror && ndata && ndata.length > 0) {
            exists = true;
            console.log(`✅ Found normalized match for "${cleanedWord}": "${ndata[0].word}"`);
          }
        }
        
        // If still no match, try a partial match for words with special characters
        if (!exists) {
          // Create a pattern where each character is optional
          // This helps with words like "mba" that might be part of longer words
          const baseWord = cleanedWord.replace(/[^a-z]/g, '%');
          console.log(`🔍 Trying partial match with pattern: "${baseWord}"`);
          
          const { data: pdata, error: perror } = await supabase
            .from('definitions')
            .select('definition_index, word')
            .ilike('word', `%${baseWord}%`)
            .limit(20);
          
          if (!perror && pdata && pdata.length > 0) {
            // Check if any of the returned words are close matches or contain our word
            const matchedWord = pdata.find(item => {
              // Check if the item contains our word as a substring
              const itemNormalized = item.word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
              const cleanedNormalized = normalizedWord.toLowerCase();
              
              return itemNormalized === cleanedNormalized || 
                     itemNormalized.includes(cleanedNormalized) || 
                     cleanedNormalized.includes(itemNormalized);
            });
            
            if (matchedWord) {
              exists = true;
              console.log(`✅ Found partial match for "${cleanedWord}": "${matchedWord.word}"`);
            } else {
              console.log(`❌ No partial matches found for "${cleanedWord}"`);
            }
          }
        }
      }
    }
    
    // Cache the result
    wordExistsCache.set(cleanedWord, exists);
    console.log(`💾 Setting cache for "${cleanedWord}": ${exists}`);
    
    return exists;
  } catch (error) {
    console.error('❌ Error checking if word exists:', error);
    return false;
  }
}

/**
 * Preload a list of words into the cache
 * This can be used to improve performance when rendering a large number of words
 * @param words Array of words to preload
 */
export async function preloadWordExistence(words: string[]): Promise<void> {
  if (!words.length) return;
  
  // Clean and deduplicate words
  const cleanedWords = [...new Set(words.map(cleanWord).filter(Boolean))];
  
  // Filter out words that are already in the cache
  const wordsToCheck = cleanedWords.filter(word => !wordExistsCache.has(word));
  
  if (!wordsToCheck.length) return;
  
  try {
    // Query the database for all words at once
    // For batch checking, we'll use a simpler approach with 'in'
    const { data, error } = await supabase
      .from('definitions')
      .select('word')
      .in('word', wordsToCheck);
      
    // If there's an error with the 'in' query, fall back to individual checks
    if (error) {
      console.error('Error with batch word check, falling back to individual checks:', error);
      // Just return without updating cache - individual checks will happen later
      return;
    }
    
    if (error) {
      console.error('Error preloading word existence:', error);
      return;
    }
    
    // Mark found words as existing
    if (data) {
      const foundWords = new Set(data.map(item => cleanWord(item.word)));
      
      // Update cache for all words
      wordsToCheck.forEach(word => {
        wordExistsCache.set(word, foundWords.has(word));
      });
    }
  } catch (error) {
    console.error('Error preloading word existence:', error);
  }
}

/**
 * Clear the word existence cache
 */
export function clearWordExistsCache(): void {
  wordExistsCache.clear();
}
