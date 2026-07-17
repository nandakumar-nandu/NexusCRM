import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase Session Middleware
 * 
 * Difference between Client and Server instances:
 * - Middleware Client: Executed on the Next.js Edge Runtime. It handles session validation
 *   and refreshes expired Auth tokens by intercepting cookies on every incoming request.
 * - Why it's needed:
 *   In Next.js, Server Components cannot modify cookies (they are read-only). If the user's
 *   session token expires while they are browse-active, only a middleware interceptor has the
 *   ability to write the new refresh token cookie back to the response headers before the
 *   requested page renders. This keeps user sessions alive seamlessly.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session token if active
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  // Check for mock demo session cookie
  const hasDemoSession = request.cookies.get('nexus-demo-session')?.value === 'true';
  
  // Treat as authenticated if we have a real user or a demo session cookie
  const user = supabaseUser || (hasDemoSession ? { 
    email: 'demo@nexuscrm.com', 
    user_metadata: { display_name: 'Demo Admin', avatar_url: '' } 
  } : null);

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  // Define dashboard paths to protect
  const isDashboardPage = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/customers') || 
    request.nextUrl.pathname.startsWith('/leads') || 
    request.nextUrl.pathname.startsWith('/tasks') || 
    request.nextUrl.pathname.startsWith('/reports') || 
    request.nextUrl.pathname.startsWith('/settings');

  // If user is not authenticated and is trying to access dashboard paths, redirect to login
  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is authenticated and is trying to access login, redirect to dashboard root
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
