"use client";

import { useEffect, useState, useRef } from 'react';
import MorphRevealCanvas from './MorphRevealCanvas';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function StylingResults() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sourceImg = sessionStorage.getItem('aura_source_image');
    if (sourceImg) {
      setSourceImage(sourceImg);
    }
  }, []);

  useGSAP(() => {
    // Parallax scrolling for the images
    const sections = gsap.utils.toArray('.lookbook-section');
    
    sections.forEach((section: any) => {
      const img = section.querySelector('.lookbook-img');
      const text = section.querySelector('.lookbook-text');
      
      gsap.fromTo(img, 
        { y: -50, scale: 1.1 },
        {
          y: 50,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );

      gsap.from(text, {
        opacity: 0,
        y: 100,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        }
      });
    });

  }, { scope: container });

  const outfits = [
    {
      id: 1,
      image: '/render_1.jpg',
      title: "LOOK 01 — THE MONOCHROME DRAPE",
      desc: "Structured tonal harmony, leveraging deep espresso contrast to frame the face.",
    },
    {
      id: 2,
      image: '/creative_luxury_fashion_ui.jpg',
      title: "LOOK 02 — ARCHITECTURAL SILK",
      desc: "Fluid dynamics intercepting sharp structural shoulders, designed for natural warmth.",
    },
    {
      id: 3,
      image: '/premium_warm_ui.jpg',
      title: "LOOK 03 — CASCADING NUDE",
      desc: "A sheer, breathable overlay that celebrates underlying skin geography instead of hiding it.",
    }
  ];

  return (
    <div ref={container} className="w-full bg-[#e8dedb] text-[#2b2726] font-sans pb-40">
      
      {/* ─── Header ─── */}
      <header className="w-full px-10 py-16 flex items-start justify-between border-b border-[#2b2726]/10 mb-20">
        <div>
          <h1 className="font-serif text-6xl tracking-tight mb-6">THE ATELIER</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 max-w-sm leading-loose">
            Tonal data translated. Flaw diagnostics discarded. 
            Below is your bespoke high-fashion aesthetic.
          </p>
        </div>
        
        {sourceImage && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold tracking-[0.3em] uppercase opacity-50 mb-3">Source Identity</span>
            <div className="w-24 h-32 overflow-hidden bg-black/5 p-1 border border-[#2b2726]/20">
              <img src={sourceImage} alt="Source" className="w-full h-full object-cover grayscale opacity-80" />
            </div>
          </div>
        )}
      </header>

      {/* ─── Lookbook Sections ─── */}
      <div className="flex flex-col gap-32 px-10">
        {outfits.map((outfit, index) => (
          <section key={outfit.id} className="lookbook-section flex flex-col md:flex-row items-center gap-16 md:gap-32 w-full max-w-7xl mx-auto">
            
            {/* Image (Parallax) */}
            <div className={`w-full md:w-3/5 overflow-hidden ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
              <div className="aspect-[3/4] w-full relative overflow-hidden bg-black/5">
                <div className="lookbook-img absolute inset-[-10%] w-[120%] h-[120%]">
                  <MorphRevealCanvas 
                    src={outfit.image} 
                    baseImage={sourceImage || '/hero_model.jpg'}
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className={`lookbook-text w-full md:w-2/5 flex flex-col ${index % 2 !== 0 ? 'md:order-1 items-end text-right' : 'items-start text-left'}`}>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-50 mb-6 block">
                {outfit.title}
              </span>
              <p className="font-serif text-3xl md:text-5xl leading-tight tracking-tight opacity-90">
                {outfit.desc}
              </p>
              
              <div className="mt-12 flex gap-4">
                <button className="px-8 py-3 text-[9px] font-bold tracking-[0.3em] uppercase border border-[#2b2726] hover:bg-[#2b2726] hover:text-[#e8dedb] transition-colors rounded-full">
                  Acquire
                </button>
                <button className="px-8 py-3 text-[9px] font-bold tracking-[0.3em] uppercase border border-transparent hover:border-[#2b2726]/30 transition-colors rounded-full">
                  Save
                </button>
              </div>
            </div>

          </section>
        ))}
      </div>

    </div>
  );
}
