// Script to list all words with audio files in the S3 bucket
const { S3Client, ListObjectsV2Command, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

// Print environment variables for debugging (without exposing secrets)
console.log('Environment variables:');
console.log(`- NEXT_PUBLIC_AWS_REGION: ${process.env.NEXT_PUBLIC_AWS_REGION || 'not set'}`);
console.log(`- NEXT_PUBLIC_AWS_ACCESS_KEY_ID: ${process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ? '✓ set' : '✗ not set'}`);
console.log(`- NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY: ${process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ? '✓ set' : '✗ not set'}`);
console.log(`- NEXT_PUBLIC_S3_BUCKET_NAME: ${process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'not set'}`);

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

// List all buckets to verify credentials work
async function listBuckets() {
  try {
    console.log('\nListing all accessible S3 buckets to verify credentials...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    if (response.Buckets && response.Buckets.length > 0) {
      console.log('Available buckets:');
      response.Buckets.forEach(bucket => {
        console.log(`- ${bucket.Name} ${bucket.Name === bucketName ? '(target bucket)' : ''}`);
      });
      
      // Check if our target bucket is in the list
      const bucketExists = response.Buckets.some(bucket => bucket.Name === bucketName);
      if (!bucketExists) {
        console.warn(`⚠️ Warning: Target bucket "${bucketName}" not found in the list of accessible buckets!`);
      }
    } else {
      console.log('No buckets found. Check your AWS credentials and permissions.');
    }
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
}

// List all objects in the bucket to see what's there
async function listAllObjects() {
  console.log(`\nListing ALL objects in bucket: ${bucketName} (no prefix filter)`);
  console.log('This may take a moment depending on how many files are in the bucket...');
  
  try {
    let allPaths = [];
    let continuationToken = undefined;
    
    do {
      // Create the command to list objects
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        MaxKeys: 1000, // Get up to 1000 files at a time
      });
      
      // Send the command
      const response = await s3Client.send(command);
      
      // Process the response
      if (response.Contents && response.Contents.length > 0) {
        // Extract paths
        const paths = response.Contents.map(item => item.Key);
        allPaths = [...allPaths, ...paths];
      }
      
      // Check if there are more objects to fetch
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    // Print the results
    console.log(`\nFound ${allPaths.length} objects in the bucket:`);
    console.log('-----------------------------------');
    if (allPaths.length > 0) {
      // Group paths by directory structure
      const pathsByPrefix = {};
      allPaths.forEach(path => {
        const parts = path.split('/');
        let prefix = parts.length > 1 ? parts[0] : 'root';
        if (!pathsByPrefix[prefix]) {
          pathsByPrefix[prefix] = [];
        }
        pathsByPrefix[prefix].push(path);
      });
      
      // Print summary by prefix
      console.log('Summary by directory:');
      Object.keys(pathsByPrefix).forEach(prefix => {
        console.log(`- ${prefix}: ${pathsByPrefix[prefix].length} files`);
      });
      
      // Print first 20 paths as examples
      console.log('\nFirst 20 paths as examples:');
      allPaths.slice(0, 20).forEach(path => console.log(path));
      
      if (allPaths.length > 20) {
        console.log(`... and ${allPaths.length - 20} more`);
      }
    } else {
      console.log('No objects found in the bucket.');
    }
    console.log('-----------------------------------');
    
    return allPaths;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

// Find audio files with specific patterns
async function findAudioFiles() {
  console.log(`\nSearching for audio files in bucket: ${bucketName}`);
  console.log('Trying different common patterns for audio files...');
  
  const patterns = [
    { prefix: 'audio/', description: 'Standard audio directory' },
    { prefix: 'audio/words/', description: 'Words audio directory' },
    { prefix: 'media/audio/', description: 'Media audio directory' },
    { prefix: 'sounds/', description: 'Sounds directory' },
    { prefix: '', extension: '.mp3', description: 'MP3 files anywhere' },
    { prefix: '', extension: '.wav', description: 'WAV files anywhere' },
  ];
  
  for (const pattern of patterns) {
    try {
      console.log(`\nChecking pattern: ${pattern.description}`);
      
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: pattern.prefix,
        MaxKeys: 1000,
      });
      
      const response = await s3Client.send(command);
      
      if (response.Contents && response.Contents.length > 0) {
        // Filter by extension if specified
        let matchingFiles = response.Contents;
        if (pattern.extension) {
          matchingFiles = matchingFiles.filter(item => 
            item.Key.toLowerCase().endsWith(pattern.extension)
          );
        }
        
        console.log(`Found ${matchingFiles.length} matching files`);
        
        if (matchingFiles.length > 0) {
          // Show first 10 examples
          console.log('Examples:');
          matchingFiles.slice(0, 10).forEach(item => console.log(`- ${item.Key}`));
          
          if (matchingFiles.length > 10) {
            console.log(`... and ${matchingFiles.length - 10} more`);
          }
          
          // If these are likely word audio files, extract the words
          if (pattern.prefix.includes('audio') || pattern.prefix.includes('words') || pattern.extension === '.mp3') {
            const words = matchingFiles.map(item => {
              const key = item.Key;
              // Try different patterns to extract word
              const patterns = [
                /audio\/words\/(.+)\.mp3$/,
                /audio\/(.+)\.mp3$/,
                /sounds\/(.+)\.mp3$/,
                /\/(.+)\.mp3$/,
                /(.+)\.mp3$/
              ];
              
              for (const regex of patterns) {
                const match = key.match(regex);
                if (match && match[1]) return match[1];
              }
              return null;
            }).filter(Boolean);
            
            if (words.length > 0) {
              console.log(`\nExtracted ${words.length} word names from audio files:`);
              words.slice(0, 20).forEach(word => console.log(word));
              if (words.length > 20) {
                console.log(`... and ${words.length - 20} more`);
              }
            }
          }
        }
      } else {
        console.log('No matching files found');
      }
    } catch (error) {
      console.error(`Error checking pattern ${pattern.description}:`, error);
    }
  }
}

// Main function
async function main() {
  try {
    // First verify credentials by listing buckets
    await listBuckets();
    
    // Then list all objects to see what's in the bucket
    await listAllObjects();
    
    // Finally try to find audio files with different patterns
    await findAudioFiles();
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main();
