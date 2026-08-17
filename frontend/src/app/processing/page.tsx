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

        // Use a dummy b64 string if the image is a local path (like our demo face)
        const activeB64 = sourceB64 || "data:image/jpeg;base64,mockbase64string";
        const API_URL = "http://localhost:8085";

        // 1. Analyze Skin (YouCam)
        setStatus("Intercepting visual code via backend...");
        
        // Convert base64 back to a blob to send as multipart form-data to /analyze
        const res = await fetch(activeB64);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("file", blob, "source.jpg");

        const analyzeResp = await fetch(`${API_URL}/analyze`, {
          method: 'POST',
          body: formData
        });
        
        if (!analyzeResp.ok) throw new Error("Backend Analyze failed");
        const analyzeData = await analyzeResp.json();
        
        // 2. LLM Style Generation (Gemini)
        setStatus(`Translating to ${selectedStyle.toUpperCase()} aesthetic...`);
        
        const styleResp = await fetch(`${API_URL}/style`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_image_b64: activeB64.split(',')[1] || activeB64,
            mask_b64s: analyzeData.mask_b64s || [],
            structural_labels: analyzeData.structural_labels || [],
            selected_style: selectedStyle
          })
        });

        if (!styleResp.ok) throw new Error("Backend Style layer failed");
        const styleData = await styleResp.json();
        
        // 3. Generative VTO
        setStatus("Generating bespoke editorial VTO...");
        
        const tryonResp = await fetch(`${API_URL}/tryon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vto_parameters: styleData.vto_parameters || {},
            source_image_b64: activeB64.split(',')[1] || activeB64,
            selected_style: selectedStyle
          })
        });

        if (!tryonResp.ok) throw new Error("Backend TryOn failed");
        const tryonData = await tryonResp.json();
        
        // Use the absolute truth from the backend
        const mockProfile = {
          palette_description: styleData.palette_description,
          styling_rationale: styleData.styling_rationale,
          structural_labels: analyzeData.structural_labels || [],
          vto_parameters: styleData.vto_parameters || {},
          render_urls: tryonData.render_urls 
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
    <div className="w-full min-h-screen relative flex items-center justify-center overflow-hidden bg-[#EBE5DF] text-[#1A1A1A]">
      <div className="relative z-10 w-full max-w-xl mx-auto px-12 flex flex-col items-center justify-center min-h-[75vh]">
        {!errorMessage ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-12">
            <div className="w-16 h-16 border-[1px] border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A]/70 text-center animate-fade-up">
              {status}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 text-center">
            <div className="text-6xl font-serif text-red-800">!</div>
            <p className="font-serif text-2xl text-[#1A1A1A]">System Error</p>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 max-w-md leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => router.push('/scan')}
              className="border border-black px-8 py-3 mt-8 text-[10px] uppercase tracking-widest hover:bg-black hover:text-[#EBE5DF] transition-colors"
            >
              Restart Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
