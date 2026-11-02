"use client";

import { useEffect, useState } from 'react';
import StylingResults from '../../components/StylingResults';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const DIRECTION_LABELS: Record<string, string> = {
  bold: "Bold",
  understated: "Understated",
  warm: "Warm",
  cool: "Cool",
  formal: "Formal",
  everyday: "Everyday",
};

export default function CollectionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [recommendedGarments, setRecommendedGarments] = useState<any[]>([]);
  const [savedLooks, setSavedLooks] = useState<AnyObject[]>(() => {
    const stored = localStorage.getItem('aura_saved_looks');
    return stored ? JSON.parse(stored) : [];
  });
  const router = useRouter();

  useEffect(() => {
    const rawData = sessionStorage.getItem('aura_styling_profile');
    if (rawData) {
      const parsed = JSON.parse(rawData);
      setProfile(parsed);
      
      // Extract recommended garment IDs from the profile
      const recIds = parsed.recommended_garment_ids || [];
      // Map IDs to garment names and details from the catalogue
      const CATALOGUE = [
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
      const mapped = recIds.map((id: string) => {
        const g = CATALOGUE.find((ag: any) => ag.id === id);
        return g ? { ...g, id } : null;
      }).filter((g: any) => g);
      setRecommendedGarments(mapped);
    }
  }, []);

  const handleReset = () => {
    sessionStorage.clear();
    localStorage.removeItem('aura_saved_looks');
    window.location.href = '/scan';
  };

  if (!profile) return null;

  const direction = profile.styling_rationale && 
    /Bold|statement|Make a/.test(profile.styling_rationale) ? "bold" :
    /soft|romantic|romantic/.test(profile.styling_rationale) ? "understated" :
    /warm|earth|gold/.test(profile.styling_rationale) ? "warm" :
    /cool|blue|crisp/.test(profile.styling_rationale) ? "cool" :
    /formal|polished|occasion/.test(profile.styling_rationale) ? "formal" : "everyday";

  return (
    <div className="w-full min-h-screen overflow-y-auto relative flex flex-col bg-background">
      <div className="border-b border-[#2b2726]/10 mb-6">
        <nav className="w-full px-6 py-4 flex items-center justify-between">
          <Link href="/catalogue" className="font-serif text-lg tracking-[0.1em] hover:opacity-70 transition-opacity">
            ← Browse Catalogue
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] opacity-60">
            {DIRECTION_LABELS[direction] || "Your Style"}
          </span>
          <button
            onClick={handleReset}
            className="text-[9px] uppercase hover:opacity-70 transition-opacity"
          >
            Start Over
          </button>
        </nav>
      </div>

      <div className="p-6 pb-12">
        <StylingResults profile={profile} onReset={handleReset} />
        
        {/* Recommended Garments Section */}
        {recommendedGarments.length > 0 && (
          <div className="mt-12 p-6 bg-[#1A1A1A]/30 rounded-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#e8dedb]/60 mb-4">Recommended for You</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedGarments.map((g) => (
                <div
                  key={g.id}
                  className="
                    border border-transparent rounded-lg hover:border-[#e8dedb]/50 
                    transition-colors cursor-pointer group-hover:border-[#e8dedb]
                  "
                  onClick={() => {
                    // Store selection and try on
                    sessionStorage.setItem('aura_selected_garment_id', g.id);
                    sessionStorage.setItem('aura_selected_direction', g.directions[0] || 'bold');
                    window.location.href = '/try-on';
                  }}
                >
                  <div className="aspect-[4/5] rounded-t-lg bg-[#1A1A1A]/50 overflow-hidden">
                    <div
                      className="h-full w-full bg-gradient-to-b from-{g.colour} to-white bg-opacity-30 flex items-center justify-center text-[9px] opacity-40"
                      style={{ backgroundColor: g.colour }}
                    >
                      {g.name.split(' ')[0][0]}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="font-serif text-xs line-clamp-1">{g.name}</p>
                    <p className="text-[8px] opacity-60">{g.colour}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}