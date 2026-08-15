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
    <div className="w-full min-h-screen relative animate-fade-in">
      
      {/* Massive Editorial Background Typography */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0">
        <h1 className="text-[15vw] leading-[0.8] font-serif uppercase tracking-tighter text-accent opacity-20">
          STYLE<br/><span className="editorial-outline-text text-foreground opacity-30">NOT</span><br/>FLAW
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-12 flex flex-col items-center justify-center min-h-[70vh]">
        
        {step === 'upload' && (
          <>
            <div className="text-center mb-16 text-foreground">
              <h2 className="text-3xl sm:text-5xl font-serif uppercase tracking-widest mb-6">
                Reframe Identity
              </h2>
              <p className="font-sans font-light max-w-md mx-auto text-sm tracking-wide uppercase opacity-70">
                Upload a photo. We analyze your structural tones, not your flaws. A unique palette generated from your raw visual code.
              </p>
            </div>
            <PhotoUpload onUpload={handleUpload} />
          </>
        )}

        {(step === 'analyzing' || step === 'styling' || step === 'tryon') && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-foreground">
            <div className="text-6xl font-serif animate-pulse">...</div>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] opacity-70">
              {step === 'analyzing' && "Extracting raw visual code via YouCam..."}
              {step === 'styling' && "Reframing palette structure via Gemini..."}
              {step === 'tryon' && "Generating editorial VTO renders..."}
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-red-600">
            <div className="text-6xl font-serif">!</div>
            <p className="font-sans text-xs uppercase tracking-widest text-center max-w-md">
              Integration Error
            </p>
            <p className="text-sm font-mono opacity-80 max-w-lg text-center break-words">
              {errorMessage}
            </p>
            <button 
              onClick={() => setStep('upload')}
              className="text-[10px] uppercase tracking-[0.2em] mt-8 border-b border-red-500/50 pb-1"
            >
              Try Again
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
