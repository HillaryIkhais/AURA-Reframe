"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const scanLine = useRef<HTMLDivElement>(null);
  const logBox = useRef<HTMLDivElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string, delay: number) => {
    setTimeout(() => {
      setLogs((prev) => [...prev, msg]);
    }, delay);
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const triggerScanAnimation = (imageUrl: string) => {
    setIsScanning(true);
    setPreview(imageUrl);

    // 1. Initial flash and freeze
    gsap.fromTo(canvasRef.current, 
      { filter: 'brightness(2)' },
      { filter: 'brightness(1) grayscale(100%)', duration: 0.5 }
    );

    // 2. Scan line down
    gsap.to(scanLine.current, {
      top: '100%',
      duration: 3,
      ease: 'linear',
      onComplete: () => {
        gsap.to(scanLine.current, { opacity: 0, duration: 0.2 });
      }
    });

    // 3. Log Sequence
    addLog("> Running YouCam Skin Analysis...", 500);
    addLog("> Extracting coordinates of unique features...", 1200);
    addLog("> Pulling dominant color tones...", 2200);
    addLog("> Connecting to DashScope AI Stylist...", 3000);
    addLog("> Generating personalized aesthetic...", 3800);
    addLog("> Rendering Lookbook...", 4500);

    // 4. Fade out and redirect
    gsap.to(container.current, {
      opacity: 0,
      duration: 1,
      delay: 5.5,
      onComplete: () => {
        router.push('/archive');
      }
    });
  };

  const captureFrame = () => {
    if (isScanning || preview) return;
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        sessionStorage.setItem('aura_source_b64', dataUrl);
        sessionStorage.removeItem('aura_source_image');
        triggerScanAnimation(dataUrl);
      }
    }
  };

  const handleDemoMode = () => {
    if (isScanning || preview) return;
    const demoUrl = '/demo_face_final.jpg';
    sessionStorage.removeItem('aura_source_b64');
    sessionStorage.setItem('aura_source_image', demoUrl);
    triggerScanAnimation(demoUrl);
  };

  return (
    <div ref={container} className="w-full h-screen bg-[#2b2726] text-[#e8dedb] flex flex-col relative overflow-hidden font-sans">
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Back</span>
        </Link>
        <span className="text-xl font-serif tracking-widest">A U R A</span>
        <button onClick={handleDemoMode} className="text-[10px] uppercase tracking-[0.2em] font-medium hover:opacity-70">
          Bypass with Demo Model
        </button>
      </nav>

      {/* Main Scanner Area */}
      <div className="flex-1 w-full relative flex items-center justify-center cursor-pointer" onClick={captureFrame}>
        <div className="w-full max-w-2xl aspect-[3/4] md:aspect-square relative overflow-hidden bg-black/50 border border-white/10 shadow-2xl">
          
          {!preview ? (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover object-center grayscale opacity-80"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <img src={preview} alt="Scanned" className="w-full h-full object-cover object-center grayscale opacity-90 mix-blend-luminosity" />
          )}

          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-overlay hidden"
            width={1080}
            height={1080}
          />

          {isScanning && (
            <div 
              ref={scanLine}
              className="absolute left-0 w-full h-[2px] bg-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-20"
              style={{ top: 0 }}
            />
          )}

          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 mix-blend-overlay opacity-50">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/20" />
            ))}
          </div>

          {!isScanning && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-[0.5px] border-white/40 rounded-full flex items-center justify-center pointer-events-none">
              <div className="w-1 h-1 bg-white/70 rounded-full" />
            </div>
          )}
          
          {isScanning && (
            <div ref={logBox} className="absolute bottom-4 left-4 flex flex-col gap-1 text-[10px] font-mono tracking-wider text-red-400 z-50 font-bold bg-black/40 p-3 rounded-sm border border-red-500/30">
              {logs.map((log, i) => (
                <div key={i} className="animate-pulse">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row justify-between items-end z-50 pointer-events-none">
        <div className="max-w-md mix-blend-difference text-white">
          <h2 className="font-serif text-3xl mb-2">REFRAME</h2>
          {!isScanning && (
            <p className="text-[9px] uppercase tracking-[0.3em] font-medium opacity-60">
              Tap anywhere to capture. We celebrate your <br/>
              unique features instead of hiding them.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
