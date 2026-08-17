"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const ARCHIVE_STYLES = [
  {
    id: "avant-garde",
    title: "Avant-Garde",
    description: "Architectural shapes, sheer volume, and absolute contrast.",
    image: "/render_1.jpg"
  },
  {
    id: "brutalism",
    title: "Brutalism",
    description: "Heavy leathers, asymmetric cuts, and industrial hardware.",
    image: "/hero_model.jpg"
  },
  {
    id: "minimalism",
    title: "Minimalism",
    description: "Draped silks, muted earth tones, and seamless tailoring.",
    image: "/editorial_hero.jpg"
  },
  {
    id: "cyber",
    title: "Cyber Utility",
    description: "Tech-wear fabrics, hyper-functional layering.",
    image: "/cinematic_bg.jpg"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function ArchivePage() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleContinue = () => {
    if (selectedStyle) {
      sessionStorage.setItem('aura_selected_style', selectedStyle);
      router.push('/processing');
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-background text-foreground flex flex-col font-sans">

      {/* ─── Top Navigation ─── */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full flex items-center justify-between px-8 py-6 z-30"
      >
        <button onClick={() => router.back()} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Back</span>
        </button>
        <div className="font-serif text-xl tracking-[0.4em] uppercase font-semibold">
          ARCHIVE
        </div>
        <div className="w-[70px]"></div> {/* Spacer for centering */}
      </motion.nav>

      {/* ─── Center Content ─── */}
      <div className="flex-1 relative z-20 w-full max-w-6xl mx-auto px-8 xl:px-0 flex flex-col justify-center py-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-4">Select Aesthetic</h2>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/60">Guide the structural reframing engine</p>
        </motion.div>

        {/* The Archive Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {ARCHIVE_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <motion.button
                variants={itemVariants}
                key={style.id}
                onClick={() => handleSelect(style.id)}
                className={`group relative aspect-[3/4] overflow-hidden transition-all duration-500 text-left ${
                  isSelected ? 'border-[4px] border-foreground p-1 scale-[1.02]' : 'hover:opacity-90'
                }`}
              >
                <div className="w-full h-full relative overflow-hidden bg-foreground/5">
                  <img src={style.image} alt={style.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 mix-blend-multiply" />
                  
                  {/* High end white gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-95"></div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center z-10">
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center mb-4 shadow-xl"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                    <h3 className="font-serif text-2xl text-foreground mb-2">{style.title}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-foreground/70 leading-relaxed font-semibold">
                      {style.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Continue Button */}
        <div className="mt-16 flex justify-center pb-12">
          <button 
            onClick={handleContinue}
            disabled={!selectedStyle}
            className={`pill-btn-solid px-12 py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 shadow-xl ${
              selectedStyle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            Confirm Selection
          </button>
        </div>

      </div>

    </div>
  );
}
