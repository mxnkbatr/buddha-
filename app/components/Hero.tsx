"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import OptimizedVideo from "./OptimizedVideo";
import { useUser } from "@clerk/nextjs";

export default function Hero() {
  const { t } = useLanguage();

  const { scrollYProgress } = useScroll();
  const yContent = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // --- AUTH CHECK ---
  const { isSignedIn } = useUser();

  const content = {
    highlight: t({ mn: "Бид таны", en: "We help you" }),
    main: t({ mn: "асуудлын шийдлийг олоход тань тусална.", en: "find solutions to your problems." }),
    desc: t({
      mn: "Танд тулгамдаж буй асуудлыг шийдвэрлэхэд туршлагатай багш нар туслах болно.",
      en: "Experienced mentors will help you solve the challenges you are facing."
    }),
    btn: isSignedIn ? t({ mn: "Цаг захиалах", en: "Book Now" }) : t({ mn: "Нэвтрэх", en: "Sign In" }),
    href: isSignedIn ? "/monks" : "/sign-in",
    nav: [
      { name: t({ mn: "Нүүр хуудас", en: "Home" }), href: "/", active: true },
      { name: t({ mn: "Үйлчилгээ", en: "Services" }), href: "/services" },
      { name: t({ mn: "Бидний давуу тал", en: "About Us" }), href: "/about" },
    ]
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center bg-[#FCF9F2]">

      {/* --- BACKGROUND IMAGE/VIDEO --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#fdfbf7] to-[#fcecd4] md:hidden" />
        <OptimizedVideo
          id="hero-video"
          src="https://res.cloudinary.com/dxoxdiuwr/video/upload/v1768133484/video_kakyvu.mp4"
          poster="https://res.cloudinary.com/dxoxdiuwr/video/upload/q_auto,f_auto,c_limit,w_1920,h_1080,so_0/video_kakyvu.jpg"
          width={1920}
          height={1080}
          className="hidden md:block w-full h-full object-cover brightness-90 md:brightness-100"
          useNative={true}
          isLCP={true}
        />
        {/* Cinematic Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent md:from-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent md:to-black/20 to-transparent" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <motion.div
        style={{ y: yContent, opacity: opacityFade }}
        className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 pt-28 md:pt-32 safari-gpu"
      >
        <div className="max-w-4xl space-y-6">

          {/* Main Title with Highlight - Accelerated for LCP */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-[1.1] tracking-tight safari-gpu"
            style={{ textRendering: 'optimizeLegibility' }}
          >
            <span className="text-[#FFB84D]">{content.highlight}</span> {content.main}
          </h1>

          {/* Subtitle */}
          <p
            className="max-w-2xl text-lg md:text-2xl text-white/90 font-medium leading-relaxed drop-shadow-md safari-gpu"
          >
            {content.desc}
          </p>

          {/* CTA Button */}
          <div
            className="pt-8 safari-gpu animate-fade-in-up delay-400"
          >
            <Link href={content.href}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 184, 77, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-4 bg-linear-to-r from-[#FFE082] to-[#FF9E66] px-10 py-5 rounded-2xl shadow-xl shadow-orange-900/20"
              >
                <span className="text-[#451a03] font-black uppercase tracking-widest text-sm">
                  {content.btn}
                </span>
                <div className="bg-[#451a03]/10 p-2 rounded-lg group-hover:bg-[#451a03]/20 transition-colors">
                  <ArrowRight size={18} className="text-[#451a03]" />
                </div>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>



      {/* Decorative veiling for the vey bottom to match Veo style */}
      <div className="absolute bottom-10 right-10 z-20 hidden md:block">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="flex items-center gap-3 text-white/40 font-bold uppercase tracking-[0.4em] text-[10px]"
        >
          <Play size={12} fill="currentColor" /> Live Sanctuary
        </motion.div>
      </div>

    </section>
  );
}