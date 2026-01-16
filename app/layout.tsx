import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/cookie-banner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "JobStack - Agregator ofert pracy IT w Polsce",
  description: "Przeszukuj tysiące ofert pracy IT z NoFluffJobs, Pracuj.pl, Bulldogjob i innych portali w jednym miejscu. Za darmo!",
  keywords: ["praca", "oferty pracy", "IT", "programista", "developer", "job board", "NoFluffJobs", "Pracuj.pl"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
