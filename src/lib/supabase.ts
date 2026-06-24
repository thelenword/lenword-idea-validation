import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zpwarhctbmawtdpaamwt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd2FyaGN0Ym1hd3RkcGFhbXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzYyODcsImV4cCI6MjA5NzYxMjI4N30.h3qnmPf6UE0G_Inkt71yWsOGI8-bcDbuyo-Vjp-cPvY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
