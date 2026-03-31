interface CountdownOverlayProps {
  count: number;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200" 
      style={{ 
        background: "rgba(0,0,0,0.7)", 
        backdropFilter: "blur(8px)", 
        WebkitBackdropFilter: "blur(8px)" 
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center" 
          style={{ 
            border: "4px solid rgba(239,68,68,0.4)", 
            boxShadow: "0 0 40px rgba(239,68,68,0.3), inset 0 0 20px rgba(239,68,68,0.1)" 
          }}
        >
          <span 
            className="text-6xl font-light font-mono tabular-nums" 
            style={{ 
              color: "hsl(0 72% 65%)", 
              textShadow: "0 0 20px rgba(239,68,68,0.5)" 
            }}
          >
            {count}
          </span>
        </div>
        <span 
          className="text-xs uppercase tracking-widest" 
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Gravando em...
        </span>
      </div>
    </div>
  );
}
