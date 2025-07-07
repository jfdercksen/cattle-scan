import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Avoid re-initializing the client on every hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __supabase: SupabaseClient<Database> | undefined;
}

const SUPABASE_URL = "https://wtfnnkrmvpmmsvciejmv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5ua3JtdnBtbXN2Y2llam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjgyNzUsImV4cCI6MjA2NTkwNDI3NX0.JszpCfiJjk-pc_tpEKuRkC7a_n3M0mLaV_aNDSbUNpE";

let supabase: SupabaseClient<Database>;

if (import.meta.env.PROD) {
  supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  if (!globalThis.__supabase) {
    globalThis.__supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  supabase = globalThis.__supabase;
}

export { supabase };