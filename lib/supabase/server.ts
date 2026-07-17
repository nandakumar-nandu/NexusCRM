import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase Server Client
 * 
 * Difference between Client and Server instances:
 * - Server Client: Runs inside Node.js/Edge contexts (Server Components, Actions, and API Routes).
 *   It accesses the request headers/cookies securely and is capable of performing database mutations
 *   that should remain protected.
 * - Browser Client: Runs in the browser and accesses client-accessible cookies.
 * 
 * Why both are needed:
 * A server client is required to read current request cookies and inject user auth sessions
 * directly into server-rendered pages. This allows server-side pages to determine authentication status and
 * load data before sending HTML to the client, preventing content layout shifts.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // Next.js throws an error if cookies are written to within a Server Component.
            // This is safe to ignore because middleware manages token refreshes.
          }
        },
      },
    }
  );
}
