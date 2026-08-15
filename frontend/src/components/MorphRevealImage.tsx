"use client";

import React, { useEffect, useRef } from 'react';

interface MorphRevealImageProps {
  frontImage: string;
  revealImage: string;
  alt?: string;
  className?: string;
}

const TRAIL_MAX_POINTS = 60;
const TRAIL_HEAD_R = 140;
const TRAIL_NOISE_AMP = 44;
const TRAIL_BLOB_PTS = 24;
const TRAIL_FADE_SPEED = 0.92;
const TRAIL_SAMPLE_DIST = 8;

export default function MorphRevealImage({ frontImage, revealImage, alt = '', className = '' }: MorphRevealImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerTopRef = useRef<HTMLDivElement>(null);
  const layerBgRef = useRef<HTMLDivElement>(null);
  
  const animState = useRef({
    trail: [] as { x: number, y: number, r: number, alpha: number, seed: number }[],
    isHovering: false,
    headRadius: 0,
    time: 0,
    mouseX: -999,
    mouseY: -999,
    reqId: 0
  });

  useEffect(() => {
    const canvasBg = document.createElement('canvas');
    const canvasTop = document.createElement('canvas');
    const ctxBg = canvasBg.getContext('2d', { willReadFrequently: true });
    const ctxTop = canvasTop.getContext('2d', { willReadFrequently: true });

    if (!ctxBg || !ctxTop || !containerRef.current || !layerTopRef.current || !layerBgRef.current) return;

    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      canvasBg.width = rect.width;
      canvasBg.height = rect.height;
      canvasTop.width = rect.width;
      canvasTop.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawMorphBlob = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number) => {
      if (r < 2) return;
      ctx.beginPath();
      const points = [];
      for(let i=0; i<TRAIL_BLOB_PTS; i++) {
        const angle = (i / TRAIL_BLOB_PTS) * Math.PI * 2;
        const n1 = Math.sin(angle*3 + t*1.4 + seed) * 0.45;
        const n2 = Math.sin(angle*5 - t*0.9 + seed*2.3) * 0.3;
        const n3 = Math.cos(angle*2 + t*1.8 + seed*0.7) * 0.25;
        const noise = (n1+n2+n3) * TRAIL_NOISE_AMP * (r/140);
        const rad = r + noise;
        points.push({
          x: cx + Math.cos(angle) * rad,
          y: cy + Math.sin(angle) * rad
        });
      }
      
      ctx.moveTo((points[0].x + points[TRAIL_BLOB_PTS-1].x)/2, (points[0].y + points[TRAIL_BLOB_PTS-1].y)/2);
      for(let i=0; i<TRAIL_BLOB_PTS; i++) {
        const next = (i+1)%TRAIL_BLOB_PTS;
        const xc = (points[i].x + points[next].x)/2;
        const yc = (points[i].y + points[next].y)/2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.fill();
    };

    const dist = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2-x1, y2-y1);

    const loop = () => {
      const state = animState.current;
      state.time += 0.016;
      
      const targetR = state.isHovering ? TRAIL_HEAD_R : 0;
      state.headRadius += (targetR - state.headRadius) * (state.isHovering ? 0.14 : 0.04);

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const fx = state.mouseX - rect.left;
      const fy = state.mouseY - rect.top;

      if (state.isHovering && state.headRadius > 5) {
        if (state.trail.length === 0 || dist(fx, fy, state.trail[state.trail.length-1].x, state.trail[state.trail.length-1].y) > TRAIL_SAMPLE_DIST) {
          state.trail.push({ x: fx, y: fy, r: state.headRadius, alpha: 1, seed: Math.random()*100 });
          if (state.trail.length > TRAIL_MAX_POINTS) state.trail.shift();
        }
      }

      for (let i = state.trail.length - 1; i >= 0; i--) {
        state.trail[i].alpha *= TRAIL_FADE_SPEED;
        state.trail[i].r *= 0.995;
        if (state.trail[i].alpha < 0.01) {
          state.trail.splice(i, 1);
        }
      }

      ctxTop.clearRect(0, 0, canvasTop.width, canvasTop.height);
      ctxTop.fillStyle = 'rgba(255, 255, 255, 1)'; 
      for (const p of state.trail) {
        ctxTop.globalAlpha = p.alpha;
        drawMorphBlob(ctxTop, p.x, p.y, p.r, state.time, p.seed);
      }
      ctxTop.globalAlpha = 1;

      ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
      ctxBg.fillStyle = '#fff';
      ctxBg.fillRect(0, 0, canvasBg.width, canvasBg.height);
      ctxBg.globalCompositeOperation = 'destination-out';
      ctxBg.fillStyle = '#000';
      for (const p of state.trail) {
        ctxBg.globalAlpha = p.alpha;
        drawMorphBlob(ctxBg, p.x, p.y, p.r, state.time, p.seed);
      }
      ctxBg.globalCompositeOperation = 'source-over';
      ctxBg.globalAlpha = 1;

      if (rect.width > 0 && rect.height > 0) {
        const topData = canvasTop.toDataURL('image/png');
        if (layerTopRef.current) {
          layerTopRef.current.style.maskImage = `url(${topData})`;
          layerTopRef.current.style.webkitMaskImage = `url(${topData})`;
        }

        const bgData = canvasBg.toDataURL('image/png');
        if (layerBgRef.current) {
          layerBgRef.current.style.maskImage = `url(${bgData})`;
          layerBgRef.current.style.webkitMaskImage = `url(${bgData})`;
        }
      }

      state.reqId = requestAnimationFrame(loop);
    };

    animState.current.reqId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animState.current.reqId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    animState.current.mouseX = e.clientX;
    animState.current.mouseY = e.clientY;
    animState.current.isHovering = true;
  };

  const handleMouseEnter = () => {
    animState.current.isHovering = true;
  };

  const handleMouseLeave = () => {
    animState.current.isHovering = false;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={layerBgRef} 
        className="absolute inset-0 transition-transform duration-1000 scale-105 group-hover:scale-100"
        style={{ maskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat' }}
      >
        {/* Grayscale on load, full color on hover for the base garment */}
        <img src={frontImage} alt={alt} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-1000" crossOrigin="anonymous" />
      </div>
      
      <div 
        ref={layerTopRef} 
        className="absolute inset-0 transition-transform duration-1000 scale-105 group-hover:scale-100"
        style={{ 
          maskImage: 'linear-gradient(#0000, #0000)', WebkitMaskImage: 'linear-gradient(#0000, #0000)',
          maskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskSize: '100% 100%', WebkitMaskRepeat: 'no-repeat'
        }}
      >
        {/* High contrast, inverted structural map aesthetic for the reveal layer */}
        <img src={revealImage} alt="" className="w-full h-full object-cover filter invert hue-rotate-180 contrast-200 saturate-200 mix-blend-screen opacity-80" crossOrigin="anonymous" />
      </div>
    </div>
  );
}
