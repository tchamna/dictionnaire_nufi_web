'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume } from 'lucide-react';
import { getAllDefinitionsForWord } from '@/services/dictionaryService';
import { getExamplesByDefinitionId } from '@/services/examplesService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { renderClickableText, cleanWord } from '@/lib/textRenderer';
import { AudioPlayer } from '@/components/AudioPlayer';
import Link from 'next/link';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Use the same types from the dictionary page
type Example = {
  id: number;
  index: number;
  native_text: string;
  french_text?: string;
};

type DictionaryEntry = {
  id: number;
  word: string;
  partOfSpeech: string;
  language: string;
  definition: string;
  examples: Example[];
  translations: Record<string, string>;
};

type DefinitionResponse = {
  id: number;
  word: string;
  definition_text: string;
  part_of_speech?: string;
  definition_index: number;
  created_at: string;
  updated_at: string;
};

type ExampleData = {
  id: number;
  definition_index: number;
  example_index: number;
  native_text: string;
  french_text: string;
};

// Main component with Suspense
export default function WordDetailPage() {
  return (
    <Suspense fallback={<div>Loading word details...</div>}>
      <WordDetailContent />
    </Suspense>
  );
}

// Content component
function WordDetailContent() {
  const params = useParams();
  const { selectedLanguages } = useLanguage();
  const [definitions, setDefinitions] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [displayWord, setDisplayWord] = useState('');
  const [showExamples, setShowExamples] = useState(() => {
    // Check localStorage for user preference, default to false
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showExamples');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const word = params.word as string;

  useEffect(() => {
    // Initialize audio element
    setAudioElement(new Audio());
  }, []);

  // Add effect to save preference
  useEffect(() => {
    localStorage.setItem('showExamples', JSON.stringify(showExamples));
  }, [showExamples]);

  // Function to play audio if available
  const playAudio = (word: string) => {
    if (!audioElement) return;
    
    // This is a placeholder - you would need to implement the actual audio playback
    // based on your audio file storage system
    const audioUrl = `/audio/${cleanWord(word)}.mp3`;
    
    audioElement.src = audioUrl;
    audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  };

  // Function to handle word double click - navigate to word definition
  const handleWordDoubleClick = (clickedWord: string) => {
    if (clickedWord === displayWord) return; // Don't navigate if it's the same word
    
    const cleanedWord = cleanWord(clickedWord);
    if (!cleanedWord) return;
    
    // Add the current word to browser history before navigating
    window.location.href = `/dictionary/${encodeURIComponent(cleanedWord)}`;
  };

  useEffect(() => {
    const fetchWordData = async () => {
      if (!word) return;
      
      setIsLoading(true);
      try {
        const decodedWord = decodeURIComponent(word);
        setDisplayWord(decodedWord);
        
        const result = await getAllDefinitionsForWord(decodedWord);
        
        if (result?.data && result.data.length > 0) {
          // First get all definitions
          const wordEntries = await Promise.all(result.data.map(async entry => {
            // Create the basic entry
            const wordEntry = {
              id: entry.definition_index,
              word: entry.word,
              partOfSpeech: entry.part_of_speech || 'noun',
              language: 'Unknown',
              definition: entry.definition_text,
              examples: [] as Example[],
              translations: {}
            };

            // Fetch examples for this definition
            try {
              const examplesResult = await getExamplesByDefinitionId(entry.definition_index);
              if (examplesResult?.data) {
                // Filter examples that match both word and definition_index
                wordEntry.examples = examplesResult.data
                  .filter(ex => ex.word === entry.word)
                  .map(example => ({
                    id: example.id,
                    index: example.example_index,
                    native_text: example.native_text,
                    french_text: example.french_text
                  }));
              }
            } catch (error) {
              console.error(`Error fetching examples for definition ${entry.definition_index}:`, error);
            }

            return wordEntry;
          }));
          
          setDefinitions(wordEntries);
        }
      } catch (error) {
        console.error('Error fetching word data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWordData();
  }, [word]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading word details...</div>;
  }

  if (!definitions.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Word not found</h2>
              <p className="mb-4">No definition found for "{displayWord}". Please try another search.</p>
              <Button 
                onClick={() => window.location.href = '/dictionary'}
                className="mt-2"
              >
                ← Back to Dictionary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/dictionary" className="flex items-center text-primary mb-4 hover:underline">
          ← Back to Results
        </Link>
        
        <Card>
          <CardContent className="p-6">
            {/* Add Examples Toggle */}
            <div className="flex items-center space-x-2 mb-6 justify-end">
              <Switch
                id="show-examples"
                checked={showExamples}
                onCheckedChange={setShowExamples}
              />
              <Label htmlFor="show-examples">Show Examples</Label>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-center text-primary">{displayWord}</h1>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {definitions[0]?.partOfSpeech}
              </p>
            </div>
            
            <div className="space-y-4">
              {definitions.map((entry, idx) => (
                <div key={`definition-${entry.id}`} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="mb-2">
                    <span className="font-medium mr-2">{idx + 1}–</span>
                    {renderClickableText(entry.definition, playAudio, handleWordDoubleClick)}
                  </p>
                  
                  {/* Conditionally render examples based on showExamples state */}
                  {showExamples && entry.examples && entry.examples.length > 0 && (
                    <div className="mt-4 animate-in fade-in duration-200">
                      <h3 className="font-medium mb-2">Examples:</h3>
                      <div className="space-y-2 pl-4">
                        {entry.examples.map((example, idx) => (
                          <div key={`example-${example.id || idx}`} className="text-sm">
                            <p>
                              {renderClickableText(example.native_text, playAudio, handleWordDoubleClick)}
                            </p>
                            {example.french_text && (
                              <p className="text-muted-foreground mt-1">
                                {example.french_text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}