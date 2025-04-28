import React, { useState, useEffect } from 'react';
import { getAudioUrl, getAudioKeyForWord } from '@/services/audioService';
import { Loader2 } from 'lucide-react';
import { checkWordExists, preloadWordExistence } from '@/services/wordCheckService';

/**
 * Renders text with special tags processed and clickable words
 * @param text The text to render with tags
 * @param playAudio Function to play audio when a word is clicked
 * @param onWordDoubleClick Function to handle double click on a word
 * @returns React elements with properly formatted text
 */
export const renderClickableText = (text: string, playAudio?: (word: string) => void, onWordDoubleClick?: (word: string) => void) => {
  if (!text) return null;
  
  // Split text by tags and keep the tags as part of the tokens
  const tokens = text.split(/(<tag_def>|<\/tag_def>|<b>|<\/b>|<br>|<\/br>|<br\s*\/>|<i>|<\/i>|<u>|<\/u>|<st>|<\/st>|<sup>|<\/sup>|<sub>|<\/sub>|<span[^>]*>|<\/span>|\.\.\.)/);
  
  let inTagDef = false;
  let inBold = false;
  let inItalic = false;
  let inUnderline = false;
  let inStrikethrough = false;
  let inSuperscript = false;
  let inSubscript = false;
  let inSpan = false;
  
  return tokens.map((token, index) => {
    // Track tag state
    if (token === "<tag_def>") inTagDef = true;
    else if (token === "</tag_def>") inTagDef = false;
    else if (token === "<b>") inBold = true;
    else if (token === "</b>") inBold = false;
    else if (token === "<i>") inItalic = true;
    else if (token === "</i>") inItalic = false;
    else if (token === "<u>") inUnderline = true;
    else if (token === "</u>") inUnderline = false;
    else if (token === "<st>") inStrikethrough = true;
    else if (token === "</st>") inStrikethrough = false;
    else if (token === "<sup>") inSuperscript = true;
    else if (token === "</sup>") inSuperscript = false;
    else if (token === "<sub>") inSubscript = true;
    else if (token === "</sub>") inSubscript = false;
    else if (token.startsWith("<span")) inSpan = true;
    else if (token === "</span>") inSpan = false;
    
    // Handle specific tags as React components
    if (token === "<tag_def>") {
      return <React.Fragment key={`${index}-open-tag-def`}></React.Fragment>;
    }
    
    if (token === "</tag_def>") {
      return <React.Fragment key={`${index}-close-tag-def`}></React.Fragment>;
    }
    
    if (token === "<b>") {
      return <React.Fragment key={`${index}-open-bold`}></React.Fragment>;
    }
    
    if (token === "</b>") {
      return <React.Fragment key={`${index}-close-bold`}></React.Fragment>;
    }
    
    if (token === "<i>") {
      return <React.Fragment key={`${index}-open-italic`}></React.Fragment>;
    }
    
    if (token === "</i>") {
      return <React.Fragment key={`${index}-close-italic`}></React.Fragment>;
    }
    
    if (token === "<u>") {
      return <React.Fragment key={`${index}-open-underline`}></React.Fragment>;
    }
    
    if (token === "</u>") {
      return <React.Fragment key={`${index}-close-underline`}></React.Fragment>;
    }
    
    if (token === "<br>" || token === "</br>" || token === "<br />") {
      return <br key={`${index}-br`} />;
    }
    
    if (token === "<st>") {
      return <React.Fragment key={`${index}-open-strike`}></React.Fragment>;
    }
    
    if (token === "</st>") {
      return <React.Fragment key={`${index}-close-strike`}></React.Fragment>;
    }
    
    if (token === "<sup>") {
      return <React.Fragment key={`${index}-open-sup`}></React.Fragment>;
    }
    
    if (token === "</sup>") {
      return <React.Fragment key={`${index}-close-sup`}></React.Fragment>;
    }
    
    if (token === "<sub>") {
      return <React.Fragment key={`${index}-open-sub`}></React.Fragment>;
    }
    
    if (token === "</sub>") {
      return <React.Fragment key={`${index}-close-sub`}></React.Fragment>;
    }
    
    if (token.startsWith("<span")) {
      return <React.Fragment key={`${index}-open-span`}></React.Fragment>;
    }
    
    if (token === "</span>") {
      return <React.Fragment key={`${index}-close-span`}></React.Fragment>;
    }
    
    // Skip rendering content inside tag_def tags
    if (inTagDef) {
      return null;
    }
    
    // For regular text, apply formatting based on current tag state
    let className = '';
    if (inBold) className += 'font-bold ';
    if (inItalic) className += 'italic ';
    if (inUnderline) className += 'underline ';
    if (inStrikethrough) className += 'line-through ';
    if (inSuperscript) className += 'text-xs align-super ';
    if (inSubscript) className += 'text-xs align-sub ';
    
    // For regular text, make it clickable if needed
    if (token.trim() && !token.match(/^[.,;:!?()[\]{}'"«»""'']+$/)) {
      return <ClickableWordInline 
        key={`${index}-text`}
        word={token.trim()}
        className={className}
        onDoubleClick={onWordDoubleClick}
      />;
    }
    
    return <span key={`${index}-text`} className={className.trim() || undefined}>{token}</span>;
  }).filter(Boolean); // Filter out null elements
};

// Inline component for clickable words with audio
const ClickableWordInline = ({ 
  word, 
  className = '',
  onDoubleClick
}: { 
  word: string; 
  className?: string;
  onDoubleClick?: (word: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement] = useState(() => typeof window !== 'undefined' ? new Audio() : null);
  const [isInDictionary, setIsInDictionary] = useState(false);
  
  // Check if the word exists in the dictionary
  useEffect(() => {
    const cleanedWord = cleanWord(word);
    if (!cleanedWord) return;
    
    let isMounted = true;
    
    const checkDictionary = async () => {
      try {
        const exists = await checkWordExists(cleanedWord);
        if (isMounted) {
          setIsInDictionary(exists);
        }
      } catch (error) {
        console.error('Error checking word existence:', error);
      }
    };
    
    checkDictionary();
    
    return () => {
      isMounted = false;
    };
  }, [word]);

  // Disabled audio playback for now - will be implemented later
  const playAudio = async () => {
    // Audio playback is disabled until fully implemented
    console.log('Audio playback is currently disabled');
  };

  return (
    <span
      className={`inline-flex items-center ${className} cursor-pointer hover:text-primary relative ${isInDictionary ? 'border-b border-dotted border-primary/30' : ''}`.trim()}
      onDoubleClick={onDoubleClick && isInDictionary ? () => onDoubleClick(word) : undefined}
      title={isInDictionary ? 'Double-click to view definition' : ''}
    >
      {word}
    </span>
  );
};

/**
 * Cleans a word by removing special characters and converting to lowercase
 * @param word The word to clean
 * @returns Cleaned word
 */
export const cleanWord = (word: string): string => {
  if (!word) return '';
  return word.toLowerCase().trim().replace(/[.,;:!?()[\]{}'"«»""'']/g, '');
};

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns String with first letter capitalized
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
