import { supabase, Tables } from '@/lib/supabase';

export type Example = Tables['examples'];

export interface WordWithExamples {
  word: string;
  definitions: {
    definition_index: number;
    examples: Example[];
  }[];
}

export interface PhrasesResponse {
  data: WordWithExamples[] | null;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
  count?: number | null;
}

/**
 * Get all unique words that have examples
 */
export async function getWordsWithExamples(page = 1, limit = 20): Promise<PhrasesResponse> {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    const { data: words, error: wordsError, count } = await supabase
      .from('examples')
      .select('*', { count: 'exact' })
      .range(start, end);

    if (wordsError) {
      return {
        data: null,
        error: {
          message: wordsError.message,
          details: wordsError.details || null,
          hint: wordsError.hint || null,
          code: wordsError.code || 'unknown'
        }
      };
    }

    const wordMap = new Map<string, WordWithExamples>();

    // Process words and examples
    words?.forEach((example: Tables['examples']) => {
      if (!example.definition_index) return;

      const word = example.native_text || 'Unknown';
      if (!wordMap.has(word)) {
        wordMap.set(word, {
          word,
          definitions: []
        });
      }

      const wordData = wordMap.get(word)!;
      let definition = wordData.definitions.find(d => 
        d.definition_index === example.definition_index
      );

      if (!definition) {
        definition = {
          definition_index: example.definition_index,
          examples: []
        };
        wordData.definitions.push(definition);
      }

      if (example.native_text) {
        definition.examples.push({
          ...example,
          native_text: example.native_text,
          french_text: example.french_text || ''
        });
      }
    });

    return {
      data: Array.from(wordMap.values()).sort((a, b) => 
        a.word.localeCompare(b.word)
      ),
      count: count || undefined
    };
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
 * Search words with examples
 */
export async function searchExamples(query: string): Promise<PhrasesResponse> {
  try {
    const { data, error } = await supabase
      .from('examples')
      .select(`
        *,
        definitions:definition_index (
          word
        )
      `)
      .or(`native_text.ilike.%${query}%,french_text.ilike.%${query}%`)
      .order('definition_index')
      .order('example_index');

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

    // Organize by word and definition
    const wordMap = new Map<string, WordWithExamples>();

    data?.forEach(example => {
      const word = example.definitions?.word;
      if (!word) return;

      if (!wordMap.has(word)) {
        wordMap.set(word, {
          word,
          definitions: []
        });
      }

      const wordData = wordMap.get(word)!;
      let definition = wordData.definitions.find(d => 
        d.definition_index === example.definition_index
      );

      if (!definition) {
        definition = {
          definition_index: example.definition_index || 0,
          examples: []
        };
        wordData.definitions.push(definition);
      }

      definition.examples.push({
        ...example,
        definition_index: example.definition_index || 0,
        example_index: example.example_index || 0,
        native_text: example.native_text || '',
        french_text: example.french_text || ''
      });
    });

    return {
      data: Array.from(wordMap.values()).sort((a, b) => 
        a.word.localeCompare(b.word)
      )
    };
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
