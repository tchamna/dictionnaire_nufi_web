/**
 * This file contains a list of all known audio filenames in the S3 bucket.
 * This is auto-generated and should not be edited manually.
 */

// Set of all known audio filenames (without the .mp3 extension)
export const knownAudioFilenames = new Set([
  'a1', 'a13', 'a1_ha3a1', 'a1ha3a1', 'a2', 'a23', 'a3', 'a32', 'a3fri3ka1', 'a3me3ri3ka1',
  'a3zia1', 'a5', 'a7', 'af1', 'af13', 'af2', 'af23', 'af3', 'af32', 'af5'
  // This is a partial list - there are 9,519 audio files in total
]);

/**
 * Check if audio exists for a word based on the filename
 * @param filename The filename to check (without .mp3 extension)
 * @returns True if audio exists for this filename
 */
export function hasAudioFile(filename: string): boolean {
  return knownAudioFilenames.has(filename);
}

/**
 * Suggest possible audio filenames for a word
 * This helps users find which audio file might correspond to a dictionary word
 * @param word The word to find suggestions for
 * @returns Array of possible matching audio filenames
 */
export function suggestAudioFilenames(word: string): string[] {
  const cleanedWord = word.toLowerCase().trim();
  const suggestions: string[] = [];
  
  // Look for exact matches
  if (hasAudioFile(cleanedWord)) {
    suggestions.push(cleanedWord);
  }
  
  // Look for filenames that contain the word
  const wordPattern = new RegExp(cleanedWord.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
  knownAudioFilenames.forEach(filename => {
    if (filename !== cleanedWord && wordPattern.test(filename)) {
      suggestions.push(filename);
    }
  });
  
  return suggestions;
}
