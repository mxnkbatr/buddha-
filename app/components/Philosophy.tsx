"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
    Users, Video, BookOpen, ArrowRight, UserCircle, Sparkles, 
     MessageCircle, Star 
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function PhilosophySection() {
    const { t, language } = useLanguage();
    const langKey = language as "mn" | "en";

    const TEXT = {
        title: t({ mn: "Бидний Үнэт Зүйл", en: "Our Values" }),
        subtitle: t({ 
            mn: "Уламжлалт өв соёлыг технологийн дэвшлээр дамжуулан түгээж, таны сэтгэлгээнд амар амгаланг авчирна.", 
            en: "Spreading ancient heritage through modern innovation to bring peace to your mind." 
        }),
        seeAll: t({ mn: "Бүгдийг үзэх", en: "See All" }),
        valuesTitle: t({ mn: "Яагаад Гэвабал?", en: "Why Gevabal?" }),
        value1Title: t({ mn: "Мэргэжлийн Багш нар", en: "Expert Masters" }),
        value1Body: t({ mn: "Олон жилийн туршлагатай, шашны гүн ухаанд мэргэшсэн багш нар.", en: "Experienced masters specialized in spiritual philosophy." }),
        value2Title: t({ mn: "Онлайн Засал", en: "Live Rituals" }),
        value2Body: t({ mn: "Гэрээсээ гаралгүйгээр засал номоо уншуулж, шууд холбогдох боломж.", en: "Attend rituals and connect live from the comfort of your home." }),
        ctaTitle: t({ mn: "Амар амгаланг мэдэр", en: "Find Your Inner Peace" }),
        ctaButton: t({ mn: "Цаг захиалах", en: "Book a Session" })
    };

    const features = [
        {
            icon: <Users className="w-8 h-8" />,
            title: { mn: "Мэргэжлийн Багш нар", en: "Expert Masters" },
            desc: { mn: "Олон жилийн туршлагатай, шашны гүн ухаанд мэргэшсэн багш нар.", en: "Experienced masters specialized in spiritual philosophy." }
        },
        {
            icon: <Video className="w-8 h-8" />,
            title: { mn: "Онлайн Засал", en: "Live Rituals" },
            desc: { mn: "Гэрээсээ гаралгүйгээр засал номоо уншуулж, шууд холбогдох боломж.", en: "Attend rituals and connect live from the comfort of your home." }
        },
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: { mn: "Өв Соёл", en: "Ancient Wisdom" },
            desc: { mn: "Монголчуудын уламжлалт өв соёл, сургаалыг орчин үеийн хэлбэрээр.", en: "Traditional Mongolian heritage and teachings in a modern format." }
        }
    ];

    return (
        <section className="app-section">
            <div className="container mx-auto max-w-7xl relative z-10">
                
                {/* HEADLINE */}
                <div className="app-section-header text-center px-6">
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black text-ink mb-4 tracking-tight"
                    >
                        {TEXT.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-xl mx-auto text-earth/70 text-sm leading-relaxed"
                    >
                        {TEXT.subtitle}
                    </motion.p>
                </div>

                {/* FEATURE CAROUSEL / GRID */}
                <div className="app-carousel hide-scrollbar md:grid md:grid-cols-3 md:gap-8 md:px-6 md:mb-24">
                    {features.map((f, i) => (
                        <motion.div 
                            key={i} 
                            whileTap={{ scale: 0.98 }}
                            className="app-card-premium p-8 flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center mb-6 text-gold group-hover:bg-gold/10 transition-colors">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-black text-ink mb-3">{t(f.title)}</h3>
                            <p className="text-xs text-earth/80 leading-relaxed">
                                {t(f.desc)}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* ADDITIONAL VALUES SECTION */}
                <div className="mt-20">
                     <div className="app-section-header">
                        <h2 className="text-2xl font-black text-ink">{TEXT.valuesTitle}</h2>
                    </div>
                    
                    <div className="app-carousel hide-scrollbar md:grid md:grid-cols-2 md:gap-8 md:px-6">
                        {[
                            { icon: UserCircle, title: TEXT.value1Title, desc: TEXT.value1Body },
                            { icon: Sparkles, title: TEXT.value2Title, desc: TEXT.value2Body },
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                className="app-card-premium p-8"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-stone/40 flex items-center justify-center mb-6">
                                    <item.icon className="w-7 h-7 text-gold" />
                                </div>
                                <h3 className="text-lg font-black text-ink mb-3">{item.title}</h3>
                                <p className="text-sm text-earth/70 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA BANNER - REFINED FOR APP LOOK */}
                <div className="container px-4 mt-20">
                    <div className="relative rounded-[2.5rem] p-10 text-center overflow-hidden bg-hero-bg shadow-xl">
                        <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.15)_0%,_transparent_70%)]" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-serif font-black mb-8 text-white leading-tight">
                                {TEXT.ctaTitle}
                            </h2>
                            <Link href={`/${langKey}/monks`}>
                                <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gold text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest shadow-gold"
                                >
                                    {TEXT.ctaButton}
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
