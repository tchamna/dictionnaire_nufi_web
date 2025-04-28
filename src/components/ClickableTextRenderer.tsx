import React, { useState, useEffect } from 'react';
import { ClickableWord } from '@/components/ClickableWord';
import { cleanWord } from '@/lib/clafricaMapping';
import { checkWordExists, preloadWordExistence } from '@/services/wordCheckService';

interface ClickableTextRendererProps {
  text: string;
  className?: string;
  onWordDoubleClick?: (word: string) => void;
}

/**
 * Renders text with words that exist in the dictionary as clickable
 */
export function ClickableTextRenderer({
  text,
  className = '',
  onWordDoubleClick
}: ClickableTextRendererProps) {
  const [wordStatus, setWordStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Extract potential words from the text
    if (!text) {
      setIsLoading(false);
      return;
    }
    
    // Split text by spaces and punctuation to get potential words
    const words = text.split(/[\s.,;:!?()[\]{}'"«»""'']+/)
      .filter(word => word.trim().length > 0)
      .map(word => cleanWord(word));
    
    // Deduplicate words
    const uniqueWords = [...new Set(words)];
    
    async function checkWords() {
      setIsLoading(true);
      
      try {
        // Preload all words at once for better performance
        await preloadWordExistence(uniqueWords);
        
        // Check each word individually and update state
        const wordStatusMap: Record<string, boolean> = {};
        
        await Promise.all(
          uniqueWords.map(async (word) => {
            const exists = await checkWordExists(word);
            wordStatusMap[word] = exists;
          })
        );
        
        setWordStatus(wordStatusMap);
      } catch (error) {
        console.error('Error checking words:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkWords();
  }, [text]);
  
  if (!text) return null;
  
  // Split text by tokens while preserving punctuation and spaces
  const tokens = text.split(/([.,;:!?()[\]{}'"«»""''\s]+)/);
  
  return (
    <span className={className}>
      {tokens.map((token, index) => {
        // Skip empty tokens
        if (!token.trim()) return token;
        
        // Check if this token is a word that exists in the dictionary
        const cleanedToken = cleanWord(token);
        const exists = wordStatus[cleanedToken];
        
        // If it's a word that exists in the dictionary, make it clickable
        if (exists) {
          return (
            <ClickableWord
              key={`${index}-${token}`}
              word={token}
              onDoubleClick={onWordDoubleClick}
              className="hover:text-primary"
            />
          );
        }
        
        // For punctuation or words not in dictionary, just render as plain text
        return <React.Fragment key={`${index}-${token}`}>{token}</React.Fragment>;
      })}
      
      {isLoading && (
        <span className="sr-only">Checking words in dictionary...</span>
      )}
    </span>
  );
}
