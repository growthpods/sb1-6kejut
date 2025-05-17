import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Adjust the path to your generated types if they are not in the default location
// The included_files directive in netlify.toml should make 'src/types/**' available.
// Assuming the 'types' directory will be at a level accessible from here.
// If 'netlify/functions/types/' becomes the path, then it would be '../types/supabase'.
// If 'src/types/' is copied to the root of the function bundle, path might be different.
// Let's try a path assuming 'types' is a sibling to 'lib' within the function's bundled context.
// This might need adjustment based on Netlify's bundling structure with included_files.
// A safer bet, given included_files copies src/types, is to reference from a common root.
// If functions are in netlify/functions, and types are in src/types,
// and included_files makes src/types available at 'types/' relative to function root:
// This path assumes that after Netlify's bundling, 'types' will be a top-level dir for the function.
// Or, more likely, included_files are relative to the repo root.
// So, from netlify/functions/lib/supabase-server.ts, to reach src/types/supabase.ts:
// ../../src/types/supabase
import type { Database } from '../../../src/types/supabase'; // Path relative to netlify/functions/lib/

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set in environment variables.');
}
if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
}

// Create a single Supabase client instance for server-side use
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // No session persistence for server-side
    autoRefreshToken: false, // No auto-refresh for server-side
    // detectSessionInUrl: false, // Not needed for server-side
  },
  // Optional: Add global headers if needed for server-side client
  // global: {
  //   headers: {
  //     'X-Client-Info': 'intern-portal-netlify-functions'
  //   }
  // }
});
