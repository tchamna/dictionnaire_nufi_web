import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { applyClafricaMapping } from '../src/lib/clafricaMapping';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_AWS_REGION',
  'NEXT_PUBLIC_AWS_ACCESS_KEY_ID',
  'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY',
  'NEXT_PUBLIC_S3_BUCKET_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
  maxAttempts: 3,
});

const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;

// Cache for S3 files
let s3Files: Set<string> | null = null;

/**
 * Get all unique words from the database
 */
async function getAllWordsFromDatabase(): Promise<string[]> {
  console.log('Fetching all words from database...');
  
  try {
    // Get words from definitions table
    const { data: definitions, error: defError } = await supabase
      .from('definitions')
      .select('word');
    
    if (defError) throw defError;
    
    // Get words from examples table
    const { data: examples, error: exError } = await supabase
      .from('examples')
      .select('native_text');
    
    if (exError) throw exError;
    
    // Combine and get unique words
    const allWords = new Set<string>();
    
    // Process definitions
    definitions?.forEach((def: { word: string }) => {
      if (def.word) {
        // Split words by spaces and non-word characters
        const words = def.word.split(/\s+/);
        words.forEach(word => {
          const cleanWord = word.replace(/[^\w']/g, '').toLowerCase().trim();
          if (cleanWord) allWords.add(cleanWord);
        });
      }
    });
    
    // Process examples
    examples?.forEach((ex: { native_text: string }) => {
      if (ex.native_text) {
        const words = ex.native_text.split(/\s+/);
        words.forEach(word => {
          const cleanWord = word.replace(/[^\w']/g, '').toLowerCase().trim();
          if (cleanWord) allWords.add(cleanWord);
        });
      }
    });
    
    console.log(`Found ${allWords.size} unique words in database`);
    return Array.from(allWords);
    
  } catch (error) {
    console.error('Error fetching words from database:', error);
    throw error;
  }
}

/**
 * Get all audio files from S3 bucket
 */
async function getS3AudioFiles(): Promise<Set<string>> {
  if (s3Files) return s3Files;
  
  console.log('Fetching audio files from S3...');
  const files = new Set<string>();
  let continuationToken: string | undefined;
  
  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      
      const response = await s3Client.send(command);
      
      if (response.Contents) {
        response.Contents.forEach(item => {
          if (item.Key) {
            // Remove .mp3 extension and add to set
            const fileName = item.Key.replace(/\.mp3$/i, '');
            files.add(fileName);
          }
        });
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    console.log(`Found ${files.size} audio files in S3`);
    s3Files = files;
    return files;
    
  } catch (error) {
    console.error('Error fetching files from S3:', error);
    throw error;
  }
}

/**
 * Check if a word has audio in S3 (with Clafrica mapping)
 */
async function checkWordAudio(word: string, s3Files: Set<string>): Promise<boolean> {
  // Apply Clafrica mapping to the word
  const mappedWord = applyClafricaMapping(word);
  
  // Check if the mapped word exists in S3
  return s3Files.has(mappedWord);
}

/**
 * Main function to verify audio coverage
 */
async function verifyAudioCoverage() {
  try {
    // Get all words and S3 files in parallel
    const [words, s3Files] = await Promise.all([
      getAllWordsFromDatabase(),
      getS3AudioFiles()
    ]);
    
    console.log('Verifying audio coverage...');
    
    // Check each word
    const results = {
      totalWords: words.length,
      withAudio: 0,
      withoutAudio: 0,
      wordsWithAudio: [] as string[],
      wordsWithoutAudio: [] as string[],
    };
    
    for (const word of words) {
      const hasAudio = await checkWordAudio(word, s3Files);
      
      if (hasAudio) {
        results.withAudio++;
        results.wordsWithAudio.push(word);
      } else {
        results.withoutAudio++;
        results.wordsWithoutAudio.push(word);
      }
      
      // Log progress
      if ((results.withAudio + results.withoutAudio) % 100 === 0) {
        console.log(`Processed ${results.withAudio + results.withoutAudio} of ${words.length} words...`);
      }
    }
    
    // Generate report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(process.cwd(), 'reports');
    const reportPath = path.join(reportDir, `audio-coverage-${timestamp}.json`);
    
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Save report
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log('\n=== Audio Coverage Report ===');
    console.log(`Total words: ${results.totalWords}`);
    console.log(`Words with audio: ${results.withAudio} (${(results.withAudio / results.totalWords * 100).toFixed(2)}%)`);
    console.log(`Words without audio: ${results.withoutAudio} (${(results.withoutAudio / results.totalWords * 100).toFixed(2)}%)`);
    console.log(`\nReport saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error verifying audio coverage:', error);
    process.exit(1);
  }
}

// Run the script
verifyAudioCoverage();
