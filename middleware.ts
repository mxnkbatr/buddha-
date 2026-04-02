import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const locales = ['mn', 'en'];
const defaultLocale = 'mn';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
  // Add other public routes if needed
]);

const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)',
  '/:locale/admin(.*)',
  '/:locale/messenger(.*)',
  '/:locale/booking(.*)',
]);

// CORS headers for mobile app access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Handle CORS preflight for API routes
  if (pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders });
    }
    // For other API requests, add CORS headers to response
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // 1. Check if the path excludes specific files/api
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return; // Let Clerk/Next handle it
  }

  // 2. Check if pathname already has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Protect routes that require auth
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    return;
  }

  // 3. Redirect if no locale
  const locale = defaultLocale;
  const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url);
  return NextResponse.redirect(newUrl);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
