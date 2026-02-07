import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import { CookieConsent } from '@/components/cookie-consent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'JobStack - Visual Infrastructure Planning Tool',
    template: '%s | JobStack',
  },
  description: 'Design your infrastructure visually and generate production-ready Terraform code instantly. Real-time cost estimation and collaboration tools.',
  keywords: ['infrastructure', 'terraform', 'cloud architecture', 'IaC', 'infrastructure as code', 'diagram', 'planning'],
  authors: [{ name: 'KobeCloud Jakub Pospieszny' }],
  creator: 'KobeCloud Jakub Pospieszny',
  publisher: 'KobeCloud',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'JobStack',
    title: 'JobStack - Visual Infrastructure Planning Tool',
    description: 'Design your infrastructure visually and generate production-ready Terraform code instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobStack - Visual Infrastructure Planning Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobStack - Visual Infrastructure Planning Tool',
    description: 'Design your infrastructure visually and generate production-ready Terraform code instantly.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <CookieConsent />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
