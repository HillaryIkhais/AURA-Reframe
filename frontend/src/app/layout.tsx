import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Aura Reframe",
  description: "Aura Reframe — Redefine Your Identity",
};

import SmoothScroller from '../components/SmoothScroller';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen relative overflow-x-hidden text-foreground bg-background selection:bg-foreground selection:text-background font-sans antialiased">
        <SmoothScroller>
          <main className="w-full relative z-10 min-h-screen">
            {children}
          </main>
        </SmoothScroller>
      </body>
    </html>
  );
}
