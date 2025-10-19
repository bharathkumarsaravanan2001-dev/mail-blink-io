import { createClient } from '@supabase/supabase-js';

// User will need to replace these with their own Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
