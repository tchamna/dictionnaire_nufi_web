'use client';

import { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getDefinitions, DefinitionResponse, searchDictionaryEntries } from '@/services/dictionaryService';
import { applyClafricaMapping } from '@/lib/clafricaMapping';

// Add interface for the word of the day
interface WordOfTheDay {
  word: string;
  partOfSpeech: string;
  definitionText: string;
}

// Main component with Suspense
export default function HomePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}

// Content component
function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'keyword-only' | 'all-fields'>('all-fields');
  const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        setIsLoading(true);
        const definitionsResult = await getDefinitions(1, 20) as DefinitionResponse;
        
        if (definitionsResult?.data && definitionsResult.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * definitionsResult.data.length);
          const randomWord = definitionsResult.data[randomIndex];
          
          setWordOfTheDay({
            word: randomWord.word,
            partOfSpeech: randomWord.part_of_speech || 'noun',
            definitionText: randomWord.definition_text
          });
        }
      } catch (error) {
        console.error('Error fetching word of the day:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordOfTheDay();
  }, []);

  // Handle search input change with Clafrica mapping
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Apply Clafrica mapping to transform shortcut keys
    const transformedValue = applyClafricaMapping(value);
    setSearchQuery(transformedValue);
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    setSearchMode(prevMode => 
      prevMode === 'keyword-only' ? 'all-fields' : 'keyword-only'
    );
  };

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/dictionary?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Main Search Section - Merriam-Webster Style */}
      <section className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Afri-Poly Dictionary
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore and learn African languages with our comprehensive dictionary and phrasebook
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-4">
            <Input
              type="text"
              placeholder="Search for a word or phrase..."
              className="w-full h-14 pl-4 pr-12 text-lg rounded-md"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
          
          <div className="flex items-center max-w-2xl mx-auto mb-4 space-x-2">
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
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
              <p>Tip: Use shortcuts like <code>a1</code> → à, <code>o*</code> → ɔ, <code>n*</code> → ŋ, <code>eu</code> → ə</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Word of the Day Section */}
      <section className="py-8 border-t border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Word of the Day</h2>
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <p className="text-muted-foreground">Loading word of the day...</p>
              ) : wordOfTheDay ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-bold">{wordOfTheDay.word}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="italic">{wordOfTheDay.partOfSpeech}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Definition:</h4>
                    <p>{wordOfTheDay.definitionText}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <Button asChild variant="outline">
                      <Link href={`/dictionary?q=${wordOfTheDay.word}`}>
                        View in Dictionary
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Unable to load word of the day. Please try again later.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Explore African Languages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Common Phrases</h3>
                <p className="mb-4">Learn everyday expressions in multiple African languages.</p>
                <Button variant="outline" asChild>
                  <Link href="/phrases">Browse Phrases</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Dictionary</h3>
                <p className="mb-4">Look up words and their meanings in various African languages.</p>
                <Button variant="outline" asChild>
                  <Link href="/dictionary">Open Dictionary</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Language Guides</h3>
                <p className="mb-4">Pronunciation guides and basic grammar for beginners.</p>
                <Button variant="outline" asChild>
                  <Link href="/guides">View Guides</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Searches Section */}
      <section className="py-8 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Popular Searches</h2>
          <div className="flex flex-wrap gap-3">
            {['hello', 'thank you', 'goodbye', 'water', 'food', 'friend', 'welcome', 'please', 'sorry', 'love', 'family', 'home'].map((term) => (
              <Link 
                key={term} 
                href={`/dictionary?q=${term}`}
                className="px-3 py-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
