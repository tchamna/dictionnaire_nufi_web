// Script to update .env.local file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

// Read the existing .env.local file
fs.readFile(envPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading .env.local file:', err);
    return;
  }

  // Check if S3_BUCKET_NAME already exists
  if (!data.includes('NEXT_PUBLIC_S3_BUCKET_NAME=')) {
    // Add the S3 bucket name
    const updatedData = data + '\nNEXT_PUBLIC_S3_BUCKET_NAME=dictionnaire-nufi-audio\n';
    
    // Write the updated content back to the file
    fs.writeFile(envPath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to .env.local file:', err);
        return;
      }
      console.log('Successfully added S3 bucket name to .env.local file');
    });
  } else {
    console.log('S3 bucket name already exists in .env.local file');
  }
});
