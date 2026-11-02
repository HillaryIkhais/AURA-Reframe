"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const STYLE_DIRECTIONS = [
  { id: "bold", label: "Bold", keyphrase: "Make a statement" },
  { id: "understated", label: "Understated", keyphrase: "Subtle elegance" },
  { id: "warm", label: "Warm", keyphrase: "Earth and warmth" },
  { id: "cool", label: "Cool", keyphrase: "Crisp and clear" },
  { id: "formal", label: "Formal", keyphrase: "Polished occasion" },
  { id: "everyday", label: "Everyday", keyphrase: "Wearable daily" },
];

export default function StyleDirectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (directionId: string) => {
    setSelected(directionId);
  };

  const proceed = () => {
    if (selected) {
      sessionStorage.setItem('aura_selected_direction', selected);
      router.push('/catalogue');
    }
  };

  // If already selected from scan session, proceed directly
  useEffect(() => {
    const saved = sessionStorage.getItem('aura_selected_direction');
    if (saved && !selected) {
      proceed();
    }
  }, [selected]);

  return (
    <div className="w-full min-h-screen bg-[#2b2726] text-[#e8dedb] flex flex-col items-center justify-center font-sans">
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Back</span>
        </Link>
        <span className="text-xl font-serif tracking-widest">A U R A</span>
      </nav>

      <main className="w-full max-w-2xl px-6 text-center">
        <h1 className="font-serif text-5xl mb-12 tracking-tight">Choose Your Direction</h1>

        <p className="text-[11px] uppercase tracking-[0.3em] text-[#e8dedb]/60 mb-12">
          How do you want to explore fashion today?
        </p>

        <div className="space-y-4">
          {STYLE_DIRECTIONS.map((dir) => (
            <button
              key={dir.id}
              onClick={() => handleSelect(dir.id)}
              className="
                w-full py-4 px-6 text-left font-medium tracking-[0.2em] uppercase 
                border border-[#e8dedb]/30 rounded-md hover:border-[#e8dedb] transition-colors 
                bg-transparent text-[#e8dedb] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50
              "
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" 
                      style={{ background: dir.colour || '#e8dedb', color: '#2b2726' }}>
                  {dir.id === "bold" ? "☀" : dir.id === "understated" ? "⚪" : dir.id === "warm" ? "🟡" : dir.id === "cool" ? "🔵" : dir.id === "formal" ? "🤍" : "🌿"}
                </span>
                <div className="flex-1">
                  <p className="font-serif text-lg">{dir.label}</p>
                  <p className="text-[9px] opacity-60">{dir.keyphrase}</p>
                </div>
                <svg className="w-4 h-4 ml-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-12 pt-12 border-t border-[#e8dedb]/20 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#e8dedb]/60 mb-4">You selected</p>
            <p className="font-serif text-3xl mb-2">{selected === "bold" && "Bold"} 
               {selected === "understated" && "Understated"} 
               {selected === "warm" && "Warm"} 
               {selected === "cool" && "Cool"} 
               {selected === "formal" && "Formal"} 
               {selected === "everyday" && "Everyday"}</p>
            <p className="text-[9px] opacity-60">{selected === "bold" && "Make a statement"} 
               {selected === "understated" && "Subtle elegance"} 
               {selected === "warm" && "Earth and warmth"} 
               {selected === "cool" && "Crisp and clear"} 
               {selected === "formal" && "Polished occasion"} 
               {selected === "everyday" && "Wearable daily"}</p>
            <button
              onClick={proceed}
              className="mt-6 px-8 py-3 text-[9px] font-bold tracking-[0.2em] uppercase border border-[#e8dedb] hover:bg-[#e8dedb] hover:text-[#2b2726] transition-colors rounded-full"
            >
              Continue to Catalogue
            </button>
          </div>
        )}
      </main>
    </div>
  );
}