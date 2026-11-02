"use client";

import { useEffect, useState, useRef } from 'react';
import MorphRevealCanvas from './MorphRevealCanvas';
import { useGSAP } from '@gsap/react';

interface StylingResultsProps {
  profile?: any;
  onReset?: () => void;
}

export default function StylingResults({ profile: propProfile, onReset }: StylingResultsProps) {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any>(propProfile || null);

  useEffect(() => {
    const sourceImg = sessionStorage.getItem('aura_source_image');
    if (sourceImg) {
      setSourceImage(sourceImg);
    }
    if (!propProfile) {
      const profileStr = sessionStorage.getItem('aura_styling_profile');
      if (profileStr) {
        setProfile(JSON.parse(profileStr));
      }
    }
  }, [propProfile]);

  useGSAP(() => {
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
  }, { scope: container, dependencies: [profile] });

  // Determine style direction from profile rationale
  const direction = profile?.styling_rationale 
    ?.toLowerCase()
    ?.match(/bold|understated|warm|cool|formal|everyday/)
    ?.at(0) || "everyday";

  const directionLabels: Record<string, string> = {
    bold: "Bold",
    understated: "Understated", 
    warm: "Warm",
    cool: "Cool",
    formal: "Formal",
    everyday: "Everyday"
  };

  // Extract recommended garment IDs from profile
  const recommendedIds = profile?.recommended_garment_ids || [];
  
  // Catalogue mapping for display
  const CATALOGUE: any[] = [
    { id: "01", name: "Cotton White Top", colour: "#F8F8F8", category: "top", directions: ["understated", "everyday"] },
    { id: "02", name: "Deep Teal Blouse", colour: "#2D5A87", category: "top", directions: ["bold", "experimental"] },
    { id: "03", name: "Warm Camel Dress", colour: "#C49A6C", category: "dress", directions: ["warm", "everyday", "formal"] },
    { id: "04", name: "Sage Green Jacket", colour: "#6B8E65", category: "jacket", directions: ["soft", "everyday"] },
    { id: "05", name: "Royal Purple Top", colour: "#6A0DAD", category: "top", directions: ["bold", "experimental"] },
    { id: "06", name: "Blush Pink Dress", colour: "#E8B4BC", category: "dress", directions: ["soft", "everyday"] },
    { id: "07", name: "Nero Jacket", colour: "#252526", category: "jacket", directions: ["bold", "formal"] },
    { id: "08", name: "Ochre Top", colour: "#C58640", category: "top", directions: ["warm", "experimental"] },
    { id: "09", name: "Ivory Dress", colour: "#FFFFF0", category: "dress", directions: ["understated", "everyday"] },
    { id: "10", name: "Forest Green Jacket", colour: "#228B22", category: "jacket", directions: ["soft", "everyday", "warm"] },
    { id: "11", name: "Coral Top", colour: "#FF7F50", category: "top", directions: ["bold", "experimental"] },
    { id: "12", name: "Sky Blue Dress", colour: "#87CEEB", category: "dress", directions: ["cool", "everyday"] },
    { id: "13", name: "Metallic Silver Jacket", colour: "#C0C0C0", category: "jacket", directions: ["bold", "experimental"] },
    { id: "14", name: "Lavender Dress", colour: "#E6E6FA", category: "dress", directions: ["soft", "everyday", "cool"] },
    { id: "15", name: "Charcoal Top", colour: "#36454F", category: "top", directions: ["formal", "understated"] },
    { id: "16", name: "Gold Accessory", colour: "#FFD700", category: "accessory", directions: ["bold", "experimental"] },
  ];

  const recommendedGarments = recommendedIds
    .map((id: string) => CATALOGUE.find((g: any) => g.id === id))
    .filter((g: any) => g);

  // Generate the Reframe banner HTML
  const reframeBanner = (
    <div className="reframe-banner mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-3 bg-[#2b2726]/50 rounded-md text-[9px] uppercase tracking-[0.3em] text-[#e8dedb]">
        <span className="w-2 h-2 rounded-full bg-[#FFD700] flex-shrink-0"></span>
        <span>Reframe Switch: Your colour story. A palette for exploring personal style, not evaluating skin.</span>
      </div>
    </div>
  );

  // Generate dynamic outfits from backend profile
  const outfits = profile?.render_urls?.map((url: string, idx: number) => ({
    id: idx + 1,
    image: url,
    title: `LOOK 0${idx + 1} — ${directionLabels[direction] || direction} STYLING`,
    desc: idx === 0 ? profile.styling_rationale : "Structural integrity preserved. Form elevated.",
  })) || [];

  return (
    <div ref={container} className="w-full bg-[#e8dedb] text-[#2b2726] font-sans pb-40">
      
      {/* ─── Navigation ─── */}
      <nav className="w-full px-10 py-6 flex items-center justify-between sticky top-0 z-50 bg-[#e8dedb]/90 backdrop-blur-sm border-b border-[#2b2726]/5">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="text-lg">←</span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Back</span>
        </button>
        <span className="text-sm font-serif tracking-[0.3em] uppercase">A U R A</span>
        <button 
          onClick={() => { sessionStorage.clear(); window.location.href = '/'; }} 
          className="text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
        >
          Start Over
        </button>
      </nav>

      {/* ─── Header ─── */}
      <header className="w-full px-10 py-16 flex items-start justify-between border-b border-[#2b2726]/10 mb-20">
        <div>
          <h1 className="font-serif text-6xl tracking-tight mb-6">THE ATELIER</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 max-w-sm leading-loose">
            {profile.palette_description}
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

      {/* ─── Reframe Banner --- */}
      {reframeBanner}

      {/* ─── Lookbook Sections ─── */}
      <div className="flex flex-col gap-32 px-10">
        {outfits.map((outfit, index) => (
          <section key={outfit.id} className="lookbook-section flex flex-col md:flex-row items-center gap-16 md:gap-32 w-full max-w-7xl mx-auto">
            
            {/* Image (Parallax) */}
            <div className={`w-full md:w-3/5 overflow-hidden ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
              <div className="aspect-[3/4] w-full relative overflow-hidden bg-black/5">
                <div className="lookbook-img absolute inset-[-10%] w-[120%] h-[120%]">
                  {sourceImage && (
                    <MorphRevealCanvas 
                      src={outfit.image} 
                      baseImage={sourceImage || '/hero_model.jpg'}
                    />
                  )}
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
                  Try On
                </button>
                <button className="px-8 py-3 text-[9px] font-bold tracking-[0.3em] uppercase border border-transparent hover:border-[#2b2726]/30 transition-colors rounded-full">
                  Save
                </button>
              </div>
            </div>

          </section>
        ))}

        {/* Recommended Garments from Backend --- */}
        {recommendedGarments.length > 0 && (
          <div className="mt-16 p-6 bg-[#2b2726]/50 rounded-xl">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-4 text-[#e8dedb]">Recommended Garments</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedGarments.map((g) => (
                <div
                  key={g.id}
                  className="
                    px-4 py-3 border border-[#2b2726]/30 rounded-md 
                    text-left transition-colors group-hover:border-[#2b2726]
                  "
                >
                  <p className="font-serif text-sm line-clamp-1">{g.name}</p>
                  <p className="text-[8px] uppercase opacity-60 mb-1">{g.colour}</p>
                  <p className="text-[7px] opacity-50 text-xs">{g.directions.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Look CTA */}
        <div className="mt-16 flex justify-center pb-12">
          <button 
            onClick={() => {
              // Save current look with garment references
              const looks = JSON.parse(localStorage.getItem('aura_saved_looks') || '[]');
              const newLook = {
                garmentIds: recommendedIds,
                direction: direction,
                palette: profile.palette_description,
                timestamp: new Date().toISOString()
              };
              looks.push(newLook);
              localStorage.setItem('aura_saved_looks', JSON.stringify(looks));
            }}
            className="px-12 py-3 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 shadow-xl">
            Save This Look
          </button>
        </div>

      </div>

    </div>
  );
}