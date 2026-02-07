import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;
let supabaseError = null;

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseError = 'Supabase URL or Anon Key is missing. Please check your environment variables.';
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseInstance;
export const getSupabaseError = () => supabaseError;
