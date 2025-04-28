// Basic service structure
import { supabase } from '@/lib/supabase';

export const getAffaires = async () => {
  const { data, error } = await supabase
    .from('affaires')
    .select('*');
    
  if (error) {
    console.error('Error fetching affaires:', error);
    return { error };
  }
  
  return { data };
}; 