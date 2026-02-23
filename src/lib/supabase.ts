import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables (.env)
// For demonstration, we'll use placeholder values that the user should replace
// Or we can provide a mock implementation if VITE_SUPABASE_URL isn't found.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
