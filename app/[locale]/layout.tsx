// app/layout.tsx
import { Playfair_Display, Lato } from 'next/font/google'
import '../globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import { AuthProvider } from '@/contexts/AuthContext'
import SmoothScroll from '../components/SmoothScroll'
import Navbar from '../components/Navbar'
import CapacitorInitWrapper from '../capacitor/CapacitorInitWrapper'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { cookies } from 'next/headers'
import { currentUser } from '@clerk/nextjs/server'
import { jwtVerify } from 'jose'
import { connectToDatabase } from '@/database/db'
import { ObjectId } from 'mongodb'

const SplashScreen = dynamic(() => import('../components/SplashScreen'))

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://gevabal.mn'),
  title: 'Gevabal - Spiritual Guidance',
  description: 'Book spiritual consultations with experienced monks',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  alternates: {
    canonical: './',
    languages: {
      'en': '/en',
      'mn': '/mn',
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const validLocale = (['mn', 'en'].includes(locale) ? locale : 'mn') as any;

  // Perform SSR Auth user fetching for performance
  let serverUser = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const JWT_SECRET = process.env.JWT_SECRET;
    const { db } = await connectToDatabase();

    if (token && JWT_SECRET) {
      try {
         const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
         if (payload.sub) {
           const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
           if (dbUser) serverUser = { ...dbUser, id: dbUser._id.toString(), isAuthenticated: true };
         }
      } catch (e) { /* ignore jwt error */ }
    }

    if (!serverUser) {
      const clerkUser = await currentUser();
      if (clerkUser) {
         let dbUser: any = await db.collection("users").findOne({ clerkId: clerkUser.id });
         if (!dbUser) {
           // Lazy create just in case to avoid empty states
           const role = (clerkUser.unsafeMetadata?.role as string) || "client";
           dbUser = {
              clerkId: clerkUser.id,
              email: clerkUser.emailAddresses[0]?.emailAddress,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              avatar: clerkUser.imageUrl,
              role: role,
           };
           await db.collection("users").insertOne(dbUser);
         }
         serverUser = { ...dbUser, id: clerkUser.id, isAuthenticated: true };
      }
    }
  } catch (e) {
    console.error("Layout SSR Auth Error", e);
  }

  return (
    <ClerkProvider>
      <LanguageProvider initialLocale={validLocale}>
        <AuthProvider initialUser={serverUser}>
          <html lang={validLocale} suppressHydrationWarning>
            <head>
              {/* Mobile viewport for edge-to-edge design */}
              <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
              {/* iOS PWA meta tags */}
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
              <meta name="mobile-web-app-capable" content="yes" />
              {/* Theme color for Android status bar to match cream background */}
              <meta name="theme-color" content="#FDFBF7" />
              {/* Preconnects */}
              <link rel="preconnect" href="https://res.cloudinary.com" />
              <link rel="dns-prefetch" href="https://res.cloudinary.com" />
              <link rel="preconnect" href="https://clerk-telemetry.com" />
              <link rel="preconnect" href="https://img.clerk.com" />
            </head>
            <body className={`${playfair.variable} ${lato.variable} font-sans overflow-x-hidden`}>
              <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
                <CapacitorInitWrapper />
                <SmoothScroll />
                <NotificationProvider>
                  <Navbar />
                  <SplashScreen />
                  <main className="w-full relative overflow-x-hidden" style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)'
                  }}>
                    {children}
                  </main>
                </NotificationProvider>
              </ThemeProvider>
            </body>
          </html>
        </AuthProvider>
      </LanguageProvider>
    </ClerkProvider>
  )
}