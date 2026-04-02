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

const Footer = dynamic(() => import('../components/Footer'))
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

  return (
    <ClerkProvider>
      <LanguageProvider initialLocale={validLocale}>
        <AuthProvider>
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
                <Navbar />
                <SplashScreen />
                <main className="w-full relative pb-32 md:pb-0 overflow-x-hidden">
                  {children}
                  <Footer />
                </main>
              </ThemeProvider>
            </body>
          </html>
        </AuthProvider>
      </LanguageProvider>
    </ClerkProvider>
  )
}