"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence
} from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "next-themes";
import OptimizedVideo from "./OptimizedVideo";

// --- 1. STYLES ---
const sectionStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Jost:wght@200;300;400&display=swap');
  .font-celestial { font-family: 'Cinzel', serif; }
  .font-ethereal { font-family: 'Jost', sans-serif; }
`;

interface LanguageContent { mn: string; en: string; }
interface MonkData {
  id: string | number;
  arcana: string;
  name: LanguageContent;
  title: LanguageContent;
  video: string;
}
interface ThemeConfig {
  textColor: string;
  accentColor: string;
  borderColor: string;
  cardBg: string;
  glowColor: string;
  mandalaColor: string;
  titleGradient: string;
}

// --- 2. GALAXY BACKGROUNDS ---
const HeavenlyBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden md:block">
    <div className="absolute inset-0 bg-linear-to-b from-[#FFFBEB] via-[#fffbf0] to-[#fff7ed]" />
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] opacity-30"
      style={{ background: "conic-gradient(from 0deg, transparent 0%, #fbbf24 10%, transparent 20%, #fbbf24 30%, transparent 50%)" }}
    />
  </div>
);

const CosmicBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden md:block">
    {/* Deep Space Base */}
    <div className="absolute inset-0 bg-linear-to-b from-[#05051a] via-[#2E1B49] to-[#0C164F]" />

    {/* Magenta Nebula Cloud */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] rounded-full blur-[64px]"
      style={{ background: "radial-gradient(circle, #C72075 0%, transparent 70%)", willChange: "transform, opacity" }}
    />

    {/* Stars & Pulsing Dust */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [0.5, 1.2, 0.5]
        }}
        transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        className={`absolute rounded-full ${i % 3 === 0 ? "w-[2px] h-[2px] bg-cyan-300" : "w-[1px] h-[1px] bg-white"} opacity-40`}
        style={{ top: `${(i * 19) % 100}%`, left: `${(i * 13) % 100}%` }}
      />
    ))}
  </div>
);

const VikingCorner: React.FC<{ theme: ThemeConfig; className?: string }> = ({ theme, className }) => (
  <svg className={`absolute w-14 h-14 ${theme.accentColor} opacity-60 ${className ?? ""}`} viewBox="0 0 100 100" fill="none">
    <path d="M0 0 L100 0 L100 4 L4 4 L4 100 L0 100 Z" fill="currentColor" />
    <circle cx="8" cy="8" r="3" fill="currentColor" />
  </svg>
);

import { Monk } from "@/database/types";

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"];

const MONKS_DATA: MonkData[] = []; // Placeholder to avoid breaking other parts if referenced, though we replace usage.

export default function MajesticTarotSection() {
  const { language, t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [monks, setMonks] = useState<MonkData[]>([]);

  useEffect(() => {
    setMounted(true);
    async function fetchMonks() {
      try {
        const res = await fetch('/api/monks');
        const data: Monk[] = await res.json();

        let processedMonks: MonkData[] = [];

        try {
          // Attempt to use Rust Wasm for high-performance sorting/scoring
          // @ts-ignore - Module might not be installed yet
          const wasm = await import("rust-modules");
          await wasm.default();
          const result = JSON.parse(wasm.process_monks(JSON.stringify(data)));

          console.log("Using Rust Wasm for Monk Processing 🦀");

          // Map the Rust result back to UI format
          processedMonks = result.map((m: any) => ({
            id: m.id,
            arcana: m.arcana,
            name: m.name,
            title: m.title,
            video: m.video
          }));

        } catch (wasmError) {
          // JS Fallback logic if Wasm fails or isn't installed
          // SORT BY monkNumber
          const sortedData = [...data].sort((a, b) => (a.monkNumber || 99) - (b.monkNumber || 99));
          const limitedData = sortedData.slice(0, 3);

          processedMonks = limitedData.map((m, i) => ({
            id: m._id?.toString() || `temp-${i}`,
            arcana: RUNES[i % RUNES.length],
            name: m.name,
            title: m.title,
            video: m.video || "/num1.mp4"
          }));
        }

        setMonks(processedMonks);
      } catch (e) {
        console.error("Failed to fetch monks for section", e);
      }
    }
    fetchMonks();
  }, []);

  if (!mounted) return <div className="h-screen bg-[#05051a]" />;

  const isNight = false;

  // --- ZODIAC GALAXY THEME CONFIG ---
  const theme: ThemeConfig = isNight ? {
    textColor: "text-cyan-50",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-400/30",
    cardBg: "bg-[#0C164F]/90 md:backdrop-blur-lg",
    glowColor: "rgba(199, 32, 117, 0.4)", // Magenta Glow
    mandalaColor: "text-cyan-500",
    titleGradient: "from-cyan-300 via-[#C72075] to-purple-600"
  } : {
    textColor: "text-[#451a03]",
    accentColor: "text-amber-600",
    borderColor: "border-amber-200",
    cardBg: "bg-[#fffbeb]/90 md:backdrop-blur-lg",
    glowColor: "rgba(251,191,36,0.25)",
    mandalaColor: "text-amber-500",
    titleGradient: "from-amber-200 via-amber-500 to-amber-700"
  };

  return (
    <section className="relative w-full py-40 overflow-hidden font-ethereal transition-colors duration-1000">
      <style>{sectionStyles}</style>

      {isNight ? <CosmicBackground /> : <HeavenlyBackground />}

      {/* Background Rotating Mandala */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className={`relative w-250 h-250 border border-current rounded-full flex items-center justify-center ${theme.mandalaColor}`}
        >
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute w-full h-px bg-linear-to-r from-transparent via-current to-transparent" style={{ transform: `rotate(${i * 30}deg)` }} />
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <header className="flex flex-col items-center text-center mb-32 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 backdrop-blur-md ${theme.borderColor} ${theme.cardBg}`}
          >
            <ShieldCheck className={theme.accentColor} size={32} strokeWidth={1} />
          </motion.div>

          <h2 className={`text-6xl md:text-8xl font-celestial font-light tracking-tighter ${theme.textColor}`}>
            {t({ mn: "Мэргэ", en: "Tarot card" })}{" "}
            <span className={`italic text-transparent bg-clip-text bg-linear-to-b ${theme.titleGradient}`}>
              {t({ mn: "үзүүлэх", en: "prediction" })}
            </span>
          </h2>
          <div className={`w-40 h-px bg-linear-to-r from-transparent via-current to-transparent ${theme.mandalaColor}`} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 max-w-7xl mx-auto">
          {monks.map((monk, index) => (
            <MajesticCard
              key={monk.id}
              monk={monk}
              index={index}
              language={language === "mn" ? "mn" : "en"}
              theme={theme}
              isNight={isNight}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MajesticCard({ monk, index, language, theme, isNight }: { monk: MonkData; index: number; language: "mn" | "en"; theme: ThemeConfig; isNight: boolean; }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-150, 150], [10, -10]), { stiffness: 40, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-150, 150], [-10, 10]), { stiffness: 40, damping: 20 });
  const flashX = useTransform(x, (val: number) => val - 300);
  const flashY = useTransform(y, (val: number) => val - 300);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: index * 0.2 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - (rect.left + rect.width / 2));
        y.set(e.clientY - (rect.top + rect.height / 2));
      }}
      onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="group relative h-175 w-full perspective-[2000px] cursor-none"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative w-full h-full rounded-[30px] border transition-all duration-1000 overflow-hidden shadow-2xl ${theme.cardBg} ${theme.borderColor} safari-gpu`}
      >
        <div className="absolute inset-0 z-0">
          <OptimizedVideo
            src={monk.video}
            width={400}
            height={700}
            className={`w-full h-full object-cover transition-all duration-[2s] ${isHovered ? "contrast-[1.1] scale-110" : "contrast-100"}`}
            useNative={true}
          />
          <div className={`absolute inset-0 bg-linear-to-t from-black via-transparent to-black/40 transition-opacity duration-700 ${isHovered ? "opacity-40" : "opacity-80"}`} />

          {/* Cosmic Glow Interaction */}
          <motion.div
            style={{
              background: `radial-gradient(circle at center, ${theme.glowColor} 0%, transparent 70%)`,
              left: flashX,
              top: flashY
            }}
            className="absolute w-150 h-150 z-10 pointer-events-none mix-blend-screen blur-xl"
          />
        </div>

        <VikingCorner theme={theme} className="top-4 left-4" />
        <VikingCorner theme={theme} className="top-4 right-4 rotate-90" />
        <VikingCorner theme={theme} className="bottom-4 left-4 -rotate-90" />
        <VikingCorner theme={theme} className="bottom-4 right-4 rotate-180" />

        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30">
          <motion.div
            animate={isHovered ? { y: 5, scale: 1.1, color: "#C72075" } : { y: 0, scale: 1 }}
            className={`font-celestial text-4xl font-black tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] ${theme.accentColor}`}
          >
            {monk.arcana}
          </motion.div>
        </div>

        <div className="absolute inset-0 z-40 flex flex-col items-center justify-end pb-20 px-10 pointer-events-none">
          <AnimatePresence>
            {isHovered && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="text-center">
                <div className={`flex items-center justify-center gap-2 mb-4 ${theme.accentColor}`}>
                  <Sparkles size={18} className="animate-pulse" />
                </div>
                <h3 className="text-4xl font-celestial text-white font-bold tracking-tight mb-2 uppercase drop-shadow-lg">
                  {monk.name[language]}
                </h3>
                <p className={`${isNight ? 'text-cyan-300' : 'text-amber-600'} font-bold tracking-[0.3em] text-[10px] uppercase`}>
                  {monk.title[language]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Cosmic Cursor */}
        <motion.div style={{ x, y }} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`w-16 h-16 border rounded-full flex items-center justify-center backdrop-blur-sm ${theme.borderColor}`}>
            <div className={`w-2 h-2 rounded-full animate-ping ${isNight ? 'bg-cyan-400 shadow-[0_0_10px_#50F2CE]' : 'bg-amber-500'}`} />
          </div>
        </motion.div>
      </motion.div>

      {/* Ground Glow */}
      <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-[100px] rounded-full transition-opacity duration-1000 ${isHovered ? "opacity-100" : "opacity-0"} ${isNight ? 'bg-[#C72075]/30' : 'bg-amber-600/20'}`} />
    </motion.div>
  );
}