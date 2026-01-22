"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence
} from "framer-motion";
import { ArrowUpRight, Loader2, Sparkles, Calendar } from "lucide-react";
import OverlayNavbar from "../components/Navbar";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Monk } from "@/database/types";

// =========================================
// 1. VISUAL EFFECTS COMPONENTS
// =========================================

interface Particle {
  id: number;
  x: number;
  duration: number;
  delay: number;
  left: number;
}

const CosmicDust = ({ isDark }: { isDark: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles([...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      left: Math.random() * 100
    })));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: "-100vh",
            opacity: [0, 0.4, 0],
            x: p.x
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay
          }}
          className={`absolute w-1 h-1 rounded-full safari-gpu ${isDark ? 'bg-cyan-200' : 'bg-amber-400'}`}
          style={{ left: `${p.left}%` }}
        />
      ))}
    </div>
  );
};

const DivineParticle = ({ isDark, index }: { isDark: boolean, index: number }) => {
  const [config, setConfig] = useState<{ x: number, left: number, delay: number } | null>(null);

  useEffect(() => {
    setConfig({
      x: (Math.random() - 0.5) * 100,
      left: 20 + Math.random() * 60,
      delay: index * 0.1
    });
  }, [index]);

  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: [0, 1, 0], y: -200, x: config.x }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, delay: config.delay, ease: "easeOut" }}
      className={`absolute bottom-0 w-1 h-1 rounded-full z-20 pointer-events-none ${isDark ? 'bg-cyan-400' : 'bg-amber-500'}`}
      style={{ left: `${config.left}%` }}
    />
  );
};

const NoiseOverlay = () => (
  <div className="absolute inset-0 z-20 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
);

// =========================================
// 2. MAIN PAGE LAYOUT
// =========================================

export default function DivineTarotShowcase() {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [monks, setMonks] = useState<Monk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [wasm, setWasm] = useState<any>(null);

  // Theme Sync
  const isDark = false;

  useEffect(() => {
    setMounted(true);
    // Load Rust WASM module
    import("rust-modules").then(mod => setWasm(mod)).catch(err => console.error("WASM load failed", err));

    async function fetchMonks() {
      try {
        const response = await fetch('/api/monks');
        const data = await response.json();
        if (Array.isArray(data)) {
          setMonks(data);
        } else {
          console.error("API returned non-array:", data);
          setMonks([]);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    }
    fetchMonks();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredMonks = useMemo<Monk[]>(() => {
    // Use Rust WASM if available for accelerated filtering
    if (wasm && monks.length > 0) {
      let dayName = "";
      if (selectedDate) {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      }

      try {
        const result = wasm.filter_monks(JSON.stringify(monks), dayName);
        return JSON.parse(result) as Monk[];
      } catch (e) {
        console.error("Rust filter error:", e);
        // Fallthrough to JS
      }
    }

    // Fallback JS Logic
    return monks.filter(monk => {
      // 1. Global Availability Check
      if (!monk.isAvailable) return false;

      // 2. Date Filter
      if (selectedDate) {
        // If monk has NO schedule defined, we assume they are generally available 
        if (!monk.schedule || monk.schedule.length === 0) return true;

        const [y, m, d] = selectedDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if this day exists and is active in their schedule
        const daySchedule = monk.schedule.find(s => s.day === dayName);

        return daySchedule ? daySchedule.active : false;
      }

      return true;
    });
  }, [monks, selectedDate, wasm]);

  if (!mounted) return <div className="min-h-screen bg-[#05051a]" />;

  return (
    <>
      <OverlayNavbar />
      <section className={`relative min-h-screen pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden transition-colors duration-1000 ${isDark ? "bg-[#05051a]" : "bg-[#fdfbf7]"}`}>

        {/* Ambient Backgrounds */}
        <div className="absolute inset-0 transition-opacity duration-1000">
          {isDark ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_#05051a_60%)]" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#fff7ed_0%,_#fdfbf7_60%)]" />
          )}
          <CosmicDust isDark={isDark} />
        </div>

        <div className="container mx-auto px-6 relative z-10">

          {/* Header */}
          <header className="text-center mb-16 md:mb-24 relative">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full border border-current/10 backdrop-blur-md"
            >
              <Sparkles size={14} className={isDark ? "text-cyan-400" : "text-amber-500"} />
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-cyan-200" : "text-amber-800"}`}>
                {t({ mn: "Мэргэн Ухаан", en: "Divine Wisdom" })}
              </span>
              <Sparkles size={14} className={isDark ? "text-cyan-400" : "text-amber-500"} />
            </motion.div>

            <h1 className={`text-5xl md:text-9xl font-serif font-medium tracking-tighter leading-[0.9] md:leading-[0.8] mb-6 md:mb-8 ${isDark ? "text-white" : "text-[#2a1a12]"}`}>
              {t({ mn: "Үзмэрч", en: "Exhibitor" })}
            </h1>

            <p className={`max-w-xl mx-auto text-xs md:text-base font-sans tracking-widest uppercase opacity-60 ${isDark ? "text-cyan-100" : "text-amber-900"}`}>
              {t({ mn: "Хувь тавилангийн хөтөч", en: "Guidance through the threads of fate" })}
            </p>

            {/* --- DATE FILTER UI --- */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 flex justify-center"
            >
              <div className={`
                 relative flex items-center gap-4 px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-300 group
                 ${isDark
                  ? "bg-white/5 border-cyan-500/30 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  : "bg-white/40 border-amber-900/10 hover:bg-white/60 hover:border-amber-900/20 hover:shadow-lg"
                }
               `}>
                <Calendar size={18} className={isDark ? "text-cyan-400" : "text-amber-600"} />

                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`
                        bg-transparent border-none outline-none text-sm font-bold uppercase tracking-wider min-w-[140px] z-10 relative
                        ${isDark ? "text-cyan-100 placeholder-cyan-700/50 color-scheme-dark" : "text-amber-900 placeholder-amber-900/50 color-scheme-light"}
                        cursor-pointer
                      `}
                  />
                  {!selectedDate && (
                    <span className={`absolute inset-0 flex items-center pointer-events-none text-xs font-black uppercase tracking-widest opacity-60 ${isDark ? "text-cyan-200" : "text-amber-800"}`}>
                      {t({ mn: "Өдөр сонгох", en: "Select Date" })}
                    </span>
                  )}
                </div>

                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className={`text-[10px] font-black uppercase hover:underline ${isDark ? "text-red-400" : "text-red-600"}`}
                  >
                    {t({ mn: "Арилгах", en: "Clear" })}
                  </button>
                )}
              </div>
            </motion.div>
          </header>

          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <Loader2 className={`animate-spin w-12 h-12 ${isDark ? "text-cyan-400" : "text-amber-600"}`} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 perspective-[2000px]">
              {filteredMonks.length > 0 ? (
                filteredMonks.map((monk, idx) => (
                  <DivineCard key={idx} monk={monk} index={idx} isDark={isDark} lang={language === 'mn' ? 'mn' : 'en'} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 opacity-50">
                  <p className={`text-xl font-serif ${isDark ? "text-cyan-200" : "text-amber-800"}`}>
                    {t({ mn: "Энэ өдөр багш нар завгүй байна.", en: "No monks available on this date." })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// =========================================
// 3. THE DIVINE CARD (The Fixed Component)
// =========================================

function DivineCard({ monk, index, isDark, lang }: { monk: Monk, index: number, isDark: boolean, lang: 'mn' | 'en' }) {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // -- PHYSICS ENGINES --
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 1. Tilt Physics
  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 150, damping: 20 });

  // 2. Parallax Physics (Image moves OPPOSITE to mouse)
  const bgX = useSpring(useTransform(x, [-300, 300], [-25, 25]), { stiffness: 150, damping: 20 });
  const bgY = useSpring(useTransform(y, [-300, 300], [-25, 25]), { stiffness: 150, damping: 20 });

  // 3. Glare Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const glareColor = isDark ? "rgba(34, 211, 238, 0.2)" : "rgba(251, 191, 36, 0.25)";
  const glareBackground = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${glareColor}, transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    x.set(0); y.set(0); setIsHovered(false);
  };

  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  return (
    <Link href={`/monks/${monk._id}`}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        style={{ perspective: 1500 }}
        className="group w-full h-[450px] md:h-[600px] cursor-none z-10"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className={`
            relative w-full h-full rounded-[2rem] md:rounded-[2.5rem] border transition-colors duration-500 overflow-hidden shadow-2xl safari-gpu
            ${isDark
              ? "bg-[#0a0a20] border-cyan-500/30 shadow-[0_0_50px_-10px_rgba(8,145,178,0.3)]"
              : "bg-white border-amber-200 shadow-[0_20px_60px_-10px_rgba(245,158,11,0.2)]"
            }
            `}
        >
          {/* --- LAYER 1: PARALLAX IMAGE --- */}
          <motion.div
            style={{ x: bgX, y: bgY, scale: 1.15 }}
            className="absolute inset-0 z-0"
          >
            <div className={`absolute inset-0 z-10 mix-blend-color transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'} ${isDark ? 'bg-[#0a0a20]' : 'bg-[#fff7ed]'}`} />
            <img
              src={monk.image || "/default-monk.jpg"}
              alt={monk.name[lang]}
              className="w-full h-full object-cover transition-all duration-1000 ease-out"
            />
            <div className={`absolute inset-0 z-20 bg-gradient-to-b ${isDark ? 'from-black/60 via-transparent to-black' : 'from-white/40 via-transparent to-[#fdfbf7]'} opacity-90`} />
          </motion.div>

          {/* --- LAYER 2: NOISE --- */}
          <NoiseOverlay />

          {/* --- LAYER 3: HOLOGRAPHIC GLARE --- */}
          <motion.div
            style={{ background: glareBackground }}
            className="absolute inset-0 z-30 mix-blend-overlay pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />

          {/* --- LAYER 4: FLOATING CONTENT (3D Lifted) --- */}
          <div className="absolute inset-0 z-40 p-8 flex flex-col justify-between transform-style-3d pointer-events-none">

            {/* --- 50K PRICE BADGE (Top Right) --- */}
            <motion.div
              style={{ translateZ: 40 }}
              className="flex justify-end absolute top-8 right-8 z-50 pointer-events-auto"
            >
              <div className={`
                        flex flex-col items-center justify-center px-5 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl transition-transform group-hover:scale-110
                        ${isDark
                  ? "bg-cyan-950/60 border-cyan-400/40"
                  : "bg-white/60 border-amber-200/60"
                }
                    `}>
                <span className={`text-[8px] font-black uppercase tracking-widest opacity-70 mb-0.5 ${isDark ? "text-cyan-200" : "text-amber-900"}`}>
                  {lang === 'mn' ? 'Үнэ' : 'Starting'}
                </span>
                <div className={`flex items-center gap-1 text-lg font-serif font-black ${isDark ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" : "text-amber-700"}`}>
                  {monk.isSpecial ? "88,800₮" : "50,000₮"}
                </div>
              </div>
            </motion.div>

            {/* --- ID BADGE (Left) --- */}
            <motion.div style={{ translateZ: 30 }} className="flex justify-start items-start">
              <div className={`
                        px-4 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-black uppercase tracking-widest
                        ${isDark
                  ? "border-cyan-500/30 bg-cyan-950/30 text-cyan-300"
                  : "border-amber-500/30 bg-amber-50/50 text-amber-700"
                }
                    `}>
                Arcana {roman[index] || index + 1}
              </div>
            </motion.div>

            {/* --- BOTTOM CONTENT --- */}
            <motion.div style={{ translateZ: 60 }} className="text-center pb-6">

              {/* --- BRIGHT GLOWING NAME --- */}
              <h3 className={`
                        text-4xl md:text-5xl font-serif font-black mb-3 transition-colors duration-500
                        ${isDark
                  ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                  : "text-[#2a1a12] drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
                }
                    `}>
                {monk.name[lang]}
              </h3>

              {/* Divider */}
              <div className="flex justify-center mb-4">
                <div className={`h-[3px] w-20 rounded-full ${isDark ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-amber-600'}`} />
              </div>

              <p className={`
                        text-[11px] font-black uppercase tracking-[0.4em] mb-8
                        ${isDark ? "text-cyan-100 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" : "text-amber-900 font-bold drop-shadow-sm"}
                    `}>
                {monk.title?.[lang] || "Master of Fate"}
              </p>

              {/* --- APPEALING BOOKING BUTTON --- */}
              <div className={`
                        pointer-events-auto inline-flex items-center gap-4 px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group/btn relative overflow-hidden
                        ${isDark
                  ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-cyan-500/30 border border-cyan-400/50"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-600/30 border border-amber-400/50"
                }
                    `}>
                {/* Shimmer Animation Layer */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 safari-gpu"
                />

                <div className="text-left relative z-10">
                  <span className="block text-[10px] font-black uppercase tracking-widest opacity-90 drop-shadow-md">
                    {t({ mn: "Цаг Захиалах", en: "Book Session" })}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-white/30 relative z-10" />
                <ArrowUpRight size={20} strokeWidth={2.5} className="relative z-10 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </div>

            </motion.div>
          </div>

          {/* --- LAYER 5: PARTICLES --- */}
          <AnimatePresence>
            {isHovered && [...Array(6)].map((_, i) => (
              <DivineParticle key={i} index={i} isDark={isDark} />
            ))}
          </AnimatePresence>

        </motion.div>

        {/* --- CUSTOM CURSOR --- */}
        <motion.div
          style={{ x, y }}
          className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none
                transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}
            `}
        >
          <div className={`w-20 h-20 rounded-full border border-dashed animate-[spin_8s_linear_infinite] ${isDark ? "border-cyan-300/50" : "border-amber-600/30"}`} />
          <div className={`absolute inset-0 w-2 h-2 m-auto rounded-full ${isDark ? "bg-cyan-400 shadow-[0_0_15px_#22d3ee]" : "bg-amber-600 shadow-[0_0_15px_#d97706]"}`} />
        </motion.div>

        {/* Floor Reflection */}
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 0.9, opacity: isHovered ? 0.6 : 0.2 }}
          className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-[40px] rounded-[100%] transition-all duration-700
             ${isDark ? 'bg-cyan-500' : 'bg-amber-500'}`}
        />

      </motion.div >
    </Link >
  );
}