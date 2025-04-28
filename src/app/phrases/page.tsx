'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Volume2 } from 'lucide-react';
import { Phrase } from '@/types';
import { getExamples, ExampleResponse } from '@/services/examplesService';

// Mock phrases data for fallback
const mockPhrases: Phrase[] = [
  {
    id: '1',
    category: 'greetings',
    english: 'Hello',
    translations: {
      '1': 'Jambo',         // Swahili
      '2': 'Bawo ni',       // Yoruba
      '3': 'Sawubona',      // Zulu
      '4': 'Sannu',         // Hausa
      '5': 'ሰላም (Selam)'    // Amharic
    }
  },
  {
    id: '2',
    category: 'greetings',
    english: 'How are you?',
    translations: {
      '1': 'Habari gani?',    // Swahili
      '2': 'Bawo ni?',        // Yoruba
      '3': 'Unjani?',         // Zulu
      '4': 'Kana lafiya?',    // Hausa
      '5': 'እንዴት ነህ? (Endet neh?)' // Amharic
    }
  },
  {
    id: '3',
    category: 'greetings',
    english: 'Thank you',
    translations: {
      '1': 'Asante',           // Swahili
      '2': 'E dupe',           // Yoruba
      '3': 'Ngiyabonga',       // Zulu
      '4': 'Na gode',          // Hausa
      '5': 'አመስግናለሁ (Ameseginalehu)' // Amharic
    }
  },
  {
    id: '4',
    category: 'greetings',
    english: 'Goodbye',
    translations: {
      '1': 'Kwaheri',          // Swahili
      '2': 'O dabo',           // Yoruba
      '3': 'Hamba kahle',      // Zulu
      '4': 'Sai anjima',       // Hausa
      '5': 'ደህና ሁን (Dehna hun)' // Amharic
    }
  },
  {
    id: '5',
    category: 'basics',
    english: 'Yes',
    translations: {
      '1': 'Ndiyo',            // Swahili
      '2': 'Bẹẹni',            // Yoruba
      '3': 'Yebo',             // Zulu
      '4': 'Ee',               // Hausa
      '5': 'አዎ (Awo)'          // Amharic
    }
  },
  {
    id: '6',
    category: 'basics',
    english: 'No',
    translations: {
      '1': 'Hapana',           // Swahili
      '2': 'Bẹẹko',            // Yoruba
      '3': 'Cha',              // Zulu
      '4': 'A\'a',              // Hausa
      '5': 'አይ (Ay)'           // Amharic
    }
  },
  {
    id: '7',
    category: 'basics',
    english: 'Please',
    translations: {
      '1': 'Tafadhali',        // Swahili
      '2': 'Jọwọ',             // Yoruba
      '3': 'Ngicela',          // Zulu
      '4': 'Don Allah',        // Hausa
      '5': 'እባክህ (Ebakeh)'     // Amharic
    }
  },
  {
    id: '8',
    category: 'basics',
    english: 'Sorry',
    translations: {
      '1': 'Samahani',         // Swahili
      '2': 'Ma binu',          // Yoruba
      '3': 'Ngiyaxolisa',      // Zulu
      '4': 'Yi hakuri',        // Hausa
      '5': 'ይቅርታ (Yikirta)'    // Amharic
    }
  },
  {
    id: '9',
    category: 'travel',
    english: 'Where is...?',
    translations: {
      '1': 'Wapi...?',         // Swahili
      '2': 'Nibo ni...?',      // Yoruba
      '3': 'Kuphi...?',        // Zulu
      '4': 'Ina...?',          // Hausa
      '5': 'የት ነው...? (Yet new...?)' // Amharic
    }
  },
  {
    id: '10',
    category: 'travel',
    english: 'How much?',
    translations: {
      '1': 'Ni kiasi gani?',   // Swahili
      '2': 'Elo ni?',          // Yoruba
      '3': 'Malini?',          // Zulu
      '4': 'Nawa ne?',         // Hausa
      '5': 'ስንት ነው? (Sint new?)' // Amharic
    }
  }
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'greetings', name: 'Greetings' },
  { id: 'basics', name: 'Basic Phrases' },
  { id: 'travel', name: 'Travel' },
  { id: 'food', name: 'Food & Dining' },
  { id: 'emergency', name: 'Emergency' }
];

// Helper function to detect category based on phrase content
const detectCategory = (phrase: string): string => {
  const lowerPhrase = phrase.toLowerCase();
  
  if (lowerPhrase.includes('hello') || lowerPhrase.includes('hi') || 
      lowerPhrase.includes('thank') || lowerPhrase.includes('goodbye') || 
      lowerPhrase.includes('welcome')) {
    return 'greetings';
  }
  
  if (lowerPhrase.includes('where') || lowerPhrase.includes('how much') || 
      lowerPhrase.includes('direction') || lowerPhrase.includes('far')) {
    return 'travel';
  }
  
  if (lowerPhrase.includes('eat') || lowerPhrase.includes('food') || 
      lowerPhrase.includes('drink') || lowerPhrase.includes('restaurant')) {
    return 'food';
  }
  
  if (lowerPhrase.includes('help') || lowerPhrase.includes('emergency') || 
      lowerPhrase.includes('doctor') || lowerPhrase.includes('hospital')) {
    return 'emergency';
  }
  
  // Default to basics for anything else
  return 'basics';
};

// Update the interface to match the API response
interface DbEntry {
  id: number;
  definition_index?: number;
  example_index?: number;
  native_text?: string;
  french_text?: string;
  created_at: string;
  updated_at?: string;
}

// Update the conversion function to handle optional fields
const convertToPhrase = (dbEntry: DbEntry, index: number): Phrase => {
  // Extract English text with fallback
  const english = dbEntry.native_text || 'Unknown phrase';
  
  // Create translations object
  const translations: Record<string, string> = {};
  
  // Add translations if available
  if (dbEntry.french_text) {
    translations['1'] = dbEntry.french_text;
  } else {
    translations['1'] = 'Translation not available';
  }
  
  // Add other translations with placeholders
  translations['2'] = 'Translation not available'; // Yoruba
  translations['3'] = 'Translation not available'; // Zulu
  translations['4'] = 'Translation not available'; // Hausa
  translations['5'] = 'Translation not available'; // Amharic
  
  return {
    id: String(dbEntry.id || index + 1),
    category: detectCategory(english),
    english,
    translations
  };
};

export default function PhrasesPage() {
  const { selectedLanguages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [phrases, setPhrases] = useState<Phrase[]>(mockPhrases);
  const [filteredPhrases, setFilteredPhrases] = useState<Phrase[]>(mockPhrases);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch phrases from Supabase
  const fetchPhrases = async () => {
    try {
      setIsLoading(true);
      const result = await getExamples() as ExampleResponse;
      
      if (result.data && result.data.length > 0) {
        const phrasesData = result.data.map(convertToPhrase);
        setPhrases(phrasesData);
        setFilteredPhrases(phrasesData);
      } else {
        setPhrases(mockPhrases);
        setFilteredPhrases(mockPhrases);
      }
    } catch (error) {
      console.error('Error fetching phrases:', error);
      setPhrases(mockPhrases);
      setFilteredPhrases(mockPhrases);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhrases();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterPhrases(searchQuery, selectedCategory);
  };

  const filterPhrases = (query: string, category: string) => {
    let filtered = phrases;
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(phrase => phrase.category === category);
    }
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(phrase => 
        phrase.english.toLowerCase().includes(lowerQuery) ||
        Object.values(phrase.translations).some(translation => 
          translation.toLowerCase().includes(lowerQuery)
        )
      );
    }
    
    setFilteredPhrases(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterPhrases(searchQuery, category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Common Phrases</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <Input
            type="search"
            placeholder="Search for phrases..."
            className="w-full h-12 pl-4 pr-12 text-lg rounded-md"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              filterPhrases(e.target.value, selectedCategory);
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Selected Languages Warning */}
        {selectedLanguages.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">
              Please select at least one language from the language selector to see translations.
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12 border rounded-md">
            <p className="text-muted-foreground">Loading phrases...</p>
          </div>
        ) : (
          /* Phrases List */
          filteredPhrases.length > 0 ? (
            <div className="space-y-6">
              {filteredPhrases.map(phrase => (
                <Card key={phrase.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{phrase.english}</h2>
                        <p className="text-sm text-muted-foreground capitalize">
                          Category: {phrase.category}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" title="Listen to pronunciation">
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {selectedLanguages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {selectedLanguages.map(language => {
                          const translation = phrase.translations[language.id];
                          return translation ? (
                            <div key={language.id} className="border rounded-md p-3">
                              <span className="text-xs text-muted-foreground">{language.name}</span>
                              <div className="font-medium mt-1">{translation}</div>
                            </div>
                          ) : (
                            <div key={language.id} className="border rounded-md p-3 bg-muted/30">
                              <span className="text-xs text-muted-foreground">{language.name}</span>
                              <div className="text-muted-foreground mt-1 italic">(Translation not available)</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic mt-2">
                        Select languages to see translations
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground">No phrases found matching your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setFilteredPhrases(phrases);
                }}
              >
                Reset Filters
              </Button>
            </div>
          )
        )}
        
        {/* Selected Languages Info */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium mb-3">Selected Languages for Translation</h3>
          {selectedLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(language => (
                <span 
                  key={language.id} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  {language.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No languages selected. Select languages from the header to enable translations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
