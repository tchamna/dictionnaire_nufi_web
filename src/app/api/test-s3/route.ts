import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
 * GET handler to test S3 connection
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing S3 connection...');
    console.log(`S3 Configuration:`);
    console.log(`- Region: ${process.env.NEXT_PUBLIC_AWS_REGION}`);
    console.log(`- Bucket: ${bucketName}`);
    console.log(`- Access Key ID: ${process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID?.substring(0, 5)}...`);
    
    // List objects in the bucket (max 5)
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 5,
    });

    console.log('Sending ListObjectsV2Command to S3...');
    const response = await s3Client.send(command);
    
    // Return the response
    return NextResponse.json({
      success: true,
      message: 'S3 connection successful',
      bucketName,
      objectCount: response.Contents?.length || 0,
      objects: response.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
      })),
    });
  } catch (error: any) {
    console.error('Error testing S3 connection:', error);
    
    return NextResponse.json({
      success: false,
      message: 'S3 connection failed',
      error: {
        name: error.name,
        message: error.message,
        code: error.Code,
        requestId: error.$metadata?.requestId,
        httpStatusCode: error.$metadata?.httpStatusCode,
      },
    }, { status: 500 });
  }
}
