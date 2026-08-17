"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("Initializing...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        const sourceB64 = sessionStorage.getItem('aura_source_b64');
        const sourceImg = sessionStorage.getItem('aura_source_image');
        const selectedStyle = sessionStorage.getItem('aura_selected_style') || 'avant-garde';
        
        if (!sourceB64 && !sourceImg) {
          throw new Error("No image data found. Please return to the scan page.");
        }

        // 1. Analyze
        setStatus("Extracting visual code...");
        await new Promise(r => setTimeout(r, 2000));
        
        // 2. Style
        setStatus(`Translating to ${selectedStyle.toUpperCase()} aesthetic...`);
        await new Promise(r => setTimeout(r, 2000));
        
        // 3. Try On
        setStatus("Generating bespoke editorial...");
        await new Promise(r => setTimeout(r, 2500));

        let mockRenders = [];
        let rationale = "";
        let labels = [];

        switch (selectedStyle) {
          case 'brutalism':
            mockRenders = [
              "/hero_model.jpg",
              "/editorial_hero.jpg"
            ];
            rationale = "Your structural code aligned with Brutalism demands heavy leathers, asymmetric cuts, and industrial hardware. Function transformed into severe fashion.";
            labels = ["Leather", "Asymmetry", "Hardware", "Function"];
            break;
          case 'minimalism':
            mockRenders = [
              "/editorial_hero.jpg",
              "/render_1.jpg"
            ];
            rationale = "Translating your geometry into Fluid Minimalism requires draped silks, muted earth tones, and seamless tailoring. Unobstructed, continuous lines.";
            labels = ["Silk", "Drape", "Earth", "Seamless"];
            break;
          case 'cyber':
            mockRenders = [
              "/cinematic_bg.jpg",
              "/hero_model.jpg"
            ];
            rationale = "Your high-contrast structure applied to Cyber Utility yields tech-wear fabrics, hyper-functional layering, and stark monochromatic palettes.";
            labels = ["Tech", "Utility", "Monochrome", "Layers"];
            break;
          case 'avant-garde':
          default:
            mockRenders = [
              "/render_1.jpg", 
              "/hero_model.jpg"
            ];
            rationale = "Your structural code demands severe tailoring and sheer volume. We've replaced conventional warmth with absolute form. Silk against skin, structure against void.";
            labels = ["Form", "Structure", "Void", "Avant-Garde"];
            break;
        }

        const mockProfile = {
          palette_description: "A bespoke architectural palette generated from your aesthetic choice.",
          styling_rationale: rationale,
          structural_labels: labels,
          vto_parameters: {},
          render_urls: mockRenders 
        };
        
        sessionStorage.setItem('aura_styling_profile', JSON.stringify(mockProfile));
        router.push('/collection');

      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "An unexpected error occurred.");
      }
    };

    processImage();
  }, [router]);

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center overflow-hidden bg-background text-foreground">
      
      <div className="relative z-10 w-full max-w-xl mx-auto px-12 flex flex-col items-center justify-center min-h-[75vh]">
        {!errorMessage ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-12">
            <div className="w-16 h-16 border-[3px] border-foreground/10 border-t-foreground rounded-full animate-spin"></div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/70 text-center animate-fade-up">
              {status}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-center">
            <div className="text-6xl font-serif text-red-800">!</div>
            <p className="font-serif text-2xl text-foreground">System Error</p>
            <p className="text-xs uppercase tracking-widest text-foreground/60 max-w-md leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => router.push('/scan')}
              className="pill-btn-solid px-8 py-3 mt-8 text-[10px] uppercase tracking-widest"
            >
              Restart Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
