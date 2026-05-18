import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Improved validation to prevent 500 errors on invalid URLs
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.warn(
    'CRITICAL: Supabase credentials are missing or invalid in .env.local. ' +
    'Please ensure NEXT_PUBLIC_SUPABASE_URL is a valid https:// URL.'
  );
}

export const supabase = createBrowserClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-fix.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
