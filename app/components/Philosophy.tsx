"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
  useVelocity,
  useAnimationFrame
} from "framer-motion";
import dynamic from "next/dynamic";
const CountUp = dynamic(() => import("react-countup"), { ssr: false });
import { TypeAnimation } from "react-type-animation";
import {
  ArrowRight, Sparkles, Star, Target, Zap, Flower, Play, ExternalLink,
  Users, Globe, Heart, Quote, Sun, Feather, ArrowUpRight
} from "lucide-react";
import OptimizedVideo from "./OptimizedVideo";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "next-themes";

// ==========================================
// 1. MICRO-COMPONENTS (High-Level Effects)
// ==========================================

/**
 * SpotlightCard: Creates a glowing gradient that follows the mouse
 */
const SpotlightCard = ({ children, className = "", theme }: { children: React.ReactNode; className?: string; theme: any }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative border overflow-hidden group ${className} ${theme.borderColor} ${theme.altarBg} safari-gpu`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              ${theme.spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

/**
 * MagneticButton: Adds physics resistance to the mouse hover
 */
const MagneticButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={`${className} safari-gpu`}
    >
      {children}
    </motion.div>
  );
};

/**
 * RevealText: Staggers text appearing line by line
 */
const RevealText = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </span>
  );
};

/**
 * ParallaxImage: Moves background slightly slower than scroll
 */
const ParallaxBackground = React.memo(({ isDark }: { isDark: boolean }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const orbColor1 = isDark ? "bg-amber-600" : "bg-amber-200";
  const orbColor2 = isDark ? "bg-blue-900" : "bg-orange-100";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-20" />

      {/* Moving Gradient Orbs */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[32px] opacity-20 ${orbColor1} will-change-transform`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[40px] opacity-20 ${orbColor2} will-change-transform`} />
      </motion.div>
    </div>
  );
});

// ==========================================
// 2. MAIN PAGE CONTENT
// ==========================================

export default function AboutUsHero() {
  return <ActualAboutContent />;
}

function ActualAboutContent() {
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  // Ensure we capture "dark" correctly from next-themes if available, defaulting to false
  const isNight = false;
  const containerRef = useRef<HTMLDivElement>(null);

  // --- CONTENT DATA ---
  const content = {
    mn: {
      badge: "Бидний Эрхэм Зорилго",
      typeSequence: ["Уламжлалт Соёлыг", 1500, "Орчин үеийн Технологиор", 1500, "Таны Гартаа", 2000],
      subheadline: "Монголчуудын олон зуун жилийн оюун санааны өв соёлыг дижитал шилжилттэй холбож, хүн бүрт амар амгаланг хүртээмжтэй түгээх нь бидний зорилго юм.",
      cta: "Үйлчилгээ үзэх",
      masters: "120+ Багш нар",
      philosophyTitle: "Бидний Баримтлах",
      philosophySubtitle: "Гурван Тулгуур",
      philosophyDesc: "Эртний мэргэн ухааныг гэрлийн хурдтай холбож, орчин үеийн хүмүүсийн сэтгэл зүйд нийцүүлэх нь бидний гүүр юм.",
      philosophies: [
        { title: "Оюун санаа", desc: "Дотоод амар амгаланг олоход тань туслах зөвлөгөө.", icon: <Star /> },
        { title: "Уламжлал", desc: "Монгол зан заншил, өв соёлоо дижитал хэлбэрт хадгалах.", icon: <Flower /> },
        { title: "Технологи", desc: "Дэлхийн хаанаас ч холбогдох хязгааргүй боломжийг нээх.", icon: <Globe /> }
      ],
      marquee: "МОНГОЛ ӨВ СОЁЛ  •  ДИЖИТАЛ АМАР АМГАЛАН  •  УЛАМЖЛАЛТ МЭРГЭН УХААН  •  ",
      stats: [
        { label: "Мэргэжлийн Багш нар", end: 120, icon: <Users /> },
        { label: "Нийт Хамрах Хүрээ", end: 21, icon: <Globe /> },
        { label: "Амар Амгаланг Эрэлхийлэгчид", end: 5000, icon: <Heart /> }
      ],
      storyTitle: "Мэргэн Ухааны Зам",
      storyText: "Бид зөвхөн вэбсайт биш, энэ бол оюун санааны аялал юм. Технологийн тусламжтайгаар орон зай, цаг хугацааны саадыг даван туулж, таныг жинхэнэ өөртэйгөө уулзахад тусална.",
      liveText: "Шуд дамжуулалт"
    },
    en: {
      badge: "Our Noble Mission",
      typeSequence: ["Traditional Heritage", 1500, "Modern Technology", 1500, "In Your Hands", 2000],
      subheadline: "Our mission is to bridge centuries of Mongolian spiritual wisdom with digital innovation, making inner peace accessible to everyone, everywhere.",
      cta: "Explore Services",
      masters: "120+ Masters",
      philosophyTitle: "Our Philosophy",
      philosophySubtitle: "Three Pillars",
      philosophyDesc: "Merging ancient wisdom with the speed of light to serve the modern soul through accessible connection.",
      philosophies: [
        { title: "Mindset", desc: "Guiding you toward inner stillness and mental clarity.", icon: <Star /> },
        { title: "Heritage", desc: "Preserving Mongolian traditions for the digital age.", icon: <Flower /> },
        { title: "Innovation", desc: "Unlocking borderless access to spiritual guidance via tech.", icon: <Globe /> }
      ],
      marquee: "MONGOLIAN HERITAGE  •  DIGITAL PEACE  •  TRADITIONAL WISDOM  •  ",
      stats: [
        { label: "Trusted Masters", end: 120, icon: <Users /> },
        { label: "Global Coverage", end: 21, icon: <Globe /> },
        { label: "Peace Seekers", end: 5000, icon: <Heart /> }
      ],
      storyTitle: "The Wisdom Path",
      storyText: "We are more than just a platform; we are a spiritual vessel. Through technology, we dissolve the barriers of time and distance, connecting you to the source of peace.",
      liveText: "Live Atmosphere"
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  // --- THEME ENGINE ---
  const theme = isNight ? {
    mainBg: "bg-[#05051a]", textColor: "text-amber-50", accentText: "text-amber-500",
    mutedText: "text-amber-100/60", borderColor: "border-amber-500/20",
    altarBg: "bg-[#0a0a25]/90 md:backdrop-blur-lg",
    spotlightColor: "rgba(245, 158, 11, 0.15)",
    btnPrimary: "bg-amber-600 text-[#05051a] shadow-[0_0_30px_-5px_rgba(217,119,6,0.4)]",
    orbColor1: "bg-amber-600", orbColor2: "bg-blue-900",
  } : {
    mainBg: "bg-[#FDFBF7]", textColor: "text-[#451a03]", accentText: "text-amber-600",
    mutedText: "text-[#78350F]/60", borderColor: "border-amber-900/10",
    altarBg: "bg-white/90 md:backdrop-blur-lg",
    spotlightColor: "rgba(217, 119, 6, 0.08)",
    btnPrimary: "bg-[#451a03] text-white shadow-[0_10px_30px_-5px_rgba(69,26,3,0.3)]",
    orbColor1: "bg-amber-200", orbColor2: "bg-orange-100",
  };

  return (
    <div ref={containerRef} className={`relative w-full ${theme.mainBg} ${theme.textColor} transition-colors duration-1000 font-serif overflow-hidden`}>

      {/* 1. Global Effects */}
      <ParallaxBackground isDark={isNight} />

      {/* 2. Floating Frame */}
      <div className="fixed inset-0 pointer-events-none z-[50] p-4 md:p-8">
        <div className={`w-full h-full border-[1px] opacity-20 rounded-[2rem] md:rounded-[3rem] transition-colors duration-1000 ${theme.borderColor}`} />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center pt-24 md:pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left Content */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: "circOut" }}>
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
                  className={`h-[2px] w-12 origin-left ${theme.accentText} bg-current`}
                />
                <RevealText text={t.badge} delay={0.8} className="text-[11px] uppercase tracking-[0.4em] font-black" />
              </div>

              <div className="min-h-[160px] md:min-h-[240px]">
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic mb-10">
                  <TypeAnimation sequence={t.typeSequence} wrapper="span" speed={50} repeat={Infinity} cursor={false} />
                </h1>
              </div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className={`max-w-md text-base md:text-xl font-sans tracking-wide leading-relaxed mb-12 ${theme.mutedText}`}
              >
                {t.subheadline}
              </motion.p>

              <div className="flex flex-wrap items-center gap-8">
                <Link href="/services">
                  <MagneticButton className="relative group">
                    <button className={`relative px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 overflow-hidden ${theme.btnPrimary}`}>
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles size={16} /> {t.cta}
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.86,0,0.07,1)]" />
                    </button>
                  </MagneticButton>
                </Link>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}
                  className="flex items-center gap-4 pl-8 border-l border-current/20"
                >
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-[#05051a] bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg`} />
                    ))}
                  </div>
                  <div>
                    <span className="block text-xl font-black leading-none">120+</span>
                    <span className={`text-[9px] uppercase tracking-widest ${theme.mutedText}`}>Masters</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Visual (Interactive Video Card) */}
            <div className="relative group perspective-[1000px]">
              {/* Orbital Rings */}
              <div className={`absolute -inset-10 border border-current opacity-10 rounded-full animate-[spin_40s_linear_infinite]`} />
              <div className={`absolute -inset-20 border border-dashed border-current opacity-5 rounded-full animate-[spin_60s_linear_infinite_reverse]`} />

              <motion.div
                initial={{ opacity: 0, rotateY: 15, rotateX: 5 }}
                animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
                transition={{ duration: 1.5, type: "spring" }}
                className="relative z-10 safari-gpu"
              >
                <SpotlightCard theme={theme} className="rounded-[4rem]">
                  <div className="aspect-[4/5] relative">
                    <OptimizedVideo
                      id="philosophy-video"
                      src="https://res.cloudinary.com/dxoxdiuwr/video/upload/v1768133950/num2_ocygii.mp4"
                      width={800}
                      height={1000}
                      className="w-full h-full object-cover transition-all duration-1000 ease-out"
                      useNative={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end text-white">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <p className="text-[9px] uppercase tracking-widest font-bold opacity-80">{t.liveText}</p>
                        </div>
                        <h2 className="text-2xl font-bold font-sans">Divine Wisdom</h2>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        aria-label="Divine Wisdom Action"
                        className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center bg-black/20 backdrop-blur-md cursor-pointer hover:bg-white hover:text-black transition-colors"
                      >
                        <Flower size={24} />
                      </motion.div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY SECTION (Horizontal Scroll Feel) --- */}
      <section className="relative py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-2xl relative">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Quote size={60} className={`absolute -top-10 -left-10 opacity-10 rotate-180 ${theme.accentText}`} />
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] relative z-10">
                  {t.philosophyTitle} <br /> <span className={`italic ${theme.accentText}`}>{t.philosophySubtitle}</span>
                </h2>
              </motion.div>
            </div>
            <p className={`max-w-xs text-xs uppercase tracking-widest leading-loose font-bold border-l-2 pl-6 ${theme.borderColor} ${isNight ? "text-amber-100/80" : "text-[#78350F]/80"}`}>
              {t.philosophyDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.philosophies.map((p, i) => (
              <SpotlightCard key={i} theme={theme} className="rounded-[2.5rem] group hover:-translate-y-2 transition-transform duration-500">
                <div className="p-10 h-full flex flex-col justify-between min-h-[320px]">
                  <div>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 group-hover:rotate-12 ${theme.borderColor} ${theme.altarBg}`}>
                      {React.cloneElement(p.icon as React.ReactElement, { size: 28, strokeWidth: 1.5 } as any)}
                    </div>
                    <h3 className="text-3xl font-bold mb-4 uppercase tracking-tighter">{p.title}</h3>
                    <p className={`text-sm leading-relaxed ${isNight ? "text-amber-100/80" : "text-[#78350F]/80"}`}>{p.desc}</p>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <ArrowUpRight className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.accentText}`} />
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORY SECTION (Parallax Container) --- */}
      <section className="py-24 px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-6xl"
        >
          <div className={`p-12 md:p-32 rounded-[3rem] relative overflow-hidden border ${theme.borderColor} ${theme.altarBg}`}>

            {/* Background Elements */}
            <motion.div style={{ y: useTransform(useScroll().scrollYProgress, [0, 1], [0, -100]) }} className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <Feather size={400} />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-[0.02] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                whileInView={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-10"
              >
                <Sun size={64} className={`${theme.accentText}`} />
              </motion.div>

              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-10">{t.storyTitle}</h2>

              <div className="relative max-w-4xl mx-auto">
                <Quote size={24} className={`absolute -top-6 -left-6 ${theme.accentText}`} />
                <p className="text-xl md:text-3xl leading-relaxed font-sans font-light">
                  {t.storyText}
                </p>
                <Quote size={24} className={`absolute -bottom-6 -right-6 rotate-180 ${theme.accentText}`} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- INFINITE MARQUEE --- */}
      <section className="py-20 border-y border-current/5 overflow-hidden relative" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10" />

        <div className="flex gap-0 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="text-6xl md:text-9xl font-black opacity-[0.07] uppercase tracking-tighter px-10">
                {t.marquee}
              </span>
              <Flower className="opacity-10 animate-spin-slow" size={40} />
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS SECTION (Interactive) --- */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.stats.map((stat, i) => (
            <SpotlightCard key={i} theme={theme} className="rounded-[3rem] text-center group">
              <div className="py-20 px-8">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`mx-auto w-16 h-16 flex items-center justify-center mb-8 rounded-full bg-current/5 ${theme.accentText}`}
                >
                  {React.cloneElement(stat.icon as React.ReactElement, { size: 32 } as any)}
                </motion.div>

                <div className="text-6xl md:text-8xl font-black tracking-tighter mb-4 flex justify-center overflow-hidden">
                  <CountUp end={stat.end} duration={3} enableScrollSpy scrollSpyOnce />
                  <span className="text-4xl relative top-2 ml-1">+</span>
                </div>

                <p className="text-xs uppercase tracking-[0.4em] font-black opacity-50">{stat.label}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-spin-slow {
            animation: spin 10s linear infinite;
        }
      `}</style>
    </div>
  );
}