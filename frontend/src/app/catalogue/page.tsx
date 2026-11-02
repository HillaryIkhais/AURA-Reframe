"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ALL_GARMENTS = [
  { id: "01", name: "Cotton White Top", colour: "#F8F8F8", category: "top", directions: ["understated", "everyday"] },
  { id: "02", name: "Deep Teal Blouse", colour: "#2D5A87", category: "top", directions: ["bold", "experimental"] },
  { id: "03", name: "Warm Camel Dress", colour: "#C49A6C", category: "dress", directions: ["warm", "everyday", "formal"] },
  { id: "04", name: "Sage Green Jacket", colour: "#6B8E65", category: "jacket", directions: ["soft", "everyday"] },
  { id: "05", name: "Royal Purple Top", colour: "#6A0DAD", category: "top", directions: ["bold", "experimental"] },
  { id: "06", name: "Blush Pink Dress", colour: "#E8B4BC", category: "dress", directions: ["soft", "everyday"] },
  { id: "07", name: "Nero Jacket", colour: "#252526", category: "jacket", directions: ["bold", "formal"] },
  { id: "08", name: "Ochre Top", colour: "#C58640", category: "top", directions: ["warm", "experimental"] },
  { id: "09", name: "Ivory Dress", colour: "#FFFFF0", category: "dress", directions: ["understated", "everyday"] },
  { id: "10", name: "Forest Green Jacket", colour: "#228B22", category: "jacket", directions: ["soft", "everyday", "warm"] },
  { id: "11", name: "Coral Top", colour: "#FF7F50", category: "top", directions: ["bold", "experimental"] },
  { id: "12", name: "Sky Blue Dress", colour: "#87CEEB", category: "dress", directions: ["cool", "everyday"] },
  { id: "13", name: "Metallic Silver Jacket", colour: "#C0C0C0", category: "jacket", directions: ["bold", "experimental"] },
  { id: "14", name: "Lavender Dress", colour: "#E6E6FA", category: "dress", directions: ["soft", "everyday", "cool"] },
  { id: "15", name: "Charcoal Top", colour: "#36454F", category: "top", directions: ["formal", "understated"] },
  { id: "16", name: "Gold Accessory", colour: "#FFD700", category: "accessory", directions: ["bold", "experimental"] },
];

const CATEGORY_LABELS = {
  top: "Tops",
  dress: "Dresses",
  jacket: "Jackets",
  accessory: "Accessories"
};

export default function CataloguePage() {
  const router = useRouter();
  const [garments, setGarments] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<string | null>(null);
  const [savedLooks, setSavedLooks] = useState<any[]>(() => {
    const stored = localStorage.getItem('aura_saved_looks');
    return stored ? JSON.parse(stored) : [];
  });
  const routerRef = useRouter();

  // Initialize from server session
  useEffect(() => {
    const savedDir = sessionStorage.getItem('aura_selected_direction');
    if (savedDir) setSelectedDirection(savedDir);
  }, []);

  // Filter garments by selected direction
  useEffect(() => {
    if (selectedDirection) {
      const dirs = [selectedDirection];
      const result = ALL_GARMENTS.filter(g => g.directions.some((d: string) => d === selectedDirection));
      setGarments(result);
      setFiltered(result);
    } else {
      setGarments(ALL_GARMENTS);
      setFiltered(ALL_GARMENTS);
    }
  }, [selectedDirection]);

  const toggleSave = (garmentId: string) => {
    const exists = savedLooks.some((look: any) => look.garmentId === garmentId);
    if (exists) {
      // Remove
      const newLooks = savedLooks.filter((look: any) => look.garmentId !== garmentId);
      setSavedLooks(newLooks);
      localStorage.setItem('aura_saved_looks', JSON.stringify(newLooks));
    } else {
      // Add - store with direction and palette reference
      const newLook = {
        garmentId,
        direction: selectedDirection,
        timestamp: new Date().toISOString()
      };
      setSavedLooks([...savedLooks, newLook]);
      localStorage.setItem('aura_saved_looks', JSON.stringify([...savedLooks, newLook]));
    }
  };

  const proceedToTryOn = () => {
    if (selectedGarment) {
      sessionStorage.setItem('aura_selected_garment_id', selectedGarment);
      routerRef.push('/try-on');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#EBE5DF] text-[#1A1A1A] font-sans">
      <nav className="w-full px-6 py-4 border-b border-[#1A1A1A]/20 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-[0.1em]">
          ← Back to Direction
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] opacity-60">Catalogue</span>
        <button
          onClick={() => {
            sessionStorage.removeItem('aura_selected_garment_id');
            sessionStorage.removeItem('aura_styling_profile');
            routerRef.push('/scan');
          }}
          className="text-xs uppercase hover:opacity-70 transition-opacity"
        >
          Start Over
        </button>
      </nav>

      <div className="p-6 pb-12">
        {/* Direction filter */}
        {selectedDirection && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/60 mb-2">
              Showing items for {selectedDirection}
            </p>
            <button
              onClick={() => {
                setSelectedDirection(null);
                setFiltered(ALL_GARMENTS);
                setGarments(ALL_GARMENTS);
              }}
              className="text-[9px] uppercase hover:underline hover:text-[#1A1A1A]"
            >
              Show all
            </button>
          </div>
        )}

        {/* Saved looks preview */}
        {savedLooks.length > 0 && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/60 mb-2">Saved Looks</p>
            <div className="flex gap-3 flex-wrap">
              {savedLooks.map((look: any, idx: number) => {
                const g = ALL_GARMENTS.find((ag: any) => ag.id === look.garmentId);
                return (
                  <div
                    key={idx}
                    className="
                      px-4 py-2 border border-[#1A1A1A]/30 rounded-full text-xs hover:border-[#1A1A1A]
                      transition-colors bg-[#1A1A1A]/20
                    "
                  >
                    {g ? g.name : "Garment"} 
                    {look.direction && ` · ${look.direction}`}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalogue grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="
                border border-transparent rounded-lg hover:border-[#1A1A1A]/50 
                transition-colors group cursor-pointer
                group-hover:border-[#1A1A1A]
              "
              onClick={() => {
                setSelectedGarment(g.id);
              }}
            >
              <div className="aspect-[4/5] rounded-t-lg bg-[#1A1A1A]/50 overflow-hidden">
                {/* Placeholder garment images - in production these would be real VTO-ready images */}
                <div
                  className="h-full w-full bg-gradient-to-b from-colour to-white bg-opacity-30 flex items-center justify-center text-[9px] opacity-40"
                  style={{ backgroundColor: g.colour }}
                >
                  {g.name.split(' ')[0][0]}
                </div>
              </div>
              <div className="p-3">
                <p className="font-serif text-xs line-clamp-1">{g.name}</p>
                <p className="text-[9px] uppercase mt-1">{g.colour}</p>
                <p className="text-[8px] opacity-60 text-xs mt-0.5">
                  {g.directions.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected garment preview */}
        {selectedGarment && (
          <div className="mt-12 p-8 bg-[#1A1A1A]/50 rounded-xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#1A1A1A]/60 mb-4">Selected</p>
            <p className="font-serif text-2xl mb-2">{selectedGarment}</p>
            <p className="text-[9px] opacity-60 mb-4">
              {selectedGarment === "01" && "Cotton White Top"} 
              {selectedGarment === "02" && "Deep Teal Blouse"} 
              {selectedGarment === "03" && "Warm Camel Dress"} 
              {selectedGarment === "04" && "Sage Green Jacket"} 
              {selectedGarment === "05" && "Royal Purple Top"} 
              {selectedGarment === "06" && "Blush Pink Dress"} 
              {selectedGarment === "07" && "Nero Jacket"} 
              {selectedGarment === "08" && "Ochre Top"} 
              {selectedGarment === "09" && "Ivory Dress"} 
              {selectedGarment === "10" && "Forest Green Jacket"} 
              {selectedGarment === "11" && "Coral Top"} 
              {selectedGarment === "12" && "Sky Blue Dress"} 
              {selectedGarment === "13" && "Metallic Silver Jacket"} 
              {selectedGarment === "14" && "Lavender Dress"} 
              {selectedGarment === "15" && "Charcoal Top"} 
              {selectedGarment === "16" && "Gold Accessory"}
            </p>
            <button
              onClick={proceedToTryOn}
              className="px-6 py-3 text-[9px] font-bold tracking-[0.2em] uppercase border border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors rounded-full mt-4"
            >
              Try This On
            </button>
            {savedLooks.some((look: any) => look.garmentId === selectedGarment) && (
              <span className="ml-4 text-[9px] opacity-50">✓ Saved</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}