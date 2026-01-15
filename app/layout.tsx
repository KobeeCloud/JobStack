import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobStack - Find Your Perfect Job in One Place",
  description: "Search thousands of job opportunities from all major Polish job boards in one place. JustJoin.it, NoFluffJobs, Pracuj.pl and more.",
  keywords: ["jobs", "praca", "career", "IT jobs", "job search", "job board"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
