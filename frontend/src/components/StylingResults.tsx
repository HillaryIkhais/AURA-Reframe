import MorphRevealImage from './MorphRevealImage';

export default function StylingResults({ profile, onReset }: { profile: any, onReset: () => void }) {
  return (
    <div className="w-full flex flex-col pt-12 pb-24 animate-fade-in relative z-20">
      
      {/* Editorial Profile Section */}
      <section className="w-full max-w-5xl mx-auto mb-32 relative">
        <h3 className="text-[8px] uppercase tracking-[0.4em] font-medium text-foreground mb-8 border-b border-foreground/20 pb-4">Profile // {new Date().getFullYear()}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          <div className="md:col-span-4">
             <div className="w-full aspect-[3/4] bg-foreground p-8 flex flex-col justify-between">
                <p className="text-background text-[10px] uppercase tracking-widest">Extracted Code</p>
                <div className="space-y-4">
                  {profile.vto_parameters.recommended_colors.map((color: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full border border-background/20" style={{ backgroundColor: color }}></div>
                      <span className="text-[10px] text-background font-mono uppercase tracking-wider">{color}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="md:col-span-8 flex flex-col justify-center">
             <h2 className="text-3xl md:text-5xl font-serif leading-tight text-foreground mb-8">
               {profile.palette_description}
             </h2>
             <p className="text-sm md:text-base leading-relaxed text-foreground/80 font-light max-w-lg mb-8">
               {profile.styling_rationale}
             </p>
             {profile.vto_parameters.fabric_notes && (
                 <p className="text-xs text-accent uppercase tracking-widest">
                   Form: {profile.vto_parameters.fabric_notes}
                 </p>
             )}
          </div>
        </div>
      </section>

      {/* Avant-Garde VTO Renders with Morph Reveal */}
      <section className="w-full max-w-6xl mx-auto relative">
        <h3 className="absolute -top-12 left-0 text-[10vw] font-serif text-accent opacity-10 pointer-events-none uppercase tracking-tighter leading-none z-0">
          Collection
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          {profile.mock_renders.map((url: string, idx: number) => (
            <div key={idx} className={`group relative ${idx === 1 ? 'md:mt-32' : ''}`}>
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-foreground">
                 
                 {/* Morph Reveal Integration - Using the same image but styled as a structural map for the reveal */}
                 <MorphRevealImage 
                   frontImage={url} 
                   revealImage={url} 
                   className="w-full h-full"
                   alt={`Styled Garment ${idx + 1}`}
                 />
                 
                 {/* Brutalist Label */}
                 <div className="absolute top-4 left-4 bg-background text-foreground px-4 py-2 text-[10px] uppercase tracking-widest font-bold pointer-events-none">
                   Look {String(idx + 1).padStart(3, '0')}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-32">
        <button 
          onClick={onReset}
          className="text-xs uppercase tracking-[0.3em] font-medium text-foreground hover:text-accent transition-colors border-b border-foreground/20 hover:border-accent pb-2 cursor-pointer"
        >
          Reset Session
        </button>
      </div>

    </div>
  );
}
