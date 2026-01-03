import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e3" }, // Solarized Beige Sidebar
    { media: "(prefers-color-scheme: dark)", color: "#11222a" },
  ],
};

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

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/layout/AppShell"; // Added import for AppShell

import { PresenceTracker } from "@/components/PresenceTracker";
import { ThemeColorManager } from "@/components/ThemeColorManager";

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
            <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={["light", "dark", "candlelight", "abyss"]}
            enableSystem
            disableTransitionOnChange
            >
            <PresenceTracker />
            <ThemeColorManager />

            <AppShell>
                {children}
            </AppShell>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
