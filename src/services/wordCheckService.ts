import { supabase } from '@/lib/supabase';
import { cleanWord } from '@/lib/clafricaMapping';

// Cache for words that exist in the dictionary to reduce database queries
const wordExistsCache = new Map<string, boolean>();

/**
 * Check if a word exists in the dictionary
 * @param word The word to check
 * @returns A promise that resolves to true if the word exists, false otherwise
 */
export async function checkWordExists(word: string): Promise<boolean> {
  // Clean the word first
  const cleanedWord = cleanWord(word);
  if (!cleanedWord) return false;
  
  // Check cache first
  if (wordExistsCache.has(cleanedWord)) {
    return wordExistsCache.get(cleanedWord) || false;
  }
  
  try {
    // Query the database to check if the word exists
    // Use eq instead of ilike for exact matching, and properly format the query
    // Select definition_index instead of id based on the database schema
    const { data, error } = await supabase
      .from('definitions')
      .select('definition_index') // Use definition_index instead of id
      .eq('word', cleanedWord)
      .limit(1);
    
    if (error) {
      console.error('Error in word exists query:', error);
      return false;
    }
    
    const exists = data && data.length > 0;
    
    // Cache the result
    wordExistsCache.set(cleanedWord, exists);
    
    return exists;
  } catch (error) {
    console.error('Error checking if word exists:', error);
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
