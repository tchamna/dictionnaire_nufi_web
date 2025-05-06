import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

// Define the params type for route handlers
type RouteParams = { params: { word: string } };

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
  const { word } = context.params;
  try {
    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Construct the S3 key for the audio file
    const key = `audio/words/${decodeURIComponent(word)}.mp3`;
    console.log(`Fetching audio file: ${key}`);

    try {
      // Get the object from S3
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      // If we have a body, stream it to the response
      if (response.Body) {
        // Convert the readable stream to a buffer
        const chunks: Uint8Array[] = [];
        const stream = response.Body as Readable;
        
        for await (const chunk of stream) {
          chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
        }
        
        const buffer = Buffer.concat(chunks);
        console.log(`Successfully fetched audio file: ${key}, size: ${buffer.length} bytes`);
        
        // Return the audio file with appropriate headers
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            'Access-Control-Allow-Origin': '*', // Allow CORS
          },
        });
      }

      console.log(`Audio file has no body: ${key}`);
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    } catch (s3Error: any) {
      // If the error is NoSuchKey, the file doesn't exist
      if (s3Error.name === 'NoSuchKey' || s3Error.Code === 'NoSuchKey') {
        console.log(`Audio file does not exist: ${key}`);
        return NextResponse.json(
          { error: 'Audio file not found' },
          { status: 404 }
        );
      }
      
      // For other errors, log and return a 500
      console.error(`S3 error fetching audio file: ${key}`, s3Error);
      return NextResponse.json(
        { error: 'Failed to fetch audio file from S3' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
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
  const { word } = context.params;
  try {
    if (!word) {
      return new NextResponse(null, { status: 400 });
    }

    // Construct the S3 key for the audio file
    const key = `audio/words/${decodeURIComponent(word)}.mp3`;
    console.log(`Checking if audio file exists: ${key}`);

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
      // If the error is NoSuchKey, the file doesn't exist
      if (s3Error.name === 'NoSuchKey' || s3Error.Code === 'NoSuchKey') {
        console.log(`Audio file does not exist: ${key}`);
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
