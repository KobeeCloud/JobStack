import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/cookie-banner";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobstack.pl";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JobStack",
  url: siteUrl,
  description: "Agregator ofert pracy IT w Polsce. Start 2026. Przez długi czas bez opłat.",
  inLanguage: "pl-PL",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JobStack — Agregator ofert pracy IT w Polsce",
    template: "%s | JobStack",
  },
  description:
    "Przeszukuj tysiące ofert pracy IT z NoFluffJobs, Pracuj.pl, Bulldogjob i innych portali w jednym miejscu. Za darmo!",
  keywords: [
    "praca",
    "oferty pracy",
    "IT",
    "programista",
    "developer",
    "job board",
    "NoFluffJobs",
    "Pracuj.pl",
    "Bulldogjob",
    "RocketJobs",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/",
    siteName: "JobStack",
    title: "JobStack — Agregator ofert pracy IT w Polsce",
    description:
      "Start 2026. Przez długi czas bez opłat. Najlepsze oferty IT w jednym miejscu.",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "JobStack — Agregator ofert pracy IT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobStack — Agregator ofert pracy IT",
    description:
      "Start 2026. Przez długi czas bez opłat. Najlepsze oferty IT w jednym miejscu.",
    images: ["/og.svg"],
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: ["/logo.svg"],
    apple: [{ url: "/logo.svg" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <CookieBanner />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
