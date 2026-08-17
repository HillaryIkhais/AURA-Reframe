"use client";

import { useRef, useEffect, useState } from 'react';

interface MorphRevealCanvasProps {
  src: string;
  baseImage?: string | null;
}

export default function MorphRevealCanvas({ src, baseImage }: MorphRevealCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const vtoImageRef = useRef<HTMLImageElement | null>(null);
  const structuralImageRef = useRef<HTMLImageElement | null>(null);

  const mouse = useRef({ x: -1000, y: -1000, radius: 0 });

  useEffect(() => {
    setImagesLoaded(false);
    
    const vtoImg = new Image();
    vtoImg.crossOrigin = "anonymous";
    vtoImg.src = src;
    
    // If baseImage is provided (the user's face), reveal their face structure underneath!
    // Otherwise, reveal the structure of the VTO outfit itself.
    const mapImg = new Image();
    mapImg.crossOrigin = "anonymous";
    mapImg.src = baseImage || src;

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        vtoImageRef.current = vtoImg;
        structuralImageRef.current = mapImg;
        setImagesLoaded(true);
      }
    };
    
    const onError = (e: any) => {
      console.error("Error loading image for canvas", e);
      // Fallback
      loadedCount++;
      if (loadedCount === 2) setImagesLoaded(true);
    }

    vtoImg.onload = onLoad;
    vtoImg.onerror = onError;
    mapImg.onload = onLoad;
    mapImg.onerror = onError;
  }, [src, baseImage]);

  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const vtoImg = vtoImageRef.current;
      const mapImg = structuralImageRef.current;
      if (!vtoImg || !mapImg || !vtoImg.width || !mapImg.width) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const imgRatio = vtoImg.width / vtoImg.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawW, drawH, drawX, drawY;
      
      if (canvasRatio > imgRatio) {
        drawH = canvas.height;
        drawW = drawH * imgRatio;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvas.width;
        drawH = drawW / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      }

      // 1. Draw the Structural Map (Bottom Layer) using object-fit: cover semantics to avoid warping the face!
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'grayscale(100%) contrast(110%) opacity(80%)'; 
      
      const mapRatio = mapImg.width / mapImg.height;
      let mapDrawW, mapDrawH, mapDrawX, mapDrawY;
      
      if (canvasRatio > mapRatio) {
        mapDrawW = canvas.width;
        mapDrawH = mapDrawW / mapRatio;
        mapDrawX = 0;
        mapDrawY = (canvas.height - mapDrawH) / 2;
      } else {
        mapDrawH = canvas.height;
        mapDrawW = mapDrawH * mapRatio;
        mapDrawX = (canvas.width - mapDrawW) / 2;
        mapDrawY = 0;
      }
      
      ctx.drawImage(mapImg, mapDrawX, mapDrawY, mapDrawW, mapDrawH);
      
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for(let i=0; i<canvas.height; i+=4) {
        ctx.fillRect(0, i, canvas.width, 1);
      }

      // 2. Draw the reveal mask
      ctx.globalCompositeOperation = 'destination-in';
      
      const targetRadius = (mouse.current.x > -500) ? 180 : 0;
      mouse.current.radius += (targetRadius - mouse.current.radius) * 0.1;

      if (mouse.current.radius > 1) {
        const gradient = ctx.createRadialGradient(
          mouse.current.x, mouse.current.y, 0,
          mouse.current.x, mouse.current.y, mouse.current.radius
        );
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Draw the VTO image (Top Layer)
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(vtoImg, drawX, drawY, drawW, drawH);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
        style={{ opacity: imagesLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
      />
    </div>
  );
}
