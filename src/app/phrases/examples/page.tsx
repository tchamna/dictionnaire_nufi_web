'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from '@/lib/supabase';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { ClickableTextRenderer } from '@/components/ClickableTextRenderer';
import { useRouter } from 'next/navigation';

// Limit to 10 items per page to prevent performance issues
const ITEMS_PER_PAGE = 10;

// Define example interface
interface Example {
  id: number;
  native_text: string;
  french_text: string;
}

// Main component
export default function ExamplesPage() {
  const router = useRouter();
  const [examples, setExamples] = useState<Example[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch examples
  const fetchExamples = async (query: string, page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching examples with query:', query, 'page:', page);
      
      // Get total count for pagination
      if (page === 1) {
        let countQuery = supabase
          .from('examples')
          .select('*', { count: 'exact', head: true });
          
        if (query) {
          countQuery = countQuery.ilike('native_text', `%${query}%`);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          console.error('Count error:', countError);
        } else {
          console.log('Total count:', count);
          setTotalCount(count || 0);
        }
      }
      
      // Build the query
      let dataQuery = supabase
        .from('examples')
        .select('*');
        
      if (query) {
        dataQuery = dataQuery.ilike('native_text', `%${query}%`);
      }
      
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      dataQuery = dataQuery
        .order('native_text')
        .range(from, to);
      
      console.log('Query range:', from, 'to', to);
      
      const { data, error: fetchError } = await dataQuery;
      
      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('Failed to load examples. Please try again.');
        return;
      }
      
      console.log('Fetched examples:', data?.length || 0);
      
      if (!data || data.length === 0) {
        if (page === 1) {
          setExamples([]);
        }
        setHasMore(false);
        return;
      }
      
      // Update examples
      if (page === 1) {
        setExamples(data);
      } else {
        setExamples(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching examples:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchExamples('', 1);
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchExamples(searchQuery.trim(), 1);
  };

  // Load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchExamples(searchQuery.trim(), nextPage);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchExamples('', 1);
  };
  
  // Handle word double click to navigate to dictionary
  const handleWordDoubleClick = (word: string) => {
    if (word) {
      router.push(`/dictionary/${encodeURIComponent(word)}`);
    }
  };

  // Group examples by first word
  const groupedExamples = examples.reduce((groups: Record<string, Example[]>, example) => {
    const firstWord = example.native_text?.split(' ')[0] || 'Unknown';
    if (!groups[firstWord]) {
      groups[firstWord] = [];
    }
    groups[firstWord].push(example);
    return groups;
  }, {});

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/phrases" 
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Phrases
              </Link>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Example Phrases</h1>
            <p className="text-muted-foreground mt-2">
              Browse and search through example phrases with their French translations
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {totalCount} Examples
          </Badge>
        </div>
        <Separator />
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by word..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchExamples(searchQuery.trim(), currentPage)} 
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State - First Page */}
      {isLoading && currentPage === 1 && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-muted-foreground">Loading examples...</div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && !error && examples.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No examples found</p>
          {searchQuery && (
            <Button 
              variant="link" 
              onClick={handleClearSearch}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Examples Grid */}
      {!isLoading && !error && examples.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedExamples).map(([word, wordExamples]) => (
            <Card key={word} className="overflow-hidden">
              <div className="bg-muted/50 p-4 border-b">
                <h2 className="text-xl font-semibold">{word}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {wordExamples.length} example{wordExamples.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-4 space-y-3">
                  {wordExamples.map((example) => (
                    <Accordion 
                      key={`accordion-${example.id}`}
                      type="single" 
                      collapsible 
                      className="w-full" 
                    >
                      <AccordionItem value={`item-${example.id}`}>
                        <AccordionTrigger>
                          <ClickableTextRenderer 
                            text={example.native_text} 
                            onWordDoubleClick={handleWordDoubleClick}
                          />
                        </AccordionTrigger>
                        <AccordionContent>
                          {example.french_text && (
                            <p className="text-sm text-muted-foreground">
                              <ClickableTextRenderer 
                                text={example.french_text} 
                                onWordDoubleClick={handleWordDoubleClick}
                                className="text-muted-foreground"
                              />
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !error && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Loading...
              </span>
            ) : (
              'Load More Examples'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
