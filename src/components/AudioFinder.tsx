import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AudioPlayer } from '@/components/AudioPlayer';
import { hasAudioFile, suggestAudioFilenames } from '@/lib/audioFilenames';
import { getAudioKeyForWord } from '@/services/audioService';

interface AudioFinderProps {
  onSelect?: (audioFilename: string) => void;
  className?: string;
}

export function AudioFinder({ onSelect, className = '' }: AudioFinderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);

  // Update suggestions when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    // Small delay to avoid excessive updates while typing
    const timer = setTimeout(() => {
      const results = suggestAudioFilenames(searchTerm);
      setSuggestions(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle selection of an audio file
  const handleSelect = (audioFilename: string) => {
    setSelectedAudio(audioFilename);
    if (onSelect) {
      onSelect(audioFilename);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Audio File Finder</h3>
        <p className="text-sm text-gray-500">
          Enter a word to find matching audio files. This helps identify which words have audio.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a word..."
          className="flex-1"
        />
        <Button 
          variant="outline" 
          onClick={() => setSearchTerm('')}
          disabled={!searchTerm}
        >
          Clear
        </Button>
      </div>

      {loading && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">Searching...</span>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Possible audio files:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((filename) => (
              <div 
                key={filename}
                className={`p-2 border rounded-md flex items-center justify-between ${
                  selectedAudio === filename ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{filename}</span>
                  <AudioPlayer word={filename} size="sm" />
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleSelect(filename)}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchTerm && suggestions.length === 0 && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">No matching audio files found.</span>
        </div>
      )}

      {selectedAudio && (
        <div className="p-3 border rounded-md bg-gray-50">
          <h4 className="text-sm font-medium">Selected Audio:</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono">{selectedAudio}</span>
            <AudioPlayer word={selectedAudio} size="sm" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Audio key: {getAudioKeyForWord(selectedAudio)}
          </p>
        </div>
      )}
    </div>
  );
}
