import { useState } from 'react';
import MorphRevealImage from './MorphRevealImage';

export default function StylingResults({ profile, onReset }: { profile: any, onReset: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 relative flex flex-col min-h-screen text-black">
      
      {/* Top Header */}
      <div className="w-full flex justify-between items-start pt-4 mb-8">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
          <span className="text-[10px] uppercase tracking-widest font-bold">Create an Outfit</span>
        </div>
        <div className="flex-1 flex justify-end">
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-md uppercase">AURA</h1>
        </div>
      </div>

      {/* Sub Header & Search */}
      <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h2 className="text-xl md:text-2xl font-mono uppercase tracking-tight flex items-center gap-3">
            <span>DROP</span>
            <span className="font-bold">001</span>
            <span className="text-[10px] font-sans tracking-[0.2em] ml-2 opacity-60">STRUCTURAL PALETTE + BASE LAYERS</span>
          </h2>
        </div>
      </div>

      <div className="flex w-full mb-8">
        {/* Search Bar matching the heavy borders */}
        <div className="flex border-[3px] border-black bg-transparent w-full max-w-sm items-center shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] bg-white/50">
          <div className="p-2 border-r-[3px] border-black flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            type="text" 
            placeholder="SEARCH ITEMS..." 
            className="w-full p-2 bg-transparent text-xs font-bold uppercase tracking-widest outline-none placeholder:text-black/50" 
            readOnly
          />
        </div>
      </div>

      {/* Main Layout: Grid on left, Model on right */}
      <div className="flex flex-col lg:flex-row w-full gap-12 lg:gap-24 flex-1 pb-32 relative">
        
        {/* Left Side: Scrollable Grid */}
        <div className="w-full lg:w-1/3 flex border-l-[4px] border-black/20 pl-4 h-[60vh] overflow-y-auto overflow-x-hidden pb-12 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4 w-full h-max">
            {profile.mock_renders.map((url: string, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex flex-col bg-[#e8e9eb] p-2 cursor-pointer transition-all ${selectedIndex === idx ? 'ring-2 ring-black bg-white shadow-lg' : 'hover:bg-white/50'}`}
              >
                <div className="w-full aspect-square bg-white border border-black/5 flex items-center justify-center overflow-hidden relative">
                  {/* For thumbnails, crop to the top half of the render */}
                  <img src={url} alt={`Look ${idx + 1}`} className="object-cover object-top w-full h-[150%]" />
                  {selectedIndex === idx && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <div className="w-full mt-2">
                  <p className="text-[9px] font-medium opacity-70 tracking-widest uppercase">
                    Aura Look {idx + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Main Model Render */}
        <div className="w-full lg:w-2/3 flex flex-col items-center justify-end relative h-[70vh] lg:h-[80vh]">
           <div className="relative z-10 h-full w-full max-w-md flex flex-col items-center justify-end">
             {profile.mock_renders[selectedIndex] ? (
               <img 
                 src={profile.mock_renders[selectedIndex]} 
                 alt="Selected Outfit Render" 
                 className="h-[90%] w-auto object-contain drop-shadow-2xl animate-fade-in"
               />
             ) : (
               <div className="w-full h-full bg-black/5 flex items-center justify-center">Loading Render...</div>
             )}
             
             {/* 3D Pedestal */}
             <div className="absolute -bottom-6 w-[120%] h-24 bg-gradient-to-b from-white to-[#c0c2c4] rounded-[100%] border-t-2 border-white/50 shadow-[-10px_20px_30px_rgba(0,0,0,0.15)] z-[-1] opacity-90"></div>
           </div>
        </div>
      </div>

      {/* Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#d0d3d5] border-t-[3px] border-black/20 py-4 px-6 md:px-12 flex justify-between items-center z-50">
        <button 
          onClick={onReset}
          className="border-[3px] border-black bg-[#e2e4e6] px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
        >
          Reset Session
        </button>

        <button className="border-[3px] border-black/10 bg-[#e2e4e6] px-6 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 opacity-50 cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          Buy Selected Items
        </button>
      </div>

    </div>
  );
}
