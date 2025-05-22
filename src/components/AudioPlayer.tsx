import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cleanWord } from '@/lib/textRenderer';
import { getAudioFilename, hasAudio } from '@/data/audioMapping';

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
      
      // Check if we have audio for this word
      if (!hasAudio(cleanedWord)) {
        console.log(`No audio available for "${cleanedWord}"`);
        setHasError(true);
        return;
      }
      
      // If we already have a URL cached, use it
      if (!audioUrlRef.current) {
        // Get the audio filename from our mapping
        const audioFilename = getAudioFilename(cleanedWord);
        if (!audioFilename) {
          console.log(`No audio filename found for "${cleanedWord}"`);
          setHasError(true);
          return;
        }
        
        // Construct the direct S3 URL
        const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
        const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'dictionnaire-nufi-audio';
        
        // Try using the CloudFront distribution URL if available
        if (process.env.NEXT_PUBLIC_CLOUDFRONT_URL) {
          audioUrlRef.current = `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${audioFilename}.mp3`;
        } else {
          // Fallback to direct S3 URL
          audioUrlRef.current = `https://${bucket}.s3.${region}.amazonaws.com/${audioFilename}.mp3`;
        }
        
        console.log(`Playing audio from URL: ${audioUrlRef.current}`);
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
