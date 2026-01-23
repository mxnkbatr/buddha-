// app/layout.tsx
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from 'next-themes'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SplashScreen from './components/SplashScreen'
import { AuthProvider } from '@/contexts/AuthContext'
import SmoothScroll from './components/SmoothScroll'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <AuthProvider>
          <html lang="en" suppressHydrationWarning>
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