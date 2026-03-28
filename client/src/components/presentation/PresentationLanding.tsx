import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Network, Cpu, GraduationCap, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";
import { en, pt } from "@/lib/i18n";
import { MeshGradient } from "@/components/landing/MeshGradient";
import { AppHeader } from "@/components/nav/AppHeader";

export default function PresentationLanding() {
  const [lang, setLang] = useState<"en" | "pt">("en");
  const t = lang === "en" ? en : pt;
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-background text-foreground font-sans overflow-x-hidden">
      <AppHeader lang={lang} setLang={setLang} />
      
      {/* Slide 1: The Omni-Portal */}
      <Slide1 t={t} />

      {/* Slide 2: HUB DUB */}
      <Slide2 t={t} />

      {/* Slide 3: HUBSCHOOL */}
      <Slide3 t={t} />

      {/* Slide 4: HUB ALIGN */}
      <Slide4 t={t} />

    </div>
  );
}

function TypewriterReimagine() {
  const [location] = useLocation();

  const enText = "The Future of Dubbing. Reimagined.";
  const ptText = "O Futuro da Dublagem. Reimaginado.";

  const isExcluded = location.includes("/login") || location.includes("/admin");
  const shouldAnimate = !isExcluded;

  const [display, setDisplay] = useState(enText);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplay(enText);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      const deleteMs = 90;
      const writeMs = 100;
      const pauseEmptyMs = 500;
      const initialDelayMs = 2000;
      const holdMs = 6000;

      const deleteAll = async (value: string) => {
        for (let i = value.length; i >= 0; i--) {
          if (cancelled) return false;
          setDisplay(value.slice(0, i));
          await wait(deleteMs);
        }
        return true;
      };

      const writeAll = async (value: string) => {
        for (let i = 0; i <= value.length; i++) {
          if (cancelled) return false;
          setDisplay(value.slice(0, i));
          await wait(writeMs);
        }
        return true;
      };

      await wait(initialDelayMs);

      let current = enText;
      setDisplay(current);

      while (!cancelled) {
        const next = current === enText ? ptText : enText;

        if (!(await deleteAll(current))) return;
        await wait(pauseEmptyMs);
        if (!(await writeAll(next))) return;
        current = next;

        await wait(holdMs);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enText, ptText, shouldAnimate]);

  return (
    <>
      <span className="whitespace-pre-wrap">
        {display}
        <span className="vhub-cursor-blink" aria-hidden>
          |
        </span>
      </span>
    </>
  );
}

function Slide1({ t }: { t: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Shrink & Cover Animation
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(15px)"]);

  const springScale = useSpring(scale, { stiffness: 80, damping: 25 });
  const springOpacity = useSpring(opacity, { stiffness: 80, damping: 25 });

  return (
    <motion.section 
      ref={ref}
      style={{ scale: springScale, opacity: springOpacity, filter: blur }}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden sticky top-0 z-10 bg-background will-change-transform origin-center"
    >
       {/* Background */}
       <div className="absolute inset-0 z-0">
          <div className="opacity-35 dark:opacity-100">
            <MeshGradient />
          </div>
          <div className="absolute inset-0 bg-white/55 dark:bg-black/30 backdrop-blur-[2px]" />
       </div>
       
       <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
             <h1 className="text-6xl md:text-9xl font-semibold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/55 leading-[1.2] pb-[0.15em] overflow-visible">
               <TypewriterReimagine />
             </h1>
             <p className="text-lg md:text-3xl text-muted-foreground font-medium max-w-3xl mx-auto mb-12 leading-relaxed tracking-tight">
               {t.landing.hero.subtitle}
             </p>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5, duration: 0.8 }}
             >
                <Button 
                  onClick={() => document.getElementById("hub-dub")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 h-14 text-[17px] font-medium transition-all hover:-translate-y-[1px] shadow-sm hover:shadow-md vhub-shine"
                >
                  {t.landing.hero.cta}
                </Button>
             </motion.div>
          </motion.div>
       </div>
    </motion.section>
  );
}

function Slide2({ t }: { t: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(15px)"]);

  const springScale = useSpring(scale, { stiffness: 80, damping: 25 });
  const springOpacity = useSpring(opacity, { stiffness: 80, damping: 25 });

  return (
    <motion.section 
      id="hub-dub"
      ref={ref}
      style={{ scale: springScale, opacity: springOpacity, filter: blur }}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden sticky top-0 z-20 bg-background will-change-transform origin-center border-t border-border/10"
    >
       <div className="max-w-[1400px] mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
             initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
             whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
             transition={{ duration: 0.8, delay: 0.2 }}
          >
             <div className="w-20 h-20 bg-white/60 dark:bg-white/10 border border-black/10 dark:border-white/15 rounded-2xl flex items-center justify-center mb-8 shadow-sm backdrop-blur-xl">
                <Network className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">HUB DUB</h2>
             <p className="text-lg md:text-2xl text-muted-foreground font-medium mb-8 max-w-lg leading-relaxed tracking-tight">
               {t.landing.trinity.builder.desc}
             </p>
             <Link href="/hub-dub">
               <Button variant="outline" className="rounded-full px-8 h-12 bg-white/60 dark:bg-white/10 border-black/10 dark:border-white/15 hover:bg-white/70 dark:hover:bg-white/15 vhub-hover-lift">
                 Acessar Studio
               </Button>
             </Link>
          </motion.div>

          <motion.div
             layoutId="hub-dub-dashboard"
             initial={{ opacity: 0, rotateX: 20, scale: 0.8, filter: "blur(10px)" }}
             whileInView={{ opacity: 1, rotateX: 0, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
             className="relative"
          >
             {/* 3D Dashboard Mockup */}
             <div className="relative aspect-[16/10] bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden transform perspective-1000 rotate-y-[-10deg]">
                <img src="/landing/hubdub-mic.svg" alt="HubDub Studio" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay" />
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10" />
             </div>
          </motion.div>
       </div>
    </motion.section>
  );
}

function Slide3({ t }: { t: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(15px)"]);

  const springScale = useSpring(scale, { stiffness: 80, damping: 25 });
  const springOpacity = useSpring(opacity, { stiffness: 80, damping: 25 });

  return (
    <motion.section 
      id="hubschool" 
      ref={ref}
      style={{ scale: springScale, opacity: springOpacity, filter: blur }}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden sticky top-0 z-30 bg-background text-foreground will-change-transform origin-center border-t border-border/10"
    >
       <div className="max-w-[1400px] mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <motion.div
             className="order-2 md:order-1 relative"
             initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
             whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 0.8, delay: 0.2 }}
          >
             <Link href="/hubschool">
                <div className="relative aspect-square max-w-[500px] mx-auto cursor-pointer group">
                   <div className="absolute inset-0 bg-card rounded-3xl border border-border/60 shadow-2xl overflow-hidden">
                     <img src="/landing/hubschool-student.svg" alt="HubSchool Academy" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                     <div className="absolute bottom-8 left-8">
                       <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg mb-4">
                         <GraduationCap className="w-6 h-6" />
                       </div>
                       <h3 className="text-2xl font-bold text-white">Academy Portal</h3>
                     </div>
                   </div>
                   {/* Decorative Grids */}
                   <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 blur-2xl -z-10 rounded-full animate-pulse" />
                   <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 blur-2xl -z-10 rounded-full animate-pulse" />
                </div>
             </Link>
          </motion.div>

          <motion.div 
            className="order-1 md:order-2 space-y-8"
            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
             <div className="w-20 h-20 bg-white/60 dark:bg-white/10 border border-black/10 dark:border-white/15 rounded-2xl flex items-center justify-center mb-8 shadow-sm backdrop-blur-xl">
                <GraduationCap className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-5xl md:text-7xl font-semibold tracking-tight">HUBSCHOOL</h2>
             <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-lg leading-relaxed tracking-tight">
               {t.landing.trinity.learn.desc}
             </p>
             <Link href="/hubschool">
               <Button variant="outline" className="rounded-full px-8 h-12 bg-white/60 dark:bg-white/10 border-black/10 dark:border-white/15 hover:bg-white/70 dark:hover:bg-white/15 vhub-hover-lift">
                 {t.landing.hero.learnMore}
               </Button>
             </Link>
          </motion.div>
       </div>
    </motion.section>
  );
}

function Slide4({ t }: { t: any }) {
  const ref = useRef<HTMLDivElement>(null);
  // Final slide doesn't need to shrink unless there's another one after it.
  // But we'll keep it consistent for potential future slides.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.5]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(10px)"]);

  const springScale = useSpring(scale, { stiffness: 80, damping: 25 });
  const springOpacity = useSpring(opacity, { stiffness: 80, damping: 25 });

  return (
    <motion.section 
      id="hub-align" 
      ref={ref}
      style={{ scale: springScale, opacity: springOpacity, filter: blur }}
      className="h-screen w-full relative flex items-center justify-center overflow-hidden sticky top-0 z-40 bg-background text-foreground will-change-transform origin-center border-t border-border/10"
    >
       <div className="max-w-[1400px] mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
             <div className="w-20 h-20 bg-background border border-border/60 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                <AudioWaveform className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">HUB ALIGN</h2>
             <p className="text-lg md:text-2xl text-muted-foreground font-medium mb-8 max-w-lg leading-relaxed tracking-tight">
               {t.landing.trinity.adr.desc}
             </p>
             <Link href="/hub-align">
               <Button variant="outline" className="rounded-full px-8 h-12">
                 Open HubAlign
               </Button>
             </Link>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
             whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
             className="relative"
          >
             <div className="relative aspect-square bg-card rounded-3xl border border-border/60 shadow-2xl overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <Cpu className="w-32 h-32 text-primary/40 animate-pulse" />
                
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-primary/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-primary/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
             </div>
          </motion.div>
       </div>
    </motion.section>
  );
}
