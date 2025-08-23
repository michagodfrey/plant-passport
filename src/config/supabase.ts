import { createClient } from '@supabase/supabase-js';
import type { DatabaseConfig } from '@/types/database';

// Supabase configuration
const supabaseConfig: DatabaseConfig = {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Validate configuration
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn('Supabase configuration is incomplete. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export default supabase;
