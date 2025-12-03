import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pet Tome | Wizard101 Stats Calculator & Marketplace",
  description: "The ultimate tool for Wizard101 players. Calculate pet talent stats, simulate jewel sockets, and trade pets with the dedicated community. Optimize your build today.",
  openGraph: {
    title: "Pet Tome | Wizard101 Stats Calculator & Marketplace",
    description: "Calculate pet talent stats, simulate jewel sockets, and trade pets with the dedicated Wizard101 community.",
    url: "https://pet-tome.vercel.app", // Placeholder, user can update
    siteName: "Pet Tome",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pet Tome | Wizard101 Stats Calculator",
    description: "Calculate pet talent stats, simulate jewel sockets, and trade pets with the dedicated Wizard101 community.",
  },
};

import { SessionProvider } from "next-auth/react";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/Toaster";

import { PresenceTracker } from "@/components/PresenceTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <PresenceTracker />
          <Navbar />
          {children}
          <footer className="py-6 text-center text-sm text-white/30 border-t border-white/5 mt-12">
            <div className="flex justify-center gap-4">
              <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
              <span>•</span>
              <span>Wizard101 is a trademark of KingsIsle Entertainment. Not affiliated.</span>
            </div>
          </footer>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
