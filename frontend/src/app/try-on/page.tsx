"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TryOnPage() {
  const router = useRouter();
  const [renderUrls, setRenderUrls] = useState<string[]>([]);
  const [garmentId, setGarmentId] = useState<string | null>(null);
  const [prototype, setPrototype] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReframeSwitch, setShowReframeSwitch] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const routerRef = useRouter();

  // Fetch styling profile if not already available
  const loadStylingProfile = async () => {
    const profileStr = sessionStorage.getItem('aura_styling_profile');
    if (profileStr) {
      setProfile(JSON.parse(profileStr));
      return;
    }
    
    // Generate profile via backend style endpoint
    try {
      const API_URL = "http://localhost:8085";
      const sourceB64 = sessionStorage.getItem('aura_source_b64');
      const direction = sessionStorage.getItem('aura_selected_direction') || "bold";
      
      if (!sourceB64) {
        setProfile(null);
        return;
      }
      
      // Convert base64 to blob to send as multipart form-data
      const res = await fetch(sourceB64);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "source.jpg");
      
      const styleResp = await fetch(`${API_URL}/style`, {
        method: 'POST',
        body: formData
      });
      
      if (!styleResp.ok) throw new Error("Backend Style failed");
      const styleData = await styleResp.json();
      
      setProfile(styleData);
      sessionStorage.setItem('aura_styling_profile', JSON.stringify(styleData));
    } catch (err: any) {
      console.error("Failed to load styling profile:", err);
      setProfile(null);
    }
  };

  // Fetch try-on from backend
  useEffect(() => {
    const loadTryOn = async () => {
      // First ensure profile is loaded
      await loadStylingProfile();
      
      if (!garmentId) {
        setError("No garment selected. Please go back and select a garment.");
        return;
      }

      try {
        const API_URL = "http://localhost:8085";
        const vtoParams = profile?.vto_parameters || {
          color_direction: "complementary",
          recommended_colors: ["#FFD700", "#87CEEB", "#E6E6FA"],
          fabric_notes: "soft cottons"
        };
        
        const res = await fetch(`${API_URL}/tryon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vto_parameters: vtoParams,
            source_image_b64: sessionStorage.getItem('aura_source_b64') || "",
            selected_style: sessionStorage.getItem('aura_selected_direction') || "bold",
            selected_garment_id: garmentId
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Try-on failed");
        }

        const data = await res.json();
        setRenderUrls(data.render_urls);
        setGarmentId(data.garment_id || garmentId);
        setPrototype(data.prototype !== false); // If prototype=false, it's a real garment try-on
        
        // Store the profile for saved looks (update with VTO results)
        if (profile) {
          const updatedProfile = {
            ...profile,
            render_urls: data.render_urls,
            garment_id: data.garment_id
          };
          sessionStorage.setItem('aura_styling_profile', JSON.stringify(updatedProfile));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred.");
      }
    };

    loadTryOn();
  }, [garmentId]);

  const handleSaveLook = () => {
    const looks = JSON.parse(localStorage.getItem('aura_saved_looks') || '[]');
    const newLook = {
      garmentId: garmentId,
      direction: sessionStorage.getItem('aura_selected_direction'),
      palette: sessionStorage.getItem('aura_source_image') ? "generated" : "unknown",
      timestamp: new Date().toISOString()
    };
    looks.push(newLook);
    localStorage.setItem('aura_saved_looks', JSON.stringify(looks));
    setShowReframeSwitch(true);
  };

  const clearError = () => setError(null);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={clearError} className="border px-4 py-2">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-[#EBE5DF] text-[#1A1A1A] font-sans">
      <nav className="w-full px-6 py-4 border-b border-[#1A1A1A]/20 flex items-center justify-between">
        <Link href="/catalogue" className="font-serif text-lg tracking-[0.1em]">
          ← Browse Catalogue
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] opacity-60">Virtual Try-On</span>
      </nav>

      <main className="p-6 pb-12">
        {!renderUrls && !error ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <p className="text-[11px] opacity-60">Select a garment from the catalogue to try on.</p>
          </div>
        ) : error ? (
          <div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={clearError} className="border px-4 py-2">Try Again</button>
          </div>
        ) : (
          <>
            {/* Reframe Switch toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowReframeSwitch(!showReframeSwitch)}
                className="w-full py-3 text-[9px] font-bold tracking-[0.2em] uppercase 
                          border border-[#1A1A1A]/30 rounded-md hover:border-[#1A1A1A]
                          transition-colors bg-transparent text-[#1A1A1A]"
              >
                {showReframeSwitch 
                  ? "Reframe Switch: ON — Colour not a defect" 
                  : "Reframe Switch: OFF"
                }
              </button>
            </div>

            {/* VTO Result */}
            <div className="prose max-w-2xl mx-auto">
              <h2 className="text-2xl font-serif mb-6">Your look</h2>
              
              {prototype && !renderUrls.some((u: string) => u.includes('vto_') === false) ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A]/60 mb-4">Prototype Preview</p>
                  <p className="text-[10px] opacity-70">
                    This is a prototype preview demonstrating the garment selection flow.
                    <br/>
                    Connect live YouCam VTO for production use.
                  </p>
                  <img 
                    src={renderUrls[0]} 
                    alt="Try-on result" 
                    className="w-full rounded-lg mb-6"
                  />
                  <p className="text-[9px] opacity-60">
                    Prototype: {renderUrls[0]}
                  </p>
                </div>
              ) : (
                <>
                  {renderUrls.map((url, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-8 mb-6">
                      <img 
                        src={url} 
                        alt="Try-on result" 
                        className="w-full rounded-lg mb-6"
                      />
                      <p className="text-[9px] opacity-60">
                        Try-on result {idx + 1} of {renderUrls.length}
                      </p>
                    </div>
                  ))}
                  
                  {/* Garment info */}
                  {garmentId && (
                    <div className="mt-6 p-4 bg-[#1A1A1A]/20 rounded-lg">
                      <p className="text-xs uppercase tracking-[0.2em] mb-2">Garment tried</p>
                      {garmentId === "01" && <p>Cotton White Top (#F8F8F8)</p>}
                      {garmentId === "02" && <p>Deep Teal Blouse (#2D5A87)</p>}
                      {garmentId === "03" && <p>Warm Camel Dress (#C49A6C)</p>}
                      {garmentId === "04" && <p>Sage Green Jacket (#6B8E65)</p>}
                      {garmentId === "05" && <p>Royal Purple Top (#6A0DAD)</p>}
                      {garmentId === "06" && <p>Blush Pink Dress (#E8B4BC)</p>}
                      {garmentId === "07" && <p>Nero Jacket (#252526)</p>}
                      {garmentId === "08" && <p>Ochre Top (#C58640)</p>}
                      {garmentId === "09" && <p>Ivory Dress (#FFFFF0)</p>}
                      {garmentId === "10" && <p>Forest Green Jacket (#228B22)</p>}
                      {garmentId === "11" && <p>Coral Top (#FF7F50)</p>}
                      {garmentId === "12" && <p>Sky Blue Dress (#87CEEB)</p>}
                      {garmentId === "13" && <p>Metallic Silver Jacket (#C0C0C0)</p>}
                      {garmentId === "14" && <p>Lavender Dress (#E6E6FA)</p>}
                      {garmentId === "15" && <p>Charcoal Top (#36454F)</p>}
                      {garmentId === "16" && <p>Gold Accessory (#FFD700)</p>}
                      <div className="mt-3 text-[9px] opacity-60">
                        Direction: {sessionStorage.getItem('aura_selected_direction') || '—'}
                      </div>
                    </div>
                  )}
                  
                  {/* Save look button */}
                  <button
                    onClick={handleSaveLook}
                    className="mt-6 w-full py-3 text-[9px] font-bold tracking-[0.2em] uppercase 
                              border border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors rounded-full">
                    Save This Look
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}