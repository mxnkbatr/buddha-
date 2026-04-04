import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const locales = ['mn', 'en'];
const defaultLocale = 'mn';
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

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

async function isValidCustomToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return !!payload.sub;
  } catch (err) {
    return false;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Handle CORS preflight for API routes
  if (pathname.startsWith('/api')) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders });
    }
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Skip internals and static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return;
  }

  // Check if pathname already has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // AUTH PROTECTION LOGIC
  if (isProtectedRoute(req)) {
    // 1. Check Custom JWT first
    const customToken = req.cookies.get('auth_token')?.value;
    const isCustomAuth = await isValidCustomToken(customToken);

    // 2. If NOT custom auth, enforce Clerk protection
    if (!isCustomAuth) {
      await auth.protect();
    }
  }

  if (pathnameHasLocale) {
    return;
  }

  // Redirect if no locale
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
