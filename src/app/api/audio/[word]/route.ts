import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getAudioFilename, audioMapping } from '@/data/audioMapping';

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Define the params type for route handlers
type RouteParams = { params: { word: string } };

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

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
 * GET handler for audio files
 * This proxies requests to S3 to avoid CORS issues
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  // Extract the word parameter from the URL path
  const { word } = await context.params;
  console.log(`API route called with word parameter: "${word}"`);
  
  try {
    if (!word) {
      console.log('Word parameter is missing');
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Get the audio filename from our mapping
    const decodedWord = decodeURIComponent(word);
    console.log(`Decoded word: "${decodedWord}"`);
    
    // Only log a few mappings for debugging to avoid console spam
    const firstLetter = decodedWord.charAt(0);
    const matchingEntries = Object.entries(audioMapping)
      .filter(([key]) => key.charAt(0) === firstLetter);
    
    console.log(`Found ${matchingEntries.length} mappings starting with '${firstLetter}'`);
    
    // Log just a few examples if there are many
    if (matchingEntries.length > 0) {
      const samplesToLog = matchingEntries.slice(0, 5);
      const mappingSamples = samplesToLog.map(([key, value]) => `"${key}" -> "${value}"`);
      console.log(`Sample mappings: ${mappingSamples.join(', ')}`);
    }
    
    const audioFilename = getAudioFilename(decodedWord);
    console.log(`Audio filename from mapping: ${audioFilename || 'not found'}`);
    
    if (!audioFilename) {
      console.log(`No audio mapping found for word: ${decodedWord}`);
      return NextResponse.json(
        { error: 'Audio not found' },
        { status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    console.log(`🔍 Found audio file: ${audioFilename} for word: ${word}`);
    
    // Check if the file exists in S3 and get its metadata
    const headParams = {
      Bucket: bucketName,
      Key: `${audioFilename}.mp3`,
    };
    
    let headResult;
    try {
      headResult = await s3Client.send(new HeadObjectCommand(headParams));
    } catch (error: any) {
      if (error.name === 'NotFound') {
        console.log(`❌ Audio file not found in S3: ${audioFilename}.mp3`);
        return NextResponse.json(
          { error: 'Audio file not found' },
          { status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      console.error('❌ Error checking S3:', error);
      return NextResponse.json(
        { error: 'Error checking audio file' },
        { status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Get the audio file from S3
    const getObjectParams = {
      Bucket: bucketName,
      Key: `${audioFilename}.mp3`,
    };
    
    const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
    
    if (!Body) {
      console.log(`❌ Empty response body for audio file: ${audioFilename}.mp3`);
      return NextResponse.json(
        { error: 'Empty audio file' },
        { status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Create a response with the audio file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes 0-${buffer.length - 1}/${buffer.length}`,
        ...corsHeaders,
      },
    });
    
  } catch (error) {
    console.error('❌ Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

/**
 * HEAD handler to check if an audio file exists
 */
export async function HEAD(
  request: NextRequest,
  context: RouteParams
) {
  // Extract the word parameter from the URL path
  const { word } = await context.params;
  try {
    if (!word) {
      return new NextResponse(null, { status: 400 });
    }

    // Get the audio filename from our mapping
    const decodedWord = decodeURIComponent(word);
    const audioFilename = getAudioFilename(decodedWord);
    if (!audioFilename) {
      console.log(`No audio mapping found for word: ${decodedWord}`);
      return new NextResponse(null, { status: 404 });
    }
    
    // Construct the S3 key for the audio file (files are in the root of the bucket)
    const key = `${audioFilename}.mp3`;
    console.log(`Checking if audio file exists in S3: ${key}`);

    try {
      // Check if the object exists in S3
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await s3Client.send(command);
      
      // If no error is thrown, the file exists
      console.log(`Audio file exists: ${key}`);
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch (s3Error: any) {
      // If the error is NoSuchKey or access denied, handle appropriately
      if (s3Error.name === 'NoSuchKey' || s3Error.Code === 'NoSuchKey') {
        console.log(`Audio file does not exist: ${key}`);
        return new NextResponse(null, { status: 404 });
      } else if (s3Error.$metadata?.httpStatusCode === 403) {
        // For permission issues, we'll try to handle it gracefully
        console.log(`Permission denied for audio file: ${key}`);
        // Return a 404 instead of 403 to avoid confusing the client
        return new NextResponse(null, { status: 404 });
      }
      
      // For other errors, log and return a 500
      console.error(`S3 error checking audio file: ${key}`, s3Error);
      return new NextResponse(null, { status: 500 });
    }
  } catch (error) {
    console.error('Error in HEAD handler:', error);
    return new NextResponse(null, { status: 500 });
  }
}
