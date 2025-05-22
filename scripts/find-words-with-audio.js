// Script to find which words in the dictionary have corresponding audio files
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket name from environment variable
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

// Clean a word similar to how it's done in the application
function cleanWord(word) {
  if (!word) return '';
  // First trim and lowercase the word
  let cleaned = word.trim().toLowerCase();
  // Only remove punctuation from beginning and end, preserving internal characters
  cleaned = cleaned.replace(/^[.,;:!?()[\]{}'"«»""''\s]+|[.,;:!?()[\]{}'"«»""''\s]+$/g, '');
  return cleaned;
}

// Get audio files from S3
async function getAudioFiles() {
  console.log(`Getting audio files from S3 bucket: ${bucketName}`);
  
  try {
    let audioFiles = [];
    let continuationToken = undefined;
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });
      
      const response = await s3Client.send(command);
      
      if (response.Contents && response.Contents.length > 0) {
        // Filter for MP3 files
        const mp3Files = response.Contents
          .filter(item => item.Key.toLowerCase().endsWith('.mp3'))
          .map(item => {
            // Extract the word from the filename (remove .mp3)
            const key = item.Key;
            return key.replace(/\.mp3$/i, '');
          });
        
        audioFiles = [...audioFiles, ...mp3Files];
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    console.log(`Found ${audioFiles.length} audio files`);
    return audioFiles;
  } catch (error) {
    console.error('Error getting audio files:', error);
    return [];
  }
}

// Get words from the dictionary
async function getDictionaryWords() {
  console.log('Getting words from the dictionary...');
  
  try {
    const { data, error } = await supabase
      .from('definitions')
      .select('word')
      .order('word');
    
    if (error) {
      console.error('Error getting dictionary words:', error);
      return [];
    }
    
    // Extract unique words
    const words = [...new Set(data.map(item => cleanWord(item.word)))];
    console.log(`Found ${words.length} unique words in the dictionary`);
    
    return words;
  } catch (error) {
    console.error('Error getting dictionary words:', error);
    return [];
  }
}

// Compare dictionary words with audio files
async function compareWordsWithAudio() {
  try {
    // Get audio files and dictionary words
    const audioFiles = await getAudioFiles();
    const dictionaryWords = await getDictionaryWords();
    
    if (!audioFiles.length || !dictionaryWords.length) {
      console.log('No audio files or dictionary words found');
      return;
    }
    
    // Create sets for faster lookups
    const audioSet = new Set(audioFiles);
    
    // Find words with and without audio
    const wordsWithAudio = [];
    const wordsWithoutAudio = [];
    
    for (const word of dictionaryWords) {
      if (audioSet.has(word)) {
        wordsWithAudio.push(word);
      } else {
        wordsWithoutAudio.push(word);
      }
    }
    
    // Find audio files without corresponding dictionary words
    const audioWithoutWords = audioFiles.filter(audio => !dictionaryWords.includes(audio));
    
    // Print results
    console.log('\nResults:');
    console.log(`Dictionary words with audio: ${wordsWithAudio.length} (${((wordsWithAudio.length / dictionaryWords.length) * 100).toFixed(2)}%)`);
    console.log(`Dictionary words without audio: ${wordsWithoutAudio.length} (${((wordsWithoutAudio.length / dictionaryWords.length) * 100).toFixed(2)}%)`);
    console.log(`Audio files without dictionary words: ${audioWithoutWords.length}`);
    
    // Print examples
    console.log('\nExamples of dictionary words with audio:');
    console.log(wordsWithAudio.slice(0, 20).join(', '));
    
    console.log('\nExamples of dictionary words without audio:');
    console.log(wordsWithoutAudio.slice(0, 20).join(', '));
    
    console.log('\nExamples of audio files without dictionary words:');
    console.log(audioWithoutWords.slice(0, 20).join(', '));
    
    // Output data for use in the application
    console.log('\nGenerating code snippet for known audio words...');
    console.log('const knownAudioWords = new Set([');
    
    // Format in chunks of 5 words per line
    const chunks = [];
    for (let i = 0; i < wordsWithAudio.length; i += 5) {
      chunks.push(wordsWithAudio.slice(i, i + 5).map(w => `'${w}'`).join(', '));
    }
    
    console.log('  ' + chunks.join(',\n  '));
    console.log(']);');
    
    return {
      wordsWithAudio,
      wordsWithoutAudio,
      audioWithoutWords
    };
  } catch (error) {
    console.error('Error comparing words with audio:', error);
  }
}

// Run the main function
compareWordsWithAudio()
  .then(() => console.log('\nDone!'))
  .catch(err => console.error('Error:', err));
