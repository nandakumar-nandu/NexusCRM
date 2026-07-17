import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Browser Client
 * 
 * Difference between Client and Server instances:
 * - Browser Client: Executed in the user's browser. It reads/writes cookies that are
 *   accessible to client-side scripts and handles real-time subscriptions, auth listeners,
 *   and operations within client components ("use client").
 * - Server Client: Executed in Node.js/Edge environments (Server Components, Server Actions,
 *   and Route Handlers). It directly accesses the raw HTTP request/response cookies.
 * 
 * Why both are needed:
 * Next.js App Router uses a hybrid rendering strategy. Since pages are rendered on the server
 * first and then hydrated in the browser, the application needs a way to securely retrieve and
 * refresh the user session in BOTH environments. The browser client enables interactive,
 * client-side actions, while the server client enables secure data fetching on the server
 * without exposing credentials to client scripts.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
