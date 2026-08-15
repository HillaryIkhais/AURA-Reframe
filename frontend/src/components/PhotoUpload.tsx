import { useRef } from 'react';

export default function PhotoUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center p-8 bg-foreground text-background transition-transform duration-500 hover:-translate-y-2 group cursor-pointer border border-foreground/10 shadow-2xl" onClick={() => fileInputRef.current?.click()}>
      
      <div className="w-full aspect-[3/4] mb-8 bg-background flex flex-col items-center justify-center border border-foreground/20 overflow-hidden relative">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'0.05\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Cg/%3E%3C/svg%3E')] opacity-50"></div>
         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground mb-4 group-hover:scale-110 transition-transform duration-700"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
         <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-foreground">Initiate Scan</span>
      </div>
      
      <div className="w-full text-center">
        <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2">Notice</p>
        <p className="text-xs leading-relaxed opacity-80 font-serif italic">
          No diagnostic storage. Ephemeral processing only.
        </p>
      </div>
      
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
