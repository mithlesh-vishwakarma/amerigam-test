import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string, nextKey?: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== 'undefined' && process.env && nextKey && process.env[nextKey]) {
    return process.env[nextKey] as string;
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'placeholder-key';

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);
