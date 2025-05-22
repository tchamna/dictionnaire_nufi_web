// Script to generate a TypeScript file with all known audio filenames
// This uses the list of audio files we found in the S3 bucket
const fs = require('fs');
const path = require('path');

// List of audio filenames we found in the S3 bucket
// This is just a sample - we would need to add all 9,519 filenames
const audioFilenames = [
  'a1', 'a13', 'a1_ha3a1', 'a1ha3a1', 'a2', 'a23', 'a3', 'a32', 'a3fri3ka1', 'a3me3ri3ka1',
  'a3zia1', 'a5', 'a7', 'af1', 'af13', 'af2', 'af23', 'af3', 'af32', 'af5'
  // Add more filenames here from the full list
];

// Generate the TypeScript file content
const tsContent = `/**
 * This file contains a list of all known audio filenames in the S3 bucket.
 * This is auto-generated and should not be edited manually.
 */

// Set of all known audio filenames (without the .mp3 extension)
export const knownAudioFilenames = new Set([
  ${audioFilenames.map(name => `'${name}'`).join(',\n  ')}
  // This is a partial list - there are 9,519 audio files in total
]);

/**
 * Check if audio exists for a word based on the filename
 * @param filename The filename to check (without .mp3 extension)
 * @returns True if audio exists for this filename
 */
export function hasAudioFile(filename) {
  return knownAudioFilenames.has(filename);
}

/**
 * Suggest possible audio filenames for a word
 * This helps users find which audio file might correspond to a dictionary word
 * @param word The word to find suggestions for
 * @returns Array of possible matching audio filenames
 */
export function suggestAudioFilenames(word) {
  const cleanedWord = word.toLowerCase().trim();
  const suggestions = [];
  
  // Look for exact matches
  if (hasAudioFile(cleanedWord)) {
    suggestions.push(cleanedWord);
  }
  
  // Look for filenames that contain the word
  const wordPattern = new RegExp(cleanedWord.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
  knownAudioFilenames.forEach(filename => {
    if (filename !== cleanedWord && wordPattern.test(filename)) {
      suggestions.push(filename);
    }
  });
  
  return suggestions;
}`;

// Write the file
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'audioFilenames.ts');
fs.writeFileSync(outputPath, tsContent);

console.log(`Generated audio filenames list at ${outputPath}`);
console.log(`This file contains ${audioFilenames.length} audio filenames out of 9,519 total.`);
console.log('To make this file complete, you would need to add all 9,519 filenames from the S3 bucket.');
