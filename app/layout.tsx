// app/layout.tsx
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from 'next-themes'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SplashScreen from './components/SplashScreen'
import 'next-cloudinary/dist/cld-video-player.css';

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
        <html lang="en" suppressHydrationWarning>
          <head>
            <link rel="preconnect" href="https://res.cloudinary.com" />
            <link rel="preconnect" href="https://grainy-gradients.vercel.app" />
            <link rel="preconnect" href="https://www.transparenttextures.com" />
            <link rel="preconnect" href="https://i.pravatar.cc" />
          </head>
          <body className={`${playfair.variable} ${lato.variable} font-sans`}>
            <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
              <SplashScreen />
              {children}
              <Footer />
            </ThemeProvider>
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  )
}