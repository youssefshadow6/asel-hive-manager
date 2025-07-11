// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://otsenzppsirnzafldwry.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90c2VuenBwc2lybnphZmxkd3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzk2MTAsImV4cCI6MjA2NjkxNTYxMH0.mvE51YEW0KFpFmUbMsDWZoy9cqSPalDxAzL_1UZR3aI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});