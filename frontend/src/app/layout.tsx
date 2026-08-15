import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Aura Reframe",
  description: "A dignity-focused styling agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex flex-col overflow-x-hidden relative`}>
        
        {/* Editorial Top Nav */}
        <header className="py-6 px-8 flex items-center justify-between z-20 text-foreground">
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-medium">
            <span>New Drop</span>
            <span>Manifesto</span>
            <span>Contact</span>
          </div>
          <h1 className="text-xl font-serif tracking-[0.2em] uppercase">Aura</h1>
          <div className="flex gap-6">
            <span>Search</span>
            <span>Cart (0)</span>
          </div>
        </header>

        {/* NEONOVA Marquee Ticker */}
        <div className="absolute top-24 w-full overflow-hidden bg-white text-black py-3 z-10 font-bold border-y border-white/20 shadow-glow">
          <div className="whitespace-nowrap flex animate-marquee">
            <span className="text-[12px] uppercase tracking-[0.3em] font-sans px-4">
              SOURCE CODE / GLITCH OUT / NOT A BRAND / NOT A LINE / FUTURE IS HERE / ASSEMBLY / SHOW YOURSELF / CONTROL / SOURCE CODE / GLITCH OUT / NOT A BRAND / NOT A LINE / FUTURE IS HERE / ASSEMBLY / SHOW YOURSELF / CONTROL
            </span>
          </div>
        </div>
        
        <main className="flex-1 w-full relative z-10 pt-24 pb-20">
          {children}
        </main>

      </body>
    </html>
  );
}
