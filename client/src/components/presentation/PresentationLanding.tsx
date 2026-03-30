import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MeshGradient } from "@/components/landing/MeshGradient";
import { AppHeader } from "@/components/nav/AppHeader";

export default function PresentationLanding() {
  const [lang, setLang] = useState<"en" | "pt">("en");
  const phrases = useMemo(() => {
    if (lang === "pt") {
      return [
        "DUBLAGEM. DIREÇÃO. ENTREGA.",
        "GRAVE. ALINHE. ENTREGUE.",
        "ATALHOS. LOOP. PRECISÃO.",
        "MENOS CLIQUES. MAIS TAKES.",
      ];
    }
    return [
      "DUBBING. DIRECTION. DELIVERY.",
      "RECORD. ALIGN. DELIVER.",
      "SHORTCUTS. LOOP. PRECISION.",
      "LESS CLICKS. MORE TAKES.",
    ];
  }, [lang]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      <AppHeader lang={lang} setLang={setLang} />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="opacity-35 dark:opacity-100">
          <MeshGradient />
        </div>
        <div className="absolute inset-0 bg-white/60 dark:bg-black/35 backdrop-blur-[2px]" />
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-[60px]">
        <div className="w-full max-w-5xl text-center">
          <div className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05]">
            <TypeCycle
              phrases={phrases}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              display={display}
              setDisplay={setDisplay}
              isDeleting={isDeleting}
              setIsDeleting={setIsDeleting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
function TypeCycle({
  phrases,
  activeIndex,
  setActiveIndex,
  display,
  setDisplay,
  isDeleting,
  setIsDeleting,
}: {
  phrases: string[];
  activeIndex: number;
  setActiveIndex: (v: number) => void;
  display: string;
  setDisplay: (v: string) => void;
  isDeleting: boolean;
  setIsDeleting: (v: boolean) => void;
}) {
  useEffect(() => {
    const phrase = phrases[activeIndex] || "";
    const holdMs = 1200;
    const typeMs = 38;
    const deleteMs = 22;

    const timeout = window.setTimeout(() => {
      if (!isDeleting) {
        const next = phrase.slice(0, display.length + 1);
        setDisplay(next);
        if (next.length === phrase.length) {
          window.setTimeout(() => setIsDeleting(true), holdMs);
        }
        return;
      }

      const next = phrase.slice(0, Math.max(0, display.length - 1));
      setDisplay(next);
      if (next.length === 0) {
        setIsDeleting(false);
        setActiveIndex((activeIndex + 1) % phrases.length);
      }
    }, isDeleting ? deleteMs : typeMs);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, display.length, isDeleting, phrases, setActiveIndex, setDisplay, setIsDeleting]);

  return (
    <div className="inline-flex items-end justify-center gap-2">
      <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/55">
        {display}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDeleting ? "del" : "type"}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          exit={{ opacity: 0.2 }}
          transition={{ duration: 0.9, repeat: Infinity }}
          className="text-foreground/60"
          aria-hidden
        >
          |
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
