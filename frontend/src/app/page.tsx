"use client";

import Link from 'next/link';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Top nav slides down
    tl.from('.nav-border', { scaleX: 0, transformOrigin: 'left', duration: 1.5, ease: 'power3.inOut' });
    tl.from('.nav-item', { y: -20, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, "-=1");

    // Huge text masking
    tl.from('.hero-word', { 
      yPercent: 100, 
      opacity: 0, 
      duration: 1.5, 
      stagger: 0.1, 
      ease: 'power4.out' 
    }, "-=0.8");

    // The thin lines expanding
    tl.from('.structural-line', { 
      scaleY: 0, 
      transformOrigin: 'top', 
      duration: 2, 
      ease: 'power3.inOut' 
    }, "-=1.5");

    // Content fade up
    tl.from('.fade-up', { 
      y: 30, 
      opacity: 0, 
      duration: 1.2, 
      stagger: 0.2, 
      ease: 'power2.out' 
    }, "-=1");

    // Continuous slow rotation for the play button border
    gsap.to('.play-ring', {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'linear'
    });

  }, { scope: container });

  return (
    <div ref={container} className="w-full min-h-screen relative bg-[#EBE5DF] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#EBE5DF] overflow-hidden">
      
      {/* ─── Structural Grid Lines ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 flex justify-between px-12">
        <div className="w-[1px] h-full bg-[#1A1A1A]/10 structural-line"></div>
        <div className="w-[1px] h-full bg-[#1A1A1A]/10 structural-line hidden md:block"></div>
        <div className="w-[1px] h-full bg-[#1A1A1A]/10 structural-line hidden md:block"></div>
        <div className="w-[1px] h-full bg-[#1A1A1A]/10 structural-line"></div>
      </div>

      {/* ─── Minimalist Top Nav ─── */}
      <nav className="w-full absolute top-0 left-0 z-30 px-12 pt-8">
        <div className="w-full flex items-start justify-between pb-6 border-b border-[#1A1A1A]/20 nav-border">
          <div className="nav-item">
            <h1 className="font-serif text-2xl tracking-[0.1em] leading-none">AURA<br/>REFRAME</h1>
          </div>

          <div className="hidden md:flex gap-16 text-[9px] font-bold tracking-[0.3em] uppercase opacity-60 mt-1">
            <span className="hover:opacity-100 cursor-pointer transition-opacity nav-item">Collections</span>
            <span className="hover:opacity-100 cursor-pointer transition-opacity nav-item">Atelier</span>
            <span className="hover:opacity-100 cursor-pointer transition-opacity nav-item">Journal</span>
          </div>

          <div className="nav-item flex items-center gap-6 mt-1">
            <span className="hidden md:block text-[9px] font-bold tracking-[0.3em] uppercase opacity-60">No. 001</span>
            <Link href="/scan" className="text-[9px] font-bold tracking-[0.3em] uppercase hover:opacity-60 transition-opacity">
              [ Initiate ]
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Main Editorial Canvas ─── */}
      <div className="w-full h-screen relative z-10 flex flex-col justify-end px-12 pb-12 pt-32">
        
        {/* Top Right Architectural Text */}
        <div className="absolute top-40 right-12 md:right-32 max-w-[200px] fade-up">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase leading-[1.8] opacity-50">
            WE ANALYZE STRUCTURAL TONES, NOT FLAWS. A BESPOKE HIGH-FASHION PALETTE GENERATED FROM YOUR RAW ESSENCE.
          </p>
        </div>

        {/* Central Play Interaction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fade-up">
          <button className="w-32 h-32 relative flex items-center justify-center group cursor-pointer">
            <div className="play-ring absolute inset-0 border-[0.5px] border-[#1A1A1A]/30 rounded-full border-dashed group-hover:border-solid transition-all duration-500"></div>
            <div className="absolute inset-2 border-[0.5px] border-[#1A1A1A]/10 rounded-full"></div>
            <Play className="w-6 h-6 text-[#1A1A1A] ml-1 opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
            <span className="absolute -bottom-8 text-[8px] font-bold tracking-[0.4em] uppercase opacity-40">Play Film</span>
          </button>
        </div>

        {/* Massive Staggered Typography */}
        <div className="relative w-full flex flex-col">
          <div className="overflow-hidden">
            <h2 className="hero-word font-serif text-[18vw] leading-[0.8] tracking-tighter text-[#1A1A1A]">
              REDEFINE
            </h2>
          </div>
          <div className="overflow-hidden flex justify-between items-end">
            <Link href="/scan" className="fade-up mb-4 md:mb-10 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full border-[0.5px] border-[#1A1A1A]/30 flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-[#EBE5DF] transition-colors duration-500">
                <ArrowRight className="w-4 h-4" strokeWidth={1} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Begin Analysis</span>
            </Link>
            <h2 className="hero-word font-serif text-[18vw] leading-[0.8] tracking-tighter text-[#1A1A1A]">
              IDENTITY
            </h2>
          </div>
        </div>

      </div>

    </div>
  );
}
