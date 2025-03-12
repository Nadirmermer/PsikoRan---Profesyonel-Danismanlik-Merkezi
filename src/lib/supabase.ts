import { createClient } from '@supabase/supabase-js';

// CRITICAL: Replace these values with your actual Supabase configuration
const supabaseUrl = 'https://hjfmevurucynhmdbxacd.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZm1ldnVydWN5bmhtZGJ4YWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyODI1NDUsImV4cCI6MjA1Mzg1ODU0NX0.WyDeF-vHwmK5XRWlzhkr3em5Fy6x2xliwZyt3tQwM20';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
