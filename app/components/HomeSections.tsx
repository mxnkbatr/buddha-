"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../lib/dateUtils";
import { motion } from "framer-motion";
import { Star, ArrowRight, UserCircle } from "lucide-react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

const MOCK_BLOGS = [
  {
    id: "b1",
    title: { mn: "Ухаарлын эрчим: Дотоод амар тайвны нууц", en: "Power of Awareness: The Secret of Inner Peace" },
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    date: "2026-03-28",
    author: { mn: "Лам Тэнзин", en: "Lama Tenzin" },
  },
  {
    id: "b2",
    title: { mn: "Бясалгалаар стрессийг даван туулах арга", en: "Overcoming Stress Through Meditation" },
    cover: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80",
    date: "2026-03-22",
    author: { mn: "Болд гэлэн", en: "Gelen Bold" },
  },
  {
    id: "b3",
    title: { mn: "Тарог судлал: Амьдралын зам", en: "Tarot Studies: The Path of Life" },
    cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
    date: "2026-03-15",
    author: { mn: "Сарнай эгч", en: "Sis Sarnai" },
  },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────

export default function HomeSections({ locale, blogs, monks = [] }: { locale: string; blogs?: any[], monks?: any[] }) {
  const { t, language: lang } = useLanguage();
  const validLang = (["mn", "en"].includes(lang) ? lang : "mn") as "mn" | "en";

  const displayBlogs = blogs && blogs.length > 0 ? blogs.slice(0, 5) : MOCK_BLOGS;
  const displayMonks = monks.filter((m) => !m.name?.mn?.includes("Буянцог")).slice(0, 5);

  return (
    <div className="home-sections-wrapper !bg-white">
      {/* ── SECTION 2: LATEST NEWS CAROUSEL ──────────────────────────────────── */}
      <section className="app-section">
        <div className="app-section-header flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-ink tracking-tight">
                {t({ mn: "Шинэ мэдээ", en: "Latest News" })}
            </h2>
            <p className="text-xs text-earth/50">Өнөөдрийн онцлох мэдээлэл</p>
          </div>
          <Link href={`/${locale}/blog`} className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">
            {t({ mn: "Бүгдийг харах", en: "See all" })}
          </Link>
        </div>

        <div className="app-carousel hide-scrollbar md:grid md:grid-cols-3 md:px-6">
          {displayBlogs.map((blog) => (
            <motion.div key={blog.id} whileTap={{ scale: 0.98 }} className="app-card-premium !rounded-[2rem]">
                <Link href={`/${locale}/blog/${blog.id}`} className="block">
                    <div className="relative h-44 overflow-hidden">
                        <img
                        src={blog.cover || "/default-avatar.png"}
                        alt={blog.title?.[validLang] || blog.title?.mn || "Blog"}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-ink uppercase tracking-wider">
                           {formatDate(blog.date, validLang)}
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-2">
                           {blog.author ? (typeof blog.author === 'string' ? blog.author : blog.author[validLang] || "Багш") : blog.authorName || "Багш"}
                        </p>
                        <h3 className="text-base font-black text-ink leading-snug line-clamp-2">
                            {blog.title?.[validLang] || blog.title?.mn || "Мэдээ"}
                        </h3>
                    </div>
                </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: TOP PRACTITIONERS ─────────────────────────────── */}
      <section className="app-section !pt-0">
        <div className="app-section-header">
           <h2 className="text-2xl font-black text-ink tracking-tight">
             {t({ mn: "Шилдэг үзмэрчид", en: "Top Practitioners" })}
           </h2>
           <p className="text-xs text-earth/50">Мэргэжлийн түвшний зөвлөгөө</p>
        </div>

        <div className="px-5 space-y-4 md:grid md:grid-cols-2 md:space-y-0 md:gap-6 md:px-6">
          {displayMonks.map((p) => {
            const monkId = p._id || p.id;
            const monkName = p.name?.[validLang] || p.name?.mn || "";
            const isOnline = p.isAvailable;
            const monkExp = p.yearsOfExperience ? `${p.yearsOfExperience} жил` : "10 жил";
            const specialty = (p.specialties && p.specialties[0]) ? p.specialties[0] : (validLang === 'en' ? "Spiritual Guide" : "Засалч");
            const price = (p.services && p.services[0]?.price) ? p.services[0].price.toLocaleString() : "50,000";
            const rating = p.rating || "4.8";
            const reviews = p.reviews || 65;

            return (
              <motion.div key={monkId} whileTap={{ scale: 0.98 }}>
                <Link href={`/${locale}/monks/${monkId}`} className="app-card-premium p-4 flex gap-4 items-center !rounded-[1.8rem]">
                    {/* AuraOrb Avatar */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <div className={`absolute inset-0 rounded-full ${isOnline ? "aura-pulse" : "bg-stone/50"}`} />
                        <img
                        src={p.image || "/default-monk.jpg"}
                        alt={monkName}
                        className="relative w-full h-full rounded-full object-cover z-10 border-2 border-white shadow-sm"
                        />
                        {isOnline ? (
                             <span className="absolute bottom-1 right-1 w-4 h-4 bg-live border-2 border-white rounded-full z-20" />
                        ) : (
                             <span className="absolute bottom-1 right-1 w-4 h-4 bg-earth/40 border-2 border-white rounded-full z-20" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-base font-black text-ink mb-1 truncate">{monkName}</h3>
                        <p className="text-[11px] text-earth/60 mb-2 truncate">{specialty} · {monkExp}</p>
                        <div className="flex items-center gap-1">
                            <Star size={10} className="text-gold fill-gold" />
                            <span className="text-[11px] font-black text-ink">{rating}</span>
                            <span className="text-[10px] text-earth/40">({reviews})</span>
                        </div>
                    </div>

                    {/* Right: Price + CTA */}
                    <div className="text-right">
                        <p className="text-sm font-black text-ink mb-2 leading-none whitespace-nowrap">₮{price}</p>
                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white mx-auto ml-auto">
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </Link>
              </motion.div>
            )})}
        </div>
      </section>

      {/* --- BOT NAVIGATION SPACER --- */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
