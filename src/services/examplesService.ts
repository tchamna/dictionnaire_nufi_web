import { supabase, Tables } from '@/lib/supabase';

export type Example = Tables['examples'];

export interface ExampleResponse {
  data: Example[] | null;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
}

/**
 * Fetch all examples with pagination
 */
export const getExamples = async (page = 0, pageSize = 20): Promise<ExampleResponse> => {
  try {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1)
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
};

/**
 * Get example by ID
 */
export const getExampleById = async (id: number): Promise<ExampleResponse> => {
  try {
    const { data, error } = await supabase
      .from('examples')
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
};

/**
 * Get examples by definition ID
 */
export async function getExamplesByDefinitionId(definitionId: number): Promise<ExampleResponse> {
  try {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .eq('definition_index', definitionId)
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
 * Fetch examples for multiple definitions at once
 */
export const getExamplesByDefinitionIds = async (definitionIds: number[]): Promise<ExampleResponse> => {
  try {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .in('definition_index', definitionIds)
      .order('definition_index, example_index');

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

    // Group examples by definition_index
    const groupedExamples = data?.reduce<Record<number, Example[]>>((acc, example) => {
      const defId = example.definition_index;
      if (!acc[defId]) acc[defId] = [];
      acc[defId].push(example);
      return acc;
    }, {});

    return { data: Object.values(groupedExamples).flat() };
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
};

/**
 * Search examples
 */
export const searchExamples = async (query: string, page = 0, pageSize = 20): Promise<ExampleResponse> => {
  try {
    const { data, error } = await supabase
      .from('examples')
      .select('*')
      .ilike('text', `%${query}%`)
      .range(page * pageSize, (page + 1) * pageSize - 1)
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
};
