'use client';

import { useState, useEffect } from 'react';
import { checkAudioExistsCached, playAudioForWord } from '@/services/audioService';
import { hasAudio, getAudioFilename } from '@/data/audioMapping';

type TestResult = {
  hasAudio: boolean;
  audioFilename?: string;
  error?: string;
  timestamp?: number;
  isPlaying?: boolean;
};

export default function AudioTestPage() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isPlayingQueue, setIsPlayingQueue] = useState(false);
  
  // Sample words to test with
  const sampleWordsList = [
    'á', 'à', 'ǎ', 'ā', 'ɑ́', 'ɑ̀',
    'āfrīkà', 'āmērīkà', 'āzìà',
    'bà', 'bǎ', 'bā', 'bɑ́', 'bɑ̂', 'bɑ̌', 'bɑ̄',
    'mba', 'ma',
  ];

  // Load recent words from localStorage on mount
  useEffect(() => {
    const savedRecentWords = localStorage.getItem('recentAudioTestWords');
    if (savedRecentWords) {
      try {
        const words = JSON.parse(savedRecentWords);
        if (Array.isArray(words)) {
          setRecentWords(words);
        }
      } catch (e) {
        console.error('Failed to load recent words', e);
      }
    }
  }, []);

  // Add a word to recent words
  const addToRecentWords = (newWord: string) => {
    if (!newWord.trim()) return;
    
    const normalizedWord = newWord.trim().toLowerCase();
    setRecentWords(prev => {
      // Remove the word if it already exists
      const updated = prev.filter(w => w.toLowerCase() !== normalizedWord);
      // Add to the beginning of the array
      updated.unshift(normalizedWord);
      // Keep only the last 10 words
      const recent = updated.slice(0, 10);
      // Save to localStorage
      localStorage.setItem('recentAudioTestWords', JSON.stringify(recent));
      return recent;
    });
  };

  // Add a test result message
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  // Process the audio queue
  const processAudioQueue = async () => {
    if (audioQueue.length === 0 || isPlayingQueue) return;
    
    setIsPlayingQueue(true);
    const wordToPlay = audioQueue[0];
    
    try {
      setWord(wordToPlay);
      addResult(`Processing audio queue - Playing: "${wordToPlay}"`);
      
      // Check if the word has audio according to our mapping
      const hasAudioMapping = hasAudio(wordToPlay);
      const audioFilename = getAudioFilename(wordToPlay);
      
      if (hasAudioMapping && audioFilename) {
        addToRecentWords(wordToPlay);
        await handlePlayAudio();
      }
      
      // Wait for a short delay between audio files
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error('Error processing audio queue:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`Queue error: ${errorMessage}`);
    } finally {
      // Remove the played word from the queue
      setAudioQueue(prev => prev.slice(1));
      setIsPlayingQueue(false);
    }
  };

  // Process queue when it changes
  useEffect(() => {
    if (audioQueue.length > 0 && !isPlayingQueue) {
      processAudioQueue();
    }
  }, [audioQueue, isPlayingQueue]);

  const testWord = async (wordToTest: string, autoPlay = true) => {
    if (!wordToTest.trim()) return;
    
    setWord(wordToTest);
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult(`Testing word: "${wordToTest}"`);
      
      // Check if the word has audio according to our mapping
      const hasAudioMapping = hasAudio(wordToTest);
      addResult(`Has audio mapping: ${hasAudioMapping}`);
      
      // Get the audio filename from our mapping
      const audioFilename = getAudioFilename(wordToTest);
      addResult(`Audio filename: ${audioFilename || 'not found'}`);
      
      // Check if audio exists using our cached service
      const audioExists = await checkAudioExistsCached(wordToTest);
      addResult(`Audio exists (cached check): ${audioExists}`);
      
      // Update the result state
      const result = { 
        hasAudio: audioExists,
        audioFilename: audioFilename || undefined,
        timestamp: Date.now()
      };
      setResult(result);
      
      // Add to recent words if audio exists
      if (audioExists) {
        addToRecentWords(wordToTest);
        
        // Add to audio queue instead of playing directly
        if (autoPlay) {
          setAudioQueue(prev => [...prev, wordToTest]);
        }
      }
    } catch (error) {
      console.error('Error testing word:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult(`Error: ${errorMessage}`);
      setResult({ 
        hasAudio: false, 
        error: errorMessage,
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!word.trim()) return;
    
    setIsPlaying(true);
    setResult(prev => ({
      ...prev,
      hasAudio: prev?.hasAudio ?? false,
      isPlaying: true,
      error: undefined,
      audioFilename: prev?.audioFilename,
      timestamp: prev?.timestamp ?? Date.now()
    }));
    
    try {
      const success = await playAudioForWord(word);
      
      if (!success) {
        throw new Error('Failed to play audio: Unknown error');
      }
      
      // Add to recent words if playback was successful
      addToRecentWords(word);
    } catch (error) {
      console.error('Error playing audio:', error);
      setResult(prev => ({
        ...prev,
        hasAudio: false, 
        error: error instanceof Error ? error.message : 'Failed to play audio',
        timestamp: Date.now(),
        isPlaying: false,
        audioFilename: prev?.audioFilename
      }));
    } finally {
      setIsPlaying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      testWord(word);
    }
  };

  const handleWordClick = (clickedWord: string) => {
    // Add to queue instead of playing immediately
    setAudioQueue(prev => [...prev, clickedWord]);
    testWord(clickedWord, false); // Don't auto-play here, let the queue handle it
  };

  const testWords = [
    'a', 'e', 'i', 'o', 'u',
    'mama', 'tata', 'mwana', 'nzila', 'moto',
    'africa', 'nkanda', 'ntoto', 'nzambi'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Audio Playback Tester</h1>
        <p className="text-gray-600 mb-6">Test audio playback for dictionary words</p>
        
        <form onSubmit={(e) => { e.preventDefault(); testWord(word); }} className="mb-8">
          {/* Rest of your JSX remains the same */}
          {/* ... */}
        </form>

        {/* Debug output */}
        {testResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="font-medium mb-2">Debug Output:</h3>
            <div className="space-y-1 text-sm">
              {testResults.map((msg, i) => (
                <div key={i} className="font-mono">{msg}</div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Test Words</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sampleWordsList.map((testWord) => (
                <button
                  key={testWord}
                  onClick={() => handleWordClick(testWord)}
                  className="p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-gray-700 hover:text-blue-600 transition-colors text-left truncate"
                  title={`Test word: ${testWord}`}
                >
                  {testWord}
                </button>
              ))}
            </div>
          </div>

          {recentWords.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Recently Tested</h2>
              <div className="flex flex-wrap gap-2">
                {recentWords.map((recentWord) => (
                  <button
                    key={recentWord}
                    onClick={() => handleWordClick(recentWord)}
                    className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200 text-blue-700 hover:text-blue-800 transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                    {recentWord}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">About</h2>
          <div className="prose prose-sm text-gray-600">
            <p>
              This tool helps you test audio playback for words in the dictionary.
              It checks if an audio file exists for a given word and allows you to play it.
            </p>
            <p className="mt-2">
              <strong>Note:</strong> Some words might have different pronunciations or variations.
              If a word doesn't play, try checking the spelling or try a different variation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}