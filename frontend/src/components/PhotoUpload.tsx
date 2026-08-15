import { useRef } from 'react';

export default function PhotoUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center group">
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="px-10 py-3 rounded-full border border-foreground/40 bg-foreground/5 backdrop-blur-md text-foreground text-xs uppercase tracking-[0.3em] font-light hover:bg-foreground hover:text-background transition-all duration-500 shadow-glow group-hover:shadow-glow-strong"
      >
        Initiate Scan
      </button>
      
      <p className="mt-6 text-[9px] uppercase tracking-[0.2em] opacity-40 font-serif italic max-w-xs text-center">
        No diagnostic storage. Ephemeral processing only.
      </p>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
    </div>
  );
}
