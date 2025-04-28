import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cleanWord } from '@/lib/textRenderer';
import { getAudioUrl, getAudioKeyForWord } from '@/services/audioService';

interface AudioPlayerProps {
  word: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
}

export function AudioPlayer({ 
  word, 
  size = 'md', 
  variant = 'ghost',
  className = ''
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  }, [word]);

  const playAudio = async () => {
    if (!audioRef.current) return;
    
    // Reset states on new play attempt
    setHasError(false);
    setIsLoading(true);
    
    try {
      // Get the cleaned word
      const cleanedWord = cleanWord(word);
      
      // If we already have a URL cached and it's for the same word, use it
      if (!audioUrlRef.current) {
        // Get the S3 key for the audio file
        const audioKey = getAudioKeyForWord(cleanedWord);
        
        // Get a presigned URL from S3
        audioUrlRef.current = await getAudioUrl(audioKey);
      }
      
      // Set source and play
      audioRef.current.src = audioUrlRef.current;
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setHasError(true);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleClick = () => {
    if (isLoading) return; // Prevent clicks while loading
    
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  // Determine button size
  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  
  // Determine icon size
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={handleClick}
      className={className}
      disabled={hasError}
      title={hasError ? 'Audio not available' : isPlaying ? 'Stop audio' : 'Play pronunciation'}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : hasError ? (
        <VolumeX className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
    </Button>
  );
}
