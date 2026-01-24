"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
   ArrowUp,
   Mail,
   Instagram,
   Facebook,
   Youtube,
   MapPin,
   Phone,
   Sun,
   Flower,
   Infinity as InfinityIcon,
   Orbit,
   Star
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function GoldenNirvanaFooter() {
   const { t } = useLanguage();
   const pathname = usePathname();

   useEffect(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
   }, [pathname]);

   const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   const isDark = false;

   const content = {
      newsletterTag: t({ mn: "Одот тамга", en: "Zodiac Alignment" }),
      newsletterTitle: isDark ? t({ mn: "Одот тэнгэрийн хэлхээ", en: "Voices of the Nebula" }) : t({ mn: "Мэдээг цаг алдалгүй ав", en: "Receive the news without delay" }),
      newsletterDesc: t({
         mn: "Та шинээр нэмэгдэж буй багш нарын мэдээлэл, засал номын цаг болон зөвлөгөөг тогтмол имэйлээрээ хүлээн авахыг хүсвэл бүртгүүлээрэй.",
         en: "If you would like to regularly receive information about newly added teachers, correction class schedules, and guidance via email, please register."
      }),
      emailPlaceholder: t({ mn: "Таны цахим хаяг...", en: "Your cosmic address..." }),
      btnJoin: isDark ? t({ mn: "Ододтой нэгдэх", en: "Align Stars" }) : t({ mn: "Нэгдэх", en: "Join Circle" }),
      monastery: isDark ? t({ mn: "Уламжлалт зам", en: "Traditional Path" }) : t({ mn: "Хийд", en: "Monastery" }),
      aboutDesc: t({
         mn: "Бид уламжлалт засал ном, зурхай, зөвлөгөөг орчин үеийн технологийн тусламжтайгаар таны байгаа газарт хүргэж байна. Мянган жилийн соёл, нэг товшилтын зайд.",
         en: "We bring traditional healing, astrology, and spiritual guidance to your location with the help of modern technology. A thousand years of culture, just a click away."
      }),
      location: t({ mn: "Улаанбаатар, Монгол", en: "Ulaanbaatar, Mongolia" }),
      peace: t({ mn: "Энэрэл", en: "Compassion" }),
      gandantitle: t({ mn: "Гэвабaл", en: "Gevabal" }),
   };

   const theme = isDark ? {
      bg: "bg-[#05051a]",
      textMain: "text-cyan-50",
      textSub: "text-cyan-300",
      accent: "text-[#C72075]",
      border: "border-cyan-400/20",
      altarBg: "bg-[#0C164F]/60",
      altarBorder: "border-cyan-400/10",
      btn: "bg-gradient-to-r from-[#C72075] to-[#7B337D] text-white shadow-[#C72075]/20",
      mandala: "text-cyan-500",
   } : {
      bg: "bg-[#FFFBEB]",
      textMain: "text-[#451a03]",
      textSub: "text-[#92400E]",
      accent: "text-[#F59E0B]",
      border: "border-amber-200",
      altarBg: "bg-white/80",
      altarBorder: "border-amber-200",
      btn: "bg-[#78350F] text-[#FDE68A]",
      mandala: "text-[#B45309]",
   };

   return (
      <footer className={`relative w-full transition-colors duration-1000 overflow-hidden pt-40 pb-12 font-sans ${theme.bg} ${theme.textMain}`}>

         {/* ================= COSMIC ATMOSPHERE ================= */}
         <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? "bg-gradient-to-b from-[#0C164F] via-[#05051a] to-black opacity-100" : "bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7] to-[#F59E0B] opacity-100"
               }`} />

            {/* Watercolor Nebula Clouds */}
            {isDark && (
               <>
                  <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full blur-[140px] opacity-10 bg-[#C72075]" />
                  <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full blur-[140px] opacity-10 bg-[#2E1B49]" />
               </>
            )}

            {/* Spinning Zodiac Map */}
            <div className="absolute bottom-[-15%] left-[-5%] w-[1000px] h-[1000px] opacity-[0.05] animate-[spin_300s_linear_infinite] origin-center">
               <svg viewBox="0 0 100 100" className={`w-full h-full ${theme.mandala}`}>
                  <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.05" fill="none" />
                  <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 2" fill="none" />
                  {[...Array(12)].map((_, i) => (
                     <line key={i} x1="50" y1="50" x2={(50 + 48 * Math.cos(i * Math.PI / 6)).toFixed(4)} y2={(50 + 48 * Math.sin(i * Math.PI / 6)).toFixed(4)} stroke="currentColor" strokeWidth="0.05" />
                  ))}
               </svg>
            </div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
         </div>

         {/* ================= MAIN CONTENT ================= */}
         <div className="relative z-10 container mx-auto px-6 lg:px-12">

            {/* --- NEWSLETTER NEBULA --- */}
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className={`relative max-w-5xl mx-auto mb-32 p-[1px] rounded-[4rem] transition-all duration-1000 ${isDark ? "bg-gradient-to-r from-[#C72075]/40 via-cyan-500/40 to-[#7B337D]/40 shadow-[0_0_80px_rgba(199,32,117,0.15)]" : "bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#FDE68A]"
                  }`}
            >
               <div className={`${theme.altarBg} backdrop-blur-3xl rounded-[3.9rem] px-8 py-16 md:px-16 md:py-24 text-center border ${theme.altarBorder}`}>

                  <div className={`inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border transition-colors duration-1000 ${isDark ? "bg-cyan-950/40 border-cyan-400/40 text-cyan-300" : "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]"
                     }`}>
                     {isDark ? <Orbit size={14} className="animate-pulse" /> : <Flower size={14} className="animate-spin-slow" />}
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">{content.newsletterTag}</span>
                  </div>

                  <h2 className="text-5xl md:text-7xl font-serif font-black mb-8 tracking-tighter drop-shadow-lg">
                     {content.newsletterTitle}
                  </h2>

                  <p className={`mb-12 max-w-xl mx-auto leading-relaxed text-lg font-medium transition-colors ${isDark ? 'text-cyan-50/70' : 'text-[#92400E]/80'}`}>
                     {content.newsletterDesc}
                  </p>

                  <form className="flex flex-col md:flex-row gap-5 max-w-xl mx-auto relative group">
                     <div className="relative flex-1">
                        <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-cyan-400' : 'text-[#D97706]'}`} size={22} />
                        <input
                           type="email"
                           placeholder={content.emailPlaceholder}
                           className={`w-full pl-14 pr-8 py-5 rounded-2xl outline-none transition-all duration-500 font-medium ${isDark
                              ? "bg-black/40 border-cyan-800 text-white placeholder-cyan-400/30 focus:border-cyan-400"
                              : "bg-white border-[#FDE68A] text-[#451a03] placeholder-[#B45309]/40 focus:border-[#F59E0B]"
                              } border`}
                        />
                     </div>
                     <button 
                        type="submit"
                        aria-label={content.btnJoin}
                        className={`group relative overflow-hidden px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl ${theme.btn}`}
                     >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                           {content.btnJoin} <ArrowUp size={18} className="rotate-45 group-hover:rotate-90 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     </button>
                  </form>
               </div>

               {/* Totem Icon */}
               <div className={`absolute -top-8 left-1/2 -translate-x-1/2 p-4 rounded-full border-4 shadow-2xl transition-all duration-1000 ${isDark ? "bg-[#05051a] border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(80,242,206,0.3)]" : "bg-[#FFFBEB] border-[#FDE68A] text-[#F59E0B]"
                  }`}>
                  {isDark ? <Star size={36} fill="currentColor" className="animate-pulse" /> : <Sun size={36} className="animate-spin-slow" />}
               </div>
            </motion.div>


            {/* --- LINKS GRID --- */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-16 border-t pt-20 ${isDark ? 'border-cyan-400/10' : 'border-[#F59E0B]/30'}`}>

               {/* BRANDING */}
               <div className="md:col-span-5 flex flex-col items-start gap-8">
                  <Link href="/" className="flex items-center gap-4 group">
                     <div className={`relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 ${isDark ? "shadow-[#C72075]/30" : "shadow-amber-900/20"}`}>
                        <Image src="/logo.png" alt="Gevabal Logo" width={56} height={56} className="object-cover w-full h-full" />
                     </div>
                     <div className="flex flex-col">
                        <span className="font-serif font-black text-3xl leading-none tracking-tight">
                           {content.gandantitle}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-[0.4em] transition-colors ${isDark ? 'text-cyan-400' : 'text-[#92400E]'}`}>
                           {content.monastery}
                        </span>
                     </div>
                  </Link>

                  <p className={`text-lg leading-relaxed font-medium transition-colors opacity-80 ${isDark ? 'text-cyan-50' : 'text-[#78350F]'}`}>
                     {content.aboutDesc}
                  </p>

                  {/* Social Stars */}
                  <div className="flex gap-6">
                    {[
                      { Icon: Facebook, label: "Facebook" },
                      { Icon: Instagram, label: "Instagram" },
                      { Icon: Youtube, label: "Youtube" }
                    ].map(({ Icon, label }, i) => (
                        <a key={i} href="#" aria-label={label} className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 hover:-translate-y-2 ${isDark ? "border-cyan-500/30 text-cyan-300 hover:bg-[#C72075] hover:text-white" : "border-[#D97706]/30 text-[#78350F] hover:bg-[#F59E0B] hover:text-white"
                           }`}>
                           <Icon size={20} />
                        </a>
                     ))}
                  </div>
               </div>

               {/* LINKS */}
               <div className="md:col-span-3">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400 shadow-[0_0_8px_#50F2CE]' : 'bg-amber-500'}`} /> The Path
                  </h3>
                  <ul className="space-y-5">
                     {['Zodiac Chart', 'Astrology', 'Rituals', 'Mentors Archive', 'Community', 'How to Use'].map((name) => (
                        <li key={name}>
                           <Link href={name === 'How to Use' ? '/guide' : '#'} className="group flex items-center gap-3 opacity-60 hover:opacity-100 transition-all">
                              <span className={`h-[1px] w-0 group-hover:w-6 transition-all duration-500 ${isDark ? 'bg-cyan-400' : 'bg-amber-600'}`} />
                              <span className="font-medium">{name}</span>
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* CONTACT */}
               <div className="md:col-span-4 flex justify-between">
                  <div className="space-y-8">
                     <div className="flex items-start gap-4">
                        <MapPin className={`mt-1 transition-colors ${isDark ? 'text-cyan-400' : 'text-[#D97706]'}`} size={20} />
                        <span className="font-medium opacity-80 leading-relaxed">{content.location}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <Phone className={`transition-colors ${isDark ? 'text-cyan-400' : 'text-[#D97706]'}`} size={20} />
                        <span className="font-medium opacity-80">+976 11 1234 5678</span>
                     </div>
                  </div>

                  {/* Vertical Calligraphy Element */}
                  <div className="hidden lg:block opacity-10 hover:opacity-100 transition-opacity duration-1000">
                     <span style={{ writingMode: 'vertical-rl' }} className="text-6xl font-serif font-black tracking-widest uppercase">
                        {content.peace}
                     </span>
                  </div>
               </div>
            </div>

            {/* --- BOTTOM BAR --- */}
            <div className={`mt-24 pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-8 ${isDark ? 'border-cyan-400/10' : 'border-[#78350F]/10'}`}>

               <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                  © {new Date().getFullYear()} {content.gandantitle} {content.monastery}. All Cosmic Karma Reserved.
               </p>

               <div className="flex items-center gap-12">
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">Void Policy</Link>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">Terms</Link>

                  {/* ASCENSION BUTTON */}
                  <button
                     onClick={scrollToTop}
                     aria-label={t({ mn: "Дээшээ буцах", en: "Scroll to top" })}
                     className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-700 hover:-translate-y-3 ${isDark ? "bg-gradient-to-t from-[#C72075] to-[#7B337D] shadow-[0_0_30px_rgba(199,32,117,0.5)]" : "bg-gradient-to-t from-[#B45309] to-[#F59E0B] shadow-xl"
                        } text-white`}
                  >
                     {isDark ? <Orbit size={24} className="group-hover:rotate-180 transition-transform duration-700" /> : <Sun size={24} className="group-hover:rotate-180 transition-transform duration-700" />}

                     <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isDark ? 'bg-cyan-400' : 'bg-white'}`} />
                  </button>
               </div>
            </div>

         </div>
      </footer>
   );
}