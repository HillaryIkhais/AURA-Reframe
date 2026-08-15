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
        if (!sourceB64) {
          throw new Error("No image data found. Please return to the scan page.");
        }

        // Convert base64 back to Blob to send as FormData for /analyze
        const res = await fetch(`data:image/jpeg;base64,${sourceB64}`);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('file', blob, 'upload.jpg');

        // 1. Analyze
        setStatus("Extracting raw visual code via YouCam...");
        const analyzeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyze`, {
          method: 'POST',
          body: formData,
        });
        
        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.detail || 'Skin analysis failed');
        }
        const analyzeData = await analyzeRes.json();

        // 2. Style
        setStatus("Reframing palette structure via Gemini...");
        const styleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/style`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_image_b64: sourceB64,
            mask_b64s: analyzeData.mask_b64s,
            structural_labels: analyzeData.structural_labels
          }),
        });

        if (!styleRes.ok) {
          const err = await styleRes.json();
          throw new Error(err.detail || 'Styling reframing failed');
        }
        const styleData = await styleRes.json();

        // 3. Try On
        setStatus("Generating editorial VTO renders...");
        const tryonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/tryon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vto_parameters: styleData.vto_parameters,
            source_image_b64: sourceB64
          }),
        });

        if (!tryonRes.ok) {
          const err = await tryonRes.json();
          throw new Error(err.detail || 'Apparel VTO failed');
        }
        const tryonData = await tryonRes.json();

        // Save results
        const finalProfile = {
          ...styleData,
          mock_renders: tryonData.render_urls
        };
        sessionStorage.setItem('aura_styling_profile', JSON.stringify(finalProfile));
        
        // Route to collection
        router.push('/collection');

      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "An unexpected error occurred during API integration.");
      }
    };

    processImage();
  }, [router]);

  return (
    <div className="w-full min-h-screen relative animate-fade-in overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background">
      
      {/* Massive Glowing Editorial Background Typography */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0">
        <h1 className="text-[20vw] leading-[0.7] font-serif uppercase tracking-tighter text-foreground opacity-5 blur-[2px] shadow-glow-strong">
          AURA<br/>REFRAME
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-12 flex flex-col items-center justify-center min-h-[75vh]">
        {!errorMessage ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-foreground">
            <div className="text-8xl font-sans font-thin animate-pulse drop-shadow-glow">...</div>
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] opacity-80 shadow-glow text-center">
              {status}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-foreground">
            <div className="text-6xl font-serif text-red-500 drop-shadow-glow">!</div>
            <p className="font-sans text-xs uppercase tracking-widest text-center max-w-md opacity-80">
              System Error
            </p>
            <p className="text-sm font-mono opacity-50 max-w-lg text-center break-words">
              {errorMessage}
            </p>
            <button 
              onClick={() => router.push('/scan')}
              className="text-[10px] uppercase tracking-[0.3em] mt-8 border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
            >
              Re-initialize
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
