'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Volume2 } from 'lucide-react';
import { getDefinitions, searchDictionaryEntries } from '@/services/dictionaryService';
import { getExamplesByDefinitionId } from '@/services/examplesService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import debounce from 'lodash.debounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { renderClickableText } from '@/lib/textRenderer';
import { applyClafricaMapping, cleanWord } from '@/lib/clafricaMapping';
import { hasAudio } from '@/data/audioMapping';
import { playAudioForWord } from '@/services/audioService';

// Type for examples
type Example = {
  id: number;
  index: number;
  native_text: string;
  french_text: string;
};

// Type for dictionary entry
type DictionaryEntry = {
  id: number;
  word: string;
  partOfSpeech: string;
  language: string;
  definition: string;
  examples: Example[];
  translations: Record<string, string>;
};

// Part of speech abbreviations mapping
const partOfSpeechMap: Record<string, string> = {
  'n.': 'noun',
  'v.': 'verb',
  'adj.': 'adjective',
  'adv.': 'adverb',
  'prep.': 'preposition',
  'conj.': 'conjunction',
  'pron.': 'pronoun',
  'interj.': 'interjection',
  'ex.': 'example',
  'anto.': 'antonym',
  'hom.': 'homonym',
  'syn.': 'synonym',
  'pl.': 'plural',
  'cf.': 'compare',
  'N.B.': 'nota bene'
};

// Helper function to convert Supabase data to DictionaryEntry
const convertToDictionaryEntry = (dbEntry: {
  id: string | number | undefined;
  word: string;
  part_of_speech?: string | undefined;
  definition_text: string;
}, index?: number): DictionaryEntry => {
  // Create a base dictionary entry with a fallback ID
  const entryId = dbEntry.id !== undefined 
    ? (typeof dbEntry.id === 'string' ? parseInt(dbEntry.id) : dbEntry.id) 
    : (index || 0) * -1; // Use negative index as fallback ID
    
  const entry: DictionaryEntry = {
    id: entryId,
    word: dbEntry.word || 'Unknown',
    partOfSpeech: dbEntry.part_of_speech || 'noun',
    language: 'Unknown',
    definition: dbEntry.definition_text || '',
    examples: [],
    translations: {}
  };
  
  // Expand part of speech abbreviation if it exists in our mapping
  if (entry.partOfSpeech && partOfSpeechMap[entry.partOfSpeech.toLowerCase()]) {
    entry.partOfSpeech = partOfSpeechMap[entry.partOfSpeech.toLowerCase()];
  }
  
  return entry;
};

// Helper function to extract examples from definition text
const extractExamplesFromDefinition = (entry: DictionaryEntry) => {
  if (!entry.definition) return;
  
  // Try to find examples with various patterns
  const examplePatterns = [
    /Example[s]?:?\s*(.*?)(?=\.|$)/gi,
    /Ex\.?:?\s*(.*?)(?=\.|$)/gi,
    /e\.g\.?\s*(.*?)(?=\.|$)/gi,
    /For example:?\s*(.*?)(?=\.|$)/gi
  ];
  
  let exampleIndex = 0;
  
  // Process each pattern to find examples
  examplePatterns.forEach(pattern => {
    const matches = entry.definition.match(pattern);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        // Clean up the match by removing the pattern prefix
        const cleanedMatch = match.replace(/Example[s]?:?\s*|Ex\.?:?\s*|e\.g\.?\s*|For example:?\s*/i, '').trim();
        
        if (cleanedMatch) {
          // Check if there's a French translation in parentheses or after a dash
          const translationMatch = cleanedMatch.match(/\((.*?)\)|-\s*(.*?)$/);
          let nativeText = cleanedMatch;
          let frenchText = '';
          
          if (translationMatch) {
            // If there's a translation, separate it from the native text
            if (translationMatch[0].startsWith('(')) {
              nativeText = cleanedMatch.replace(translationMatch[0], '').trim();
              frenchText = translationMatch[1].trim();
            } else if (translationMatch[0].startsWith('-')) {
              const parts = cleanedMatch.split('-');
              if (parts.length >= 2) {
                nativeText = parts[0].trim();
                frenchText = parts[1].trim();
              }
            }
          }
          
          entry.examples.push({
            id: exampleIndex + 1,
            index: exampleIndex + 1,
            native_text: nativeText,
            french_text: frenchText
          });
          
          exampleIndex++;
        }
      });
    }
  });
  
  // Look for examples in bullet points or numbered lists
  const bulletPointMatches = entry.definition.match(/[•\-\*\d+\.]\s+(.*?)(?=\n|$)/g);
  if (bulletPointMatches && bulletPointMatches.length > 0) {
    bulletPointMatches.forEach(match => {
      const cleanedMatch = match.replace(/[•\-\*\d+\.]\s+/, '').trim();
      
      if (cleanedMatch && !entry.examples.some(ex => ex.native_text.includes(cleanedMatch))) {
        // Check for French translation as above
        const translationMatch = cleanedMatch.match(/\((.*?)\)|-\s*(.*?)$/);
        let nativeText = cleanedMatch;
        let frenchText = '';
        
        if (translationMatch) {
          if (translationMatch[0].startsWith('(')) {
            nativeText = cleanedMatch.replace(translationMatch[0], '').trim();
            frenchText = translationMatch[1].trim();
          } else if (translationMatch[0].startsWith('-')) {
            const parts = cleanedMatch.split('-');
            if (parts.length >= 2) {
              nativeText = parts[0].trim();
              frenchText = parts[1].trim();
            }
          }
        }
        
        entry.examples.push({
          id: exampleIndex + 1,
          index: exampleIndex + 1,
          native_text: nativeText,
          french_text: frenchText
        });
        
        exampleIndex++;
      }
    });
  }
  
  // If we still don't have examples, create one from the definition itself
  if (entry.examples.length === 0 && entry.definition) {
    entry.examples.push({
      id: 1,
      index: 1,
      native_text: entry.definition.split('.')[0] + '.',
      french_text: ''
    });
  }
};

// Add proper type for API responses
interface DefinitionResponse {
  data: {
    id: number;
    word: string;
    part_of_speech?: string;
    definition_text: string;
    created_at: string;
    updated_at: string;
  }[] | null;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
  count?: number | null;
}

// Main component with Suspense
export default function DictionaryPage() {
  return (
    <Suspense fallback={<div>Loading dictionary...</div>}>
      <DictionaryContent />
    </Suspense>
  );
}

// Content component that uses useSearchParams
function DictionaryContent() {
  const searchParams = useSearchParams();
  const { selectedLanguages } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'keyword-only' | 'all-fields'>('all-fields');
  
  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingWord, setCurrentPlayingWord] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to play audio if available
  const playAudio = useCallback(async (word: string) => {
    console.log(`Playing audio for: ${word}`);
    
    // If already playing this word, stop it
    if (currentPlayingWord === word && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentPlayingWord(null);
      return;
    }
    
    // If playing a different word, stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setCurrentPlayingWord(word);
    setAudioError(null);
    
    try {
      // Use the audio service to play the audio
      const success = await playAudioForWord(word);
      
      if (!success) {
        throw new Error('Failed to play audio for word');
      }
      
      // Since playAudioForWord handles the audio playback internally,
      // we just need to update our UI state
      setIsPlaying(true);
      
      // Set a timeout to simulate the audio playing and ending
      // In a real implementation, you would want to hook into the actual audio events
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentPlayingWord(null);
      }, 3000); // Assume 3 seconds for audio playback
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError('Error playing audio');
      setIsPlaying(false);
      setCurrentPlayingWord(null);
    }
  }, [currentPlayingWord, isPlaying]);
  
  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to handle word double click - navigate to word definition
  const handleWordDoubleClick = (clickedWord: string) => {
    const cleanedWord = cleanWord(clickedWord);
    if (!cleanedWord) return;
    
    // Don't navigate if we're already on this word's page
    if (cleanedWord === searchTerm.toLowerCase()) return;
    
    window.location.href = `/dictionary/${encodeURIComponent(cleanedWord)}`;
  };
  
  // Use the search term from URL if available
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      searchWords(query);
    }
  }, [searchParams]);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.length > 0) {
        searchWords(term);
      }
    }, 300),
    [] // Remove searchMode dependency since we handle it with useEffect
  );
  
  // Handle input change with Clafrica mapping
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Apply Clafrica mapping to transform shortcut keys
    const transformedValue = applyClafricaMapping(value);
    setSearchTerm(transformedValue);
    
    if (transformedValue.length > 0) {
      searchWords(transformedValue);
    } else {
      setEntries([]);
      setSearchTerm('');
    }
  };
  
  // Toggle search mode
  const toggleSearchMode = () => {
    setSearchMode(prevMode => 
      prevMode === 'keyword-only' ? 'all-fields' : 'keyword-only'
    );
  };

  // Effect to handle search mode changes
  useEffect(() => {
    if (searchTerm.length > 0) {
      searchWords(searchTerm);
    }
  }, [searchMode]); // Re-run when search mode changes
  
  // Search for words
  const searchWords = async (term: string) => {
    if (!term || term.length < 1) return;
    
    setIsLoading(true);
    try {
      const result = await searchDictionaryEntries(term, searchMode);
      
      if (result?.data) {
        const formattedEntries = result.data.map((entry, index) => 
          convertToDictionaryEntry(entry, index)
        );
        
        // Extract examples for each entry
        formattedEntries.forEach(entry => {
          extractExamplesFromDefinition(entry);
        });
        
        setEntries(formattedEntries);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error searching words:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle word selection
  const handleWordSelect = async (entry: DictionaryEntry) => {
    try {
      // Fetch examples for the selected entry
      const examplesResult = await getExamplesByDefinitionId(entry.id);
      
      if (examplesResult?.data && examplesResult.data.length > 0) {
        // Update the entry with examples from the database
        entry.examples = examplesResult.data.map((example, index) => ({
          id: example.id,
          index: index + 1,
          native_text: example.native_text || '',
          french_text: example.french_text || ''
        }));
      }
      
      setSelectedEntry(entry);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching examples:', error);
    }
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEntry(null);
  };
  
  // Handle view full details
  const handleViewFullDetails = (entry: DictionaryEntry) => {
    // Make sure the word is properly encoded for the URL
    // First decode any existing encoding to ensure we don't double-encode
    const cleanWord = entry.word.trim();
    const encodedWord = encodeURIComponent(cleanWord);
    window.location.href = `/dictionary/${encodedWord}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dictionary</h1>
          <p className="text-muted-foreground">Search for words in our dictionary</p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a word..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={searchMode === 'keyword-only'}
                onChange={toggleSearchMode}
              />
              <span className="text-sm">Search in keyword field only</span>

            </label>
          </div>
          <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
            <p>Tip: Use shortcuts like <code>a1</code> → à, <code>o*</code> → ɔ, <code>n*</code> → ŋ, <code>eu</code> → ə</p>
          </div>
          
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p>Searching...</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card 
                key={entry.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex justify-center items-center gap-2">
                  <h3 
                    className="text-xl font-semibold text-primary cursor-pointer"
                    onClick={() => handleViewFullDetails(entry)}
                    onDoubleClick={() => handleWordDoubleClick(entry.word)}
                  >
                    {entry.word}
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(entry.word);
                    }}
                    className={`p-1 rounded-full transition-colors ${
                      hasAudio(entry.word) 
                        ? 'hover:bg-muted text-primary' 
                        : 'text-muted-foreground cursor-not-allowed'
                    }`}
                    disabled={!hasAudio(entry.word)}
                    title={hasAudio(entry.word) 
                      ? 'Click to hear pronunciation' 
                      : 'No audio available'}
                  >
                    <Volume2 
                      className={`h-4 w-4 ${
                        currentPlayingWord === entry.word && isPlaying 
                          ? 'text-blue-500 animate-pulse' 
                          : ''
                      }`} 
                    />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchTerm.length > 0 ? (
          <div className="text-center py-8">
            <p>No words found matching "{searchTerm}"</p>
          </div>
        ) : null}
        
        {selectedEntry && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEntry.word}</DialogTitle>
                <DialogDescription>
                  <span className="text-sm font-medium">{selectedEntry.partOfSpeech}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Definition:</h4>
                </div>
                <p className="text-sm mb-4">
                  {renderClickableText(selectedEntry.definition, playAudio, handleWordDoubleClick)}
                </p>
                
                {selectedEntry.examples && selectedEntry.examples.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Examples:</h4>
                    <Accordion type="single" collapsible className="w-full">
                      {selectedEntry.examples.map((example) => (
                        <AccordionItem key={example.id} value={`example-${example.id}`}>
                          <AccordionTrigger className="text-sm">
                            {renderClickableText(example.native_text, playAudio, handleWordDoubleClick)}
                          </AccordionTrigger>
                          <AccordionContent>
                            {example.french_text ? (
                              <div className="pl-4 border-l-2 border-muted mt-2">
                                <p className="text-sm italic">
                                  {renderClickableText(example.french_text, playAudio, handleWordDoubleClick)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic pl-4">No translation available</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => handleViewFullDetails(selectedEntry)}>
                  View Full Details
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
