import { supabase, Tables, handleSupabaseError } from '@/lib/supabase';

export interface DefinitionResponse {
  data: Tables['definitions'][] | null;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
  count?: number | null;
}

export type DictionaryEntry = Tables['definitions'];

// Add the correct type for the database response
type DefinitionDBResponse = {
  id: number;
  word: string;
  definition_text: string;
  part_of_speech?: string;
  definition_index: number;  // Add this field
  created_at: string;
  updated_at: string;
};

/**
 * Fetch all definitions
 */
export async function getDefinitions(page = 1, limit = 20): Promise<DefinitionResponse> {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    const { data, error, count } = await supabase
      .from('definitions')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('word');
    
    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'unknown'
        }
      };
    }
    
    return { data, count };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: null,
        hint: null,
        code: 'unknown'
      }
    };
  }
}

/**
 * Fetch a definition by ID
 */
export async function getDefinitionById(id: number): Promise<DefinitionResponse> {
  try {
    const { data, error } = await supabase
      .from('definitions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'unknown'
        }
      };
    }
    
    return { data: data ? [data] : null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: null,
        hint: null,
        code: 'unknown'
      }
    };
  }
}

/**
 * Fetch a definition by word
 */
export async function getDefinitionByWord(word: string): Promise<DefinitionResponse> {
  try {
    const { data, error } = await supabase
      .from('definitions')
      .select('*')
      .eq('word', word)
      .single();
    
    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'unknown'
        }
      };
    }
    
    return { data: data ? [data] : null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: null,
        hint: null,
        code: 'unknown'
      }
    };
  }
}

/**
 * Fetch all dictionary entries
 */
export async function getDictionaryEntries(): Promise<DefinitionResponse> {
  try {
    const { data, error } = await supabase
      .from('definitions')
      .select('*')
      .order('word');
    
    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'unknown'
        }
      };
    }
    
    return { data };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: null,
        hint: null,
        code: 'unknown'
      }
    };
  }
}

/**
 * Search dictionary entries by word
 */
export async function searchDictionaryEntries(
  searchTerm: string, 
  searchMode: 'keyword-only' | 'all-fields' = 'all-fields'
): Promise<DefinitionResponse> {
  try {
    // Don't lowercase the search term since we need to preserve special characters
    const cleanTerm = searchTerm.trim();
    
    // For single letter searches, we need to be more precise
    let query;
    
    if (cleanTerm.length === 1) {
      // For single letter, use exact match first, then fallback to case-insensitive
      query = supabase
        .from('definitions')
        .select('*')
        .or(`word.eq.${cleanTerm},word.ilike.${cleanTerm}%`)
        .order('word')
        .limit(50);
    } else if (searchMode === 'keyword-only') {
      // Search only in the word field with exact matches first
      query = supabase
        .from('definitions')
        .select('*')
        .or(`word.like.%${cleanTerm}%,word.ilike.%${cleanTerm}%`)
        .order('word')
        .limit(20);
    } else {
      // Search in both word and definition fields
      query = supabase
        .from('definitions')
        .select('*')
        .or(`word.like.%${cleanTerm}%,word.ilike.%${cleanTerm}%,definition_text.ilike.%${cleanTerm}%`)
        .order('word')
        .limit(20);
    }
    
    const { data, error } = await query;
    
    if (error) return { data: null, error };
    
    // Deduplicate entries by word
    const uniqueWords = Array.from(
      new Map(data.map(item => [item.word, item])).values()
    );
    
    return { data: uniqueWords };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: null,
        hint: null,
        code: 'unknown'
      }
    };
  }
}

// Add new function to get all definitions for a word
export async function getAllDefinitionsForWord(word: string): Promise<DefinitionResponse> {
  try {
    // Clean the word and ensure it's properly decoded
    const cleanedWord = word.trim();
    
    // Try exact match first
    const { data: initialData, error } = await supabase
      .from('definitions')
      .select('*')
      .eq('word', cleanedWord);
    
    // Start with the initial data
    let data = initialData;
    
    // If no exact match, try case-insensitive match
    if (!error && (!data || data.length === 0)) {
      const { data: iLikeData, error: iLikeError } = await supabase
        .from('definitions')
        .select('*')
        .ilike('word', cleanedWord);
      
      if (!iLikeError && iLikeData && iLikeData.length > 0) {
        data = iLikeData;
      } else {
        // Try a more flexible search as a last resort
        const { data: flexData, error: flexError } = await supabase
          .from('definitions')
          .select('*')
          .or(`word.ilike.%${cleanedWord}%,word.ilike.${cleanedWord}%,word.ilike.%${cleanedWord}`);
        
        if (!flexError && flexData && flexData.length > 0) {
          data = flexData;
        }
      }
    }
    
    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'unknown'
        }
      };
    }
    
    return { data: data as DefinitionDBResponse[] };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: null,
        hint: null,
        code: 'unknown'
      }
    };
  }
}
