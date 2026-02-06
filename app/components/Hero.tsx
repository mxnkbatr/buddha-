"use client";

import React from "react";
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
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-background">

      {/* --- BACKGROUND VIDEO --- */}
      <div className="absolute inset-0 z-0">
        <OptimizedVideo
          id="hero-video"
          src="https://res.cloudinary.com/dxoxdiuwr/video/upload/v1768133484/video_kakyvu.mp4"
          poster="https://res.cloudinary.com/dxoxdiuwr/video/upload/q_auto,f_auto,c_limit,w_1920,h_1080,so_0/video_kakyvu.jpg"
          width={1920}
          height={1080}
          className="w-full h-full object-cover brightness-[0.85]"
          useNative={true}
          isLCP={true}
        />
        {/* Soft Overlay for readability */}
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <motion.div
        style={{ y: yContent, opacity: opacityFade }}
        className="relative z-10 container mx-auto px-6 md:px-12 text-center"
      >
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
          >
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-white/90">
              Gevabal - Online Sanctuary
            </span>
          </motion.div>

          {/* Main Title */}
          <h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-tight tracking-tight drop-shadow-sm"
          >
            <span className="text-primary-light">{content.highlight}</span> <br className="hidden md:block"/>
            {content.main}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed font-light">
            {content.desc}
          </p>

          {/* CTA Button */}
          <div className="pt-6">
            <Link href={content.href}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="zen-button zen-button-primary text-base px-8 py-4 shadow-xl shadow-black/20"
              >
                <span>{content.btn}</span>
                <ArrowRight size={18} className="ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Live Indicator */}
      <div className="absolute bottom-10 right-10 z-20 hidden md:block">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </motion.div>
          <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">
            Sanctuary Live
          </span>
        </div>
      </div>

    </section>
  );
}