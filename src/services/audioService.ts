import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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
 * Get a presigned URL for an audio file in S3
 * @param key The key (path) of the audio file in the S3 bucket
 * @param expiresIn Time in seconds until the presigned URL expires (default: 3600 seconds = 1 hour)
 * @returns A promise that resolves to the presigned URL
 */
export async function getAudioUrl(key: string, expiresIn = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
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
