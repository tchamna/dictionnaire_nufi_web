import { createClient } from '@supabase/supabase-js';

// Make sure these environment variables are properly set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add error checking to prevent the "supabaseUrl is required" error
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl || '', // Provide fallback empty string
  supabaseKey || ''  // Provide fallback empty string
);

// Type definitions for database tables
export type Tables = {
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary_range?: string;
    job_type?: string;
    created_at: string;
    category?: string;
  };
  
  // Dictionary/Definitions table
  definitions: {
    id: number;
    word: string;
    definition_text: string;
    definition_index: number;
    part_of_speech?: string;
    created_at: string;
    updated_at: string;
  };
  
  // Dictionary entries table
  dictionary_entries: {
    id: number;
    word: string;
    part_of_speech?: string;
    definition?: string;
    created_at: string;
    updated_at: string;
  };
  
  // Examples table
  examples: {
    id: number;
    word: string;
    definition_index: number;
    example_index: number;
    native_text: string;
    french_text?: string;
    created_at: string;
    updated_at?: string;
  };
  
  // Add more tables as needed
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}): { error: { message: string; details: string | null; hint: string | null; code: string; } } => {
  console.error('Supabase error:', error);
  return {
    error: {
      message: error?.message || 'An unknown error occurred',
      details: error?.details || null,
      hint: error?.hint || null,
      code: error?.code || 'unknown',
    },
  };
};
