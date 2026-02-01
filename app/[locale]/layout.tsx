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
              <link rel="preconnect" href="https://res.cloudinary.com" />
              <link rel="dns-prefetch" href="https://res.cloudinary.com" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link rel="preconnect" href="https://grainy-gradients.vercel.app" />
              <link rel="dns-prefetch" href="https://grainy-gradients.vercel.app" />
              <link rel="preconnect" href="https://www.transparenttextures.com" />
              <link rel="preconnect" href="https://clerk-telemetry.com" />
              <link rel="preconnect" href="https://img.clerk.com" />
              <link rel="canonical" href="https://gevabal.mn" />
            </head>
            <body className={`${playfair.variable} ${lato.variable} font-sans`}>
              <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
                <SmoothScroll />
                <SplashScreen />
                {children}
                <Footer />
              </ThemeProvider>
            </body>
          </html>
        </AuthProvider>
      </LanguageProvider>
    </ClerkProvider>
  )
}