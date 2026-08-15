"use client";

import { useRouter } from 'next/navigation';
import PhotoUpload from '../../components/PhotoUpload';

export default function ScanPage() {
  const router = useRouter();

  const handleUpload = async (file: File) => {
    // Convert file to base64 for later steps
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
    
    try {
      const sourceB64 = await toBase64(file);
      // Save base64 string and raw file info into sessionStorage
      sessionStorage.setItem('aura_source_b64', sourceB64);
      
      // Route to processing state
      router.push('/processing');
    } catch (e) {
      console.error("Failed to parse image.", e);
    }
  };

  return (
    <div className="w-full min-h-screen relative animate-fade-in overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background">
      
      {/* Massive Glowing Editorial Background Typography */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0">
        <h1 className="text-[20vw] leading-[0.7] font-serif uppercase tracking-tighter text-foreground opacity-5 blur-[2px] shadow-glow-strong">
          AURA<br/>REFRAME
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-12 flex flex-col items-center justify-center min-h-[75vh]">
        <div className="text-center mb-16 text-foreground">
          <h2 className="text-3xl sm:text-5xl font-sans font-thin uppercase tracking-[0.2em] mb-4 drop-shadow-glow">
            Load Structural Map
          </h2>
          <p className="font-sans font-light max-w-lg mx-auto text-[10px] tracking-[0.3em] uppercase opacity-60 mt-8">
            Upload your source image to begin extraction.
          </p>
        </div>
        
        <PhotoUpload onUpload={handleUpload} />
      </div>
    </div>
  );
}
