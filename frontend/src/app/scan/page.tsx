"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function ScanPage() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.scan-ui', {
      opacity: 0,
      y: 30,
      duration: 1.5,
      stagger: 0.1,
      ease: 'power3.out'
    });

    tl.from('.huge-bg-text', {
      opacity: 0,
      scale: 1.1,
      duration: 2.5,
      ease: 'power4.out'
    }, "-=1.5");

  }, { scope: container });

  const processCapturedImage = (dataUrl: string) => {
    setPreview(dataUrl);
    sessionStorage.removeItem('aura_source_b64');
    sessionStorage.setItem('aura_source_image', dataUrl);
    setIsScanning(true);
    
    // Flash effect before redirect
    gsap.to('.scan-flash', {
      opacity: 1,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        gsap.to(container.current, { opacity: 0, duration: 1, ease: 'power2.inOut' });
        setTimeout(() => router.push('/archive'), 1000);
      }
    });
  };

  const handleCapture = () => {
    if (isScanning || preview) return;
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        processCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => processCapturedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDemoMode = () => {
    if (isScanning || preview) return;
    const demoUrl = '/demo_face.jpg';
    setPreview(demoUrl);
    sessionStorage.removeItem('aura_source_b64');
    sessionStorage.setItem('aura_source_image', demoUrl);
    setIsScanning(true);
    
    gsap.to(container.current, { opacity: 0, duration: 1, ease: 'power2.inOut', delay: 0.5 });
    setTimeout(() => router.push('/archive'), 1500);
  };

  return (
    <div ref={container} className="w-full h-screen relative bg-background text-foreground flex flex-col font-sans overflow-hidden cursor-crosshair" onClick={handleCapture}>
      
      {/* ─── Full Screen Viewfinder (Camera/Preview) ─── */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#2b2726]">
        {!preview && cameraActive && (
          <video 
            ref={videoRef} autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
            style={{ transform: 'scaleX(-1)' }} 
          />
        )}

        {preview && (
          <div className="absolute inset-0 w-full h-full z-10">
             <img src={preview} alt="Captured" className="w-full h-full object-cover grayscale opacity-90" />
             {isScanning && <div className="absolute inset-x-0 h-[2px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-scan z-30"></div>}
          </div>
        )}

        {/* Minimalist Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white"></div>
          <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white"></div>
          <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white"></div>
          <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white"></div>
        </div>
      </div>

      <div className="scan-flash absolute inset-0 bg-white z-[100] opacity-0 pointer-events-none"></div>

      {/* ─── UI Overlay ─── */}
      <div className="relative z-20 flex flex-col h-full pointer-events-none mix-blend-difference text-[#e8dedb]">
        
        {/* Top Navigation */}
        <nav className="w-full flex items-center justify-between px-10 py-8 scan-ui pointer-events-auto">
          <div className="font-serif text-xl tracking-[0.4em] uppercase font-semibold">
            A U R A
          </div>
          <div className="flex gap-10 text-[9px] font-bold tracking-[0.3em] uppercase opacity-70">
            <span className="hover:opacity-100 cursor-pointer transition-opacity">Manifesto</span>
            <span className="hover:opacity-100 cursor-pointer transition-opacity">Contact</span>
          </div>
        </nav>

        {/* Center Target */}
        <div className="flex-1 flex flex-col items-center justify-center scan-ui">
          {!preview && !cameraActive && (
            <div className="flex flex-col items-center pointer-events-auto">
              <Upload className="w-10 h-10 mb-6 opacity-50" strokeWidth={1} />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-80">
                Initiate Upload
              </span>
            </div>
          )}
          {!preview && cameraActive && (
            <div className="w-16 h-16 border border-current rounded-full flex items-center justify-center opacity-30 animate-pulse">
              <div className="w-2 h-2 bg-current rounded-full"></div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="w-full px-10 pb-12 flex justify-between items-end scan-ui pointer-events-auto">
          <div className="max-w-sm">
            <h2 className="font-serif text-4xl opacity-90 tracking-tight mb-4">
              REFRAME
            </h2>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-60 leading-loose">
              Tap anywhere to capture. We decode structural tones, ignoring clinical flaws.
            </p>
          </div>
          
          {!preview && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleDemoMode(); }}
              className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity border-b border-current/30 hover:border-current pb-1"
            >
              Bypass with Demo Model
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
}
