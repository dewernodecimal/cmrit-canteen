// ============================================================
// Supabase Server Client (for API routes & server components)
// ============================================================
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server client using anon key (respects RLS)
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Admin client using service role key (bypasses RLS)
// ONLY use in trusted server contexts like webhook handlers
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
