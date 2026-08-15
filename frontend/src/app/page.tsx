import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full min-h-screen relative animate-fade-in overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background">
      
      {/* Massive Glowing Editorial Background Typography */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0">
        <h1 className="text-[20vw] leading-[0.7] font-serif uppercase tracking-tighter text-foreground opacity-5 blur-[2px] shadow-glow-strong">
          AURA<br/>REFRAME
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-12 flex flex-col items-center justify-center min-h-[75vh]">
        <div className="text-center mb-16 text-foreground">
          <h2 className="text-4xl sm:text-7xl font-sans font-thin uppercase tracking-[0.2em] mb-4 drop-shadow-glow">
            Aura Reframe
          </h2>
          <p className="font-sans font-light max-w-lg mx-auto text-[10px] tracking-[0.3em] uppercase opacity-60 mt-8">
            Upload a photo. We analyze your structural tones, not your flaws. A unique palette generated from your raw visual code.
          </p>
        </div>
        
        <Link 
          href="/scan"
          className="px-12 py-4 rounded-full border border-foreground/40 bg-foreground/5 backdrop-blur-md text-foreground text-xs uppercase tracking-[0.3em] font-light hover:bg-foreground hover:text-background transition-all duration-500 shadow-glow group-hover:shadow-glow-strong"
        >
          Enter the Lab
        </Link>
      </div>
    </div>
  );
}
