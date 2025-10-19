import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check if Supabase credentials are configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseUrl !== 'YOUR_SUPABASE_URL');

// Only create client if credentials are properly configured
export const supabase: SupabaseClient | null = isSupabaseConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
