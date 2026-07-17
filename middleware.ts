import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js Edge Middleware
 * 
 * How Next.js Middleware works:
 * 1. Request Interception: Before a request completes and renders a route or loads a static
 *    asset, Next.js Middleware intercepts the request at the Edge Runtime level.
 * 2. Non-blocking Edge Execution: Runs on Vercel Edge / lightweight V8 engines, which makes it
 *    extremely fast and run before server-side rendering (SSR) starts.
 * 3. Session Refresh: In this file, it extracts session cookies and refreshes the Supabase token
 *    by calling `updateSession()`. This handles cookie updates on the HTTP response before the
 *    page renders on the server.
 * 4. Conditional Redirection: Evaluates if the path should be protected (like /dashboard paths)
 *    and redirects unauthenticated users to `/login`, or authenticated users away from `/login`.
 * 5. Matching Filter: The config object specifies which paths are intercepted (excluding static files,
 *    images, and metadata like favicons).
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
