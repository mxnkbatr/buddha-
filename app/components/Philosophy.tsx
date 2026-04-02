"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
    Users, Video, BookOpen, ArrowRight, UserCircle, Sparkles, 
    ShieldCheck, Calendar, MessageCircle, Star 
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
        valuesTitle: t({ mn: "Яагаад Геваbal?", en: "Why Gevabal?" }),
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
        <section className="py-32 bg-cream relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                
                {/* HEADLINE */}
                <div className="text-center mb-24">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-display mb-6 text-ink"
                    >
                        {TEXT.title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto text-secondary text-lg leading-relaxed"
                    >
                        {TEXT.subtitle}
                    </motion.p>
                </div>

                {/* FEATURE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
                    {features.map((f, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="monastery-card p-10 group hover:border-gold/30 bg-white"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center mb-8 group-hover:bg-gold/10 transition-colors text-gold">
                                {f.icon}
                            </div>
                            <h3 className="text-h2 text-ink mb-4">{t(f.title)}</h3>
                            <p className="text-body text-earth/80">
                                {t(f.desc)}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* HERO CTA CARD */}
                <div className="relative rounded-[4rem] p-12 md:p-24 text-center overflow-hidden bg-hero-bg shadow-modal">
                    {/* Background Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.15)_0%,_transparent_70%)]" />

                    <div className="relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="text-hero-title sm:text-5xl md:text-6xl font-serif font-black mb-10 text-white"
                        >
                            {TEXT.ctaTitle}
                        </motion.h2>
                        <Link href={`/${langKey}/monks`}>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="cta-button h-18 px-14 shadow-gold group"
                            >
                                <span className="text-sm uppercase tracking-[0.2em]">{TEXT.ctaButton}</span> 
                                <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                    </div>
                </div>

                {/* ADDITIONAL VALUES */}
                <div className="mt-40 max-w-5xl mx-auto px-6">
                    <h2 className="text-display text-ink text-center mb-20">{TEXT.valuesTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {[
                            { icon: UserCircle, title: TEXT.value1Title, desc: TEXT.value1Body },
                            { icon: Sparkles, title: TEXT.value2Title, desc: TEXT.value2Body },
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="monastery-card p-12 bg-white border-border/50 group hover:border-gold/30 transition-all duration-700"
                            >
                                <div className="w-20 h-20 rounded-3xl bg-stone/5 flex items-center justify-center mb-10 group-hover:bg-gold/10 transition-colors">
                                    <item.icon className="w-10 h-10 text-gold" />
                                </div>
                                <h3 className="text-h2 text-ink mb-6">{item.title}</h3>
                                <p className="text-secondary leading-relaxed text-lg">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* SEE ALL BUTTON */}
                <div className="mt-20 text-center">
                    <Link href={`/${langKey}/monks`}>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cta-button px-10 h-16 shadow-gold group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm uppercase tracking-[0.2em]">{TEXT.seeAll}</span>
                                <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                            </div>
                        </motion.button>
                    </Link>
                </div>

            </div>
        </section>
    );
}
