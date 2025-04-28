import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getAudioUrl, getAudioKeyForWord } from '@/services/audioService';
import { cleanWord } from '@/lib/clafricaMapping';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ClickableWordProps {
  word: string;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: (word: string) => void;
  showLoader?: boolean;
}

export function ClickableWord({
  word,
  className = '',
  onClick,
  onDoubleClick,
  showLoader = true
}: ClickableWordProps) {
  const router = useRouter();
  const [isInDictionary, setIsInDictionary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string>('');

  useEffect(() => {
    // Create audio element when component mounts
    audioRef.current = new Audio();
    
    // Set up event listeners
    const audio = audioRef.current;
    
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
      setHasError(true);
      setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    
    // Clean up event listeners
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);
  
  // Reset the audio URL when the word changes
  useEffect(() => {
    audioUrlRef.current = '';
    
    // Check if the word exists in dictionary
    const checkDictionary = async () => {
      try {
        const cleanedWord = cleanWord(word);
        if (cleanedWord) {
          // This is a simplified check - in a real implementation,
          // we would use the wordCheckService
          setIsInDictionary(true);
        }
      } catch (error) {
        console.error('Error checking word:', error);
      }
    };
    
    checkDictionary();
  }, [word]);

  // Disabled audio playback for now - will be implemented later
  const playAudio = async () => {
    // Audio playback is disabled until fully implemented
    console.log('Audio playback is currently disabled');
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleClick = () => {
    // Audio playback is disabled for now
    
    // Call the provided onClick handler if it exists
    if (onClick) onClick();
  };
  
  // Handle double-click to navigate to dictionary entry
  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(word);
    } else {
      // Default behavior: navigate to dictionary entry
      const cleanedWord = cleanWord(word);
      if (cleanedWord) {
        router.push(`/dictionary/${encodeURIComponent(cleanedWord)}`);
      }
    }
  };

  return (
    <span 
      className={cn(
        'cursor-pointer inline-flex items-center gap-1',
        isInDictionary ? 'border-b border-dotted border-primary/30' : '',
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={'Double-click to view definition'}
    >
      {word}
    </span>
  );
}
