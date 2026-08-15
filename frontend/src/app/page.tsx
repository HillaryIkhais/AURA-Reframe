"use client";

import { useState } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import StylingResults from '../components/StylingResults';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'styling' | 'tryon' | 'results' | 'error'>('upload');
  const [stylingProfile, setStylingProfile] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleUpload = async (file: File) => {
    setStep('analyzing');
    setErrorMessage("");
    
    try {
      // 1. Convert file to base64 for later steps
      const toBase64 = (f: File): Promise<string> => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => {
              const res = reader.result as string;
              // Strip the data URL prefix for the backend
              resolve(res.split(',')[1]);
          };
          reader.onerror = error => reject(error);
      });
      const sourceB64 = await toBase64(file);

      // 2. Skin Analysis API
      const formData = new FormData();
      formData.append('file', file);
      
      const analyzeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.detail || 'Skin analysis failed');
      }
      const analyzeData = await analyzeRes.json();

      setStep('styling');

      // 3. Style / Reframe API
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

      setStep('tryon');

      // 4. Apparel VTO API
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

      // Combine profile and renders
      setStylingProfile({
        ...styleData,
        mock_renders: tryonData.render_urls
      });
      
      setStep('results');

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An unexpected error occurred during API integration.");
      setStep('error');
    }
  };

  return (
    <div className="w-full min-h-screen relative animate-fade-in overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background">
      
      {/* Massive Glowing Editorial Background Typography (DENIM style) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0">
        <h1 className="text-[20vw] leading-[0.7] font-serif uppercase tracking-tighter text-foreground opacity-5 blur-[2px] shadow-glow-strong">
          AURA<br/>REFRAME
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-12 flex flex-col items-center justify-center min-h-[75vh]">
        
        {step === 'upload' && (
          <>
            <div className="text-center mb-16 text-foreground">
              <h2 className="text-4xl sm:text-7xl font-sans font-thin uppercase tracking-[0.2em] mb-4 drop-shadow-glow">
                NEONOVA
              </h2>
              <p className="font-sans font-light max-w-lg mx-auto text-[10px] tracking-[0.3em] uppercase opacity-60 mt-8">
                Upload a photo. We analyze your structural tones, not your flaws. A unique palette generated from your raw visual code.
              </p>
            </div>
            <PhotoUpload onUpload={handleUpload} />
          </>
        )}

        {(step === 'analyzing' || step === 'styling' || step === 'tryon') && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-foreground">
            <div className="text-8xl font-sans font-thin animate-pulse drop-shadow-glow">...</div>
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] opacity-80 shadow-glow">
              {step === 'analyzing' && "Extracting raw visual code via YouCam..."}
              {step === 'styling' && "Reframing palette structure via Gemini..."}
              {step === 'tryon' && "Generating editorial VTO renders..."}
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-foreground">
            <div className="text-6xl font-serif text-red-500 drop-shadow-glow">!</div>
            <p className="font-sans text-xs uppercase tracking-widest text-center max-w-md opacity-80">
              System Error
            </p>
            <p className="text-sm font-mono opacity-50 max-w-lg text-center break-words">
              {errorMessage}
            </p>
            <button 
              onClick={() => setStep('upload')}
              className="text-[10px] uppercase tracking-[0.3em] mt-8 border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
            >
              Re-initialize
            </button>
          </div>
        )}

        {step === 'results' && stylingProfile && (
          <StylingResults profile={stylingProfile} onReset={() => setStep('upload')} />
        )}

      </div>
    </div>
  );
}
