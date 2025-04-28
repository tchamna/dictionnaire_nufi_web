import { supabase, Tables, handleSupabaseError } from '@/lib/supabase';

export type Job = Tables['jobs'];
export type JobFilter = {
  category?: string;
  job_type?: string;
  location?: string;
  search?: string;
};

export interface JobResponse {
  data: Tables['jobs'][] | null;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
  count?: number | null;
}

/**
 * Fetch jobs with optional filtering
 */
export async function getJobs(filters?: JobFilter): Promise<JobResponse> {
  try {
    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.job_type) {
        query = query.eq('job_type', filters.job_type);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }
    
    const { data, error } = await query;
    
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
 * Get a single job by ID
 */
export async function getJobById(id: string): Promise<JobResponse> {
  try {
    const { data, error } = await supabase
      .from('jobs')
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
 * Create a new job
 */
export async function createJob(job: Omit<Job, 'id' | 'created_at'>): Promise<JobResponse> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
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
 * Update an existing job
 */
export async function updateJob(id: string, updates: Partial<Omit<Job, 'id' | 'created_at'>>): Promise<JobResponse> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
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
 * Delete a job by ID
 */
export interface DeleteJobResponse {
  success?: boolean;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
}

export async function deleteJob(id: string): Promise<DeleteJobResponse> {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'unknown'
        }
      };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
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
 * Get all unique categories
 */
export interface CategoriesResponse {
  data: string[] | null;
  error?: {
    message: string;
    details?: string | null;
    hint?: string | null;
    code?: string;
  };
}

export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('category')
      .not('category', 'is', null);
    
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
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return { data: categories };
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
