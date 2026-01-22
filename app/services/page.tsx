"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  Variants
} from "framer-motion";
import {
  Eye, Star, Flame, Zap, Compass, Loader2, ShieldCheck, Orbit, Sparkles, User, ArrowUpRight, Hourglass, Tag, Coins
} from "lucide-react";
import { useTheme } from "next-themes";
import OverlayNavbar from "../components/Navbar";
import { useLanguage } from "../contexts/LanguageContext";

// ==========================================
// 1. VISUAL & ANIMATION UTILS
// ==========================================

const TextReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <div className={`overflow-hidden ${className}`}>
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </div>
);

const CosmicDust = ({ isDark }: { isDark: boolean }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles([...Array(15)].map((_, i) => ({
      id: i,
      x: Math.random() * 50 - 25,
      duration: Math.random() * 10 + 20,
      delay: Math.random() * 5,
      left: Math.random() * 100
    })));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: "-100%",
            opacity: [0, 0.5, 0],
            x: p.x
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay
          }}
          className={`absolute w-1 h-1 rounded-full blur-[1px] ${isDark ? 'bg-cyan-200' : 'bg-amber-400'}`}
          style={{ left: `${p.left}%` }}
        />
      ))}
    </div>
  );
};

const ZodiacServiceFrame = ({ color, isDark }: { color: string; isDark: boolean }) => (
  <div className="absolute inset-0 pointer-events-none z-30 p-2 md:p-0">
    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`frameGrad-${isDark ? 'd' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={isDark ? "#C72075" : "#d97706"} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        d="M20 40 L20 20 L40 20 M360 20 L380 20 L380 40 M380 560 L380 580 L360 580 M40 580 L20 580 L20 560"
        stroke={`url(#frameGrad-${isDark ? 'd' : 'l'})`} strokeWidth="2" fill="none"
      />

      {/* Informative Grid Lines */}
      <path d="M40 400 H360" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />
      <path d="M200 400 V540" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" />
    </svg>
  </div>
);

// ==========================================
// 2. MAIN PAGE LAYOUT
// ==========================================

export default function CelestialServices() {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = false;

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();

        // Use a Map to store unique services by name (prefer MN name as key, fallback to EN)
        const uniqueServicesMap = new Map();

        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.price) { // Ensure valid item
              const key = item.name?.mn || item.name?.en || item.title?.mn || item.title?.en;
              if (key && !uniqueServicesMap.has(key)) {
                uniqueServicesMap.set(key, item);
              }
            }
          });
        }

        setServices(Array.from(uniqueServicesMap.values()));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#FDFBF7]" />;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  return (
    <>
      <OverlayNavbar />
      <main className={`relative min-h-[100dvh] transition-colors duration-1000 overflow-hidden ${isDark ? "bg-[#05051a]" : "bg-[#FDFBF7]"}`}>

        {/* --- ATMOSPHERE --- */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-[#0f172a] via-[#05051a] to-[#020617]' : 'from-[#fffbeb] via-[#fff7ed] to-[#fdfbf7]'}`} />
          <CosmicDust isDark={isDark} />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>

        {/* HERO */}
        <div className="container mx-auto px-4 md:px-6 text-center pt-32 md:pt-48 mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border border-current/10 backdrop-blur-md ${isDark ? "text-cyan-400" : "text-amber-700"}`}>
              <Orbit size={16} className="animate-spin-slow" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">{t({ mn: "Одот тамга", en: "Celestial Seals" })}</span>
            </div>

            <h1 className={`text-6xl md:text-9xl font-serif leading-[0.85] tracking-tighter ${isDark ? "text-white" : "text-[#2a1a12]"}`}>
              <TextReveal delay={0.2} className={`italic font-light ${isDark ? "text-[#C72075]" : "text-amber-600"}`}>
                {t({ mn: "Зан Үйл", en: "Rituals" })}
              </TextReveal>
            </h1>
          </motion.div>
        </div>

        {/* GRID */}
        <div className="container mx-auto px-6 pb-40 relative z-20">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className={`animate-spin w-12 h-12 ${isDark ? 'text-cyan-500' : 'text-amber-500'}`} />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 perspective-[2000px]"
            >
              {services.map((service, idx) => (
                <HolographicCard key={idx} service={service} index={idx} isDark={isDark} lang={language === 'mn' ? 'mn' : 'en'} />
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

// ==========================================
// 3. HOLOGRAPHIC CARD (Informative & Animated)
// ==========================================

function HolographicCard({ service, index, isDark, lang }: { service: any, index: number, isDark: boolean, lang: 'mn' | 'en' }) {
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) setIsMobile(true);
  }, []);

  // -- PHYSICS --
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [8, -8]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-8, 8]), { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  // -- DATA RESOLUTION --
  const displayTitle = service.title?.[lang] || service.name?.[lang];
  const description = service.description?.[lang] || (lang === 'mn' ? "Дэлгэрэнгүй тайлбар байхгүй..." : "No detailed description...");
  const serviceLink = `/booking/${service._id || service.id}`;
  const providerName = service.providerName?.[lang] || "Master";
  const typeLabel = service.type === "divination" ? (lang === 'mn' ? "Мэргэ" : "Divination") : (lang === 'mn' ? "Зан үйл" : "Ritual");

  const theme = isDark ? {
    bg: "bg-[#0a0a20]/90",
    border: "border-cyan-500/20",
    accent: "#50F2CE",
    text: "text-white",
    subText: "text-cyan-300",
    desc: "text-cyan-100/60",
    shadow: "shadow-[0_0_60px_rgba(8,145,178,0.2)]",
    cardItem: "bg-[#1e1b4b]/40 border-white/5",
    btn: "bg-gradient-to-r from-[#C72075] to-[#7B337D] text-white shadow-[#C72075]/40"
  } : {
    bg: "bg-white/90",
    border: "border-amber-900/10",
    accent: "#d97706",
    text: "text-[#2a1a12]",
    subText: "text-amber-700",
    desc: "text-amber-900/60",
    shadow: "shadow-2xl shadow-amber-900/10",
    cardItem: "bg-amber-50/50 border-amber-900/5",
    btn: "bg-stone-900 text-white shadow-stone-900/30"
  };

  const Icons = [Eye, Star, Flame, Zap, ShieldCheck, Compass];
  const Icon = Icons[index % Icons.length];

  const glareColor = isDark ? "rgba(80, 242, 206, 0.2)" : "rgba(251, 191, 36, 0.25)";
  const glareBg = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${glareColor}, transparent 80%)`;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full h-[600px] z-10"
      style={{ perspective: 1500 }}
    >
      <Link href={serviceLink} className="block h-full">
        <motion.div
          style={isMobile ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className={`
            relative w-full h-full rounded-[3rem] border backdrop-blur-xl overflow-hidden transition-all duration-500
            ${theme.bg} ${theme.border} ${theme.shadow} group-hover:scale-[1.01]
          `}
        >
          {/* Layer 1: Frame */}
          <ZodiacServiceFrame color={theme.accent} isDark={isDark} />

          {/* Layer 2: Glare */}
          <motion.div
            className="absolute inset-0 z-10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: glareBg }}
          />

          {/* Layer 3: Shimmer */}
          <div className="absolute inset-0 z-[15] overflow-hidden rounded-[3rem] pointer-events-none">
            <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
          </div>

          {/* Layer 4: Content (Lifted) */}
          <div className="absolute inset-0 z-20 flex flex-col p-8 md:p-10 transform-style-3d pointer-events-none">

            {/* --- TOP: TYPE BADGE & ICON --- */}
            <motion.div style={{ translateZ: 40 }} className="flex justify-between items-start mb-10">
              <div className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest
                    ${isDark ? 'border-cyan-500/30 text-cyan-300 bg-cyan-950/30' : 'border-amber-600/20 text-amber-800 bg-amber-50'}
                `}>
                <Tag size={12} /> {typeLabel}
              </div>

              <div className={`
                    p-4 rounded-2xl border transition-all duration-700 group-hover:rotate-12
                    ${isDark ? 'bg-[#1e1b4b]/50 border-cyan-500/30' : 'bg-white border-amber-200'}
                `}>
                <Icon size={24} color={theme.accent} strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* --- MIDDLE: INFO REVEAL --- */}
            <motion.div style={{ translateZ: 50 }} className="flex-1 flex flex-col justify-start text-center">
              <TextReveal delay={0.1}>
                <h3 className={`text-3xl md:text-4xl font-serif font-black leading-none tracking-tight mb-4 ${theme.text}`}>
                  {displayTitle}
                </h3>
              </TextReveal>

              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  className={`h-[2px] opacity-30 ${isDark ? 'bg-cyan-400' : 'bg-amber-900'}`}
                />
              </div>

              <TextReveal delay={0.2}>
                <p className={`text-xs md:text-sm leading-relaxed font-medium line-clamp-3 ${theme.desc}`}>
                  {description}
                </p>
              </TextReveal>
            </motion.div>

            {/* --- BOTTOM: DATA GRID --- */}
            <motion.div style={{ translateZ: 30 }} className="w-full mt-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* DURATION */}
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center ${theme.cardItem}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest opacity-50 mb-1 ${theme.text}`}>
                    {lang === 'mn' ? 'Хугацаа' : 'Time'}
                  </span>
                  <div className={`flex items-center gap-1.5 font-bold ${theme.subText}`}>
                    <Hourglass size={14} /> <span>{service.duration}</span>
                  </div>
                </div>

                {/* TEACHER */}
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center ${theme.cardItem}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest opacity-50 mb-1 ${theme.text}`}>
                    {lang === 'mn' ? 'Багш' : 'Guide'}
                  </span>
                  <div className={`flex items-center gap-1.5 font-bold ${theme.subText}`}>
                    <User size={14} /> <span>{providerName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-left pl-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest opacity-50 block ${theme.text}`}>{lang === 'mn' ? 'Өргөл' : 'Price'}</span>
                  <span className={`text-2xl font-serif font-medium ${theme.text}`}>{Number(service.price).toLocaleString()}₮</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all ${theme.btn}`}
                >
                  {lang === 'mn' ? 'Захиалах' : 'Book'} <ArrowUpRight size={16} />
                </motion.button>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}