/**
 * This file provides mapping between dictionary words and their corresponding audio filenames.
 * Since the audio files use a different naming convention than the dictionary words,
 * we need this mapping to connect them.
 */

// Map from dictionary words to audio filenames
// This is a starting point and should be expanded with more mappings
export const wordToAudioMap: Record<string, string> = {
  // Example mappings (these are hypothetical and should be replaced with actual mappings)
  'africa': 'a3fri3ka1',
  'america': 'a3me3ri3ka1',
  'asia': 'a3zia1',
  // Add more mappings as they are identified
};

/**
 * Get the audio filename for a dictionary word
 * @param word The dictionary word to get audio for
 * @returns The audio filename if available, or null if no mapping exists
 */
export function getAudioFilename(word: string): string | null {
  const cleanedWord = word.toLowerCase().trim();
  
  // Check if we have a direct mapping
  if (wordToAudioMap[cleanedWord]) {
    return wordToAudioMap[cleanedWord];
  }
  
  // If no mapping exists, return null
  return null;
}

/**
 * Check if a dictionary word has a corresponding audio file
 * @param word The dictionary word to check
 * @returns True if the word has a corresponding audio file, false otherwise
 */
export function hasAudioMapping(word: string): boolean {
  return getAudioFilename(word) !== null;
}

/**
 * This function attempts to convert a dictionary word to its likely audio filename
 * based on patterns observed in the audio files.
 * This is a fallback when no explicit mapping exists.
 * 
 * @param word The dictionary word to convert
 * @returns A possible audio filename, or null if conversion isn't possible
 */
export function guessAudioFilename(word: string): string | null {
  const cleanedWord = word.toLowerCase().trim();
  
  // We don't have enough information to implement a reliable algorithm yet
  // This function should be implemented once patterns are better understood
  
  return null;
}
