// Script to test audio functionality by checking if specific words have audio
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

// Initialize the S3 client with credentials from .env.local
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

// Bucket name from environment variable
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

// List of words to test (based on examples we saw in the S3 bucket)
const wordsToTest = [
  'a1', 'a13', 'a1ha3a1', 'a3fri3ka1', 'a3me3ri3ka1', 'a3zia1',
  // Add some words that might be in your dictionary
  'ma', 'mba', 'ba', 'ka', 'ta', 'sa'
];

// Function to check if audio exists for a word
async function checkAudioExists(word) {
  try {
    // Construct the S3 key for the audio file (now in root directory)
    const key = `${word}.mp3`;
    
    // Create the command to check if the object exists
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    try {
      // Send the command
      await s3Client.send(command);
      return true; // If no error is thrown, the file exists
    } catch (s3Error) {
      // If the error is NoSuchKey, the file doesn't exist
      if (s3Error.name === 'NotFound' || s3Error.name === 'NoSuchKey' || s3Error.Code === 'NoSuchKey') {
        return false;
      }
      
      // For other errors, log and rethrow
      console.error(`S3 error checking audio file: ${key}`, s3Error);
      throw s3Error;
    }
  } catch (error) {
    console.error(`Error checking if audio exists for word: ${word}`, error);
    return false;
  }
}

// Main function to test audio functionality
async function testAudio() {
  console.log(`Testing audio functionality for ${wordsToTest.length} words...`);
  console.log(`S3 Bucket: ${bucketName}`);
  
  const results = {
    withAudio: [],
    withoutAudio: []
  };
  
  // Check each word
  for (const word of wordsToTest) {
    const hasAudio = await checkAudioExists(word);
    console.log(`Word "${word}": ${hasAudio ? '✅ Has audio' : '❌ No audio'}`);
    
    if (hasAudio) {
      results.withAudio.push(word);
    } else {
      results.withoutAudio.push(word);
    }
  }
  
  // Print summary
  console.log('\nSummary:');
  console.log(`Words with audio (${results.withAudio.length}): ${results.withAudio.join(', ')}`);
  console.log(`Words without audio (${results.withoutAudio.length}): ${results.withoutAudio.join(', ')}`);
  
  return results;
}

// Run the test
testAudio()
  .then(() => console.log('\nAudio test completed'))
  .catch(err => console.error('Error testing audio:', err));
