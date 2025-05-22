import React from 'react';
import { AudioFinder } from '@/components/AudioFinder';

export default function AudioFinderPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Audio Finder Tool</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-gray-700">
          This tool helps you find which audio files exist for dictionary words. 
          Since the audio files use a different naming convention than the dictionary words,
          this tool can help you identify the correct audio file for a word.
        </p>
        
        <AudioFinder className="mt-6" />
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">How to Use This Tool</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Enter a dictionary word or part of an audio filename in the search box</li>
          <li>The tool will show you any matching audio files</li>
          <li>Click the audio button to listen to the audio</li>
          <li>Click "Select" to choose that audio file</li>
        </ol>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-md font-medium text-blue-800 mb-2">About Audio Files</h3>
          <p className="text-sm text-blue-700">
            The audio files in this dictionary use a special naming convention that includes
            tone markers and other phonetic information. For example, "a3fri3ka1" might represent
            "Africa" with tone markers. This tool helps bridge the gap between dictionary words
            and their audio file names.
          </p>
        </div>
      </div>
    </div>
  );
}
