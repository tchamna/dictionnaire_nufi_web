import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

// Bucket name from environment variable
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

/**
 * Get a URL for an audio file using our API proxy
 * @param key The key (path) of the audio file in the S3 bucket
 * @returns A promise that resolves to the API URL
 */
export async function getAudioUrl(key: string): Promise<string> {
  try {
    // Extract the word from the key (remove 'audio/words/' prefix and '.mp3' suffix)
    const wordMatch = key.match(/audio\/words\/(.+)\.mp3$/);
    if (!wordMatch || !wordMatch[1]) {
      throw new Error(`Invalid audio key format: ${key}`);
    }
    
    const word = wordMatch[1];
    // Use our API route instead of direct S3 access to avoid CORS issues
    return `/api/audio/${encodeURIComponent(word)}`;
  } catch (error) {
    console.error('Error generating audio URL:', error);
    throw error;
  }
}

/**
 * Construct the S3 key for a word's audio file
 * @param word The word to get audio for
 * @returns The S3 key for the audio file
 */
export function getAudioKeyForWord(word: string): string {
  // Customize this based on your S3 bucket structure
  // Example: audio/words/example.mp3
  return `audio/words/${word.toLowerCase().trim()}.mp3`;
}

/**
 * Check if audio exists for a word using our API proxy
 * @param word The word to check audio for
 * @returns A promise that resolves to true if audio exists, false otherwise
 */
export async function checkAudioExists(word: string): Promise<boolean> {
  try {
    const cleanedWord = word.toLowerCase().trim();
    
    // Use our API route with HEAD request to check if audio exists
    const response = await fetch(`/api/audio/${encodeURIComponent(cleanedWord)}`, {
      method: 'HEAD',
    });
    
    return response.ok; // If status is 200, the audio exists
  } catch (error) {
    // For errors, log them but assume the audio doesn't exist
    console.error('Error checking if audio exists:', error);
    return false;
  }
}

// Cache for audio existence to reduce API calls
const audioExistsCache = new Map<string, boolean>();

/**
 * Check if audio exists for a word, using cache when possible
 * @param word The word to check audio for
 * @returns A promise that resolves to true if audio exists, false otherwise
 */
export async function checkAudioExistsCached(word: string): Promise<boolean> {
  const cleanedWord = word.toLowerCase().trim();
  
  // Check cache first
  if (audioExistsCache.has(cleanedWord)) {
    return audioExistsCache.get(cleanedWord) || false;
  }
  
  // Check if audio exists
  const exists = await checkAudioExists(cleanedWord);
  
  // Cache the result
  audioExistsCache.set(cleanedWord, exists);
  
  return exists;
}
