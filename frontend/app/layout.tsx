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
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "The Commons | Wizard101 Community Hub",
  description: "The ultimate tool for Wizard101 players. Calculate pet talent stats, simulate jewel sockets, and trade pets with the dedicated community. Optimize your build today.",
  openGraph: {
    title: "The Commons | Wizard101 Community Hub",
    description: "Calculate pet talent stats, simulate jewel sockets, and trade pets with the dedicated Wizard101 community.",
    url: "https://commons.jrcodex.dev", // Updated placeholder
    siteName: "The Commons",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Commons | Wizard101 Community Hub",
    description: "Calculate pet talent stats, simulate jewel sockets, and trade pets with the dedicated Wizard101 community.",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};


import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { FirebaseAuthProvider } from "@/components/providers/FirebaseAuthProvider";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/layout/AppShell";
import { ScribeWidget } from "@/components/scribe-widget";
import OrderDashboard from "@/components/marketplace/OrderDashboard"; // Added import for AppShell

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
            <FirebaseAuthProvider>
                <ThemeProvider
                attribute="class"
                defaultTheme="candlelight"
                themes={["light", "dark", "candlelight", "abyss"]}
                enableSystem
                disableTransitionOnChange
                >
                <PresenceTracker />
                <ThemeColorManager />
    
                <AppShell>
                    {children}
                </AppShell>
                <OrderDashboard />
                <ScribeWidget />
                <Toaster />
              </ThemeProvider>
            </FirebaseAuthProvider>
      </body>
    </html>
  );
}
