"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Sparkles, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { Monk } from "@/database/types";
import MonkCard from "./MonkCard";
import { motion, AnimatePresence } from "framer-motion";

export default function MonkShowcaseClient({ 
  initialMonks, 
  hideHeader = false 
}: { 
  initialMonks: Monk[], 
  hideHeader?: boolean 
}) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = [
        { id: "All", mn: "Бүгд", en: "All" },
        { id: "Tarot", mn: "Тарот", en: "Tarot" },
        { id: "Ritual", mn: "Засал", en: "Rituals" },
        { id: "Meditation", mn: "Бясалгал", en: "Meditation" },
        { id: "Astrology", mn: "Зурхай", en: "Astrology" }
    ];

    const filteredMonks = useMemo<Monk[]>(() => {
        const query = searchQuery.toLowerCase();
        return initialMonks.filter(monk => {
            if (!monk.isAvailable && !hideHeader) return false;
            
            const matchesQuery = !query || 
                                (monk.name?.mn || "").toLowerCase().includes(query) || 
                                (monk.name?.en || "").toLowerCase().includes(query) ||
                                monk.specialties?.some(s => s.toLowerCase().includes(query));
            
            const matchesCategory = activeCategory === "All" || 
                                   monk.specialties?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
            
            return matchesQuery && matchesCategory;
        });
    }, [initialMonks, searchQuery, activeCategory, hideHeader]);

    const handleMonkClick = (monkId: string) => {
        const validLang = (['mn', 'en'].includes(language) ? language : 'mn') as 'mn' | 'en';
        router.push(`/${validLang}/monks/${monkId}`);
    };

    return (
        <div 
            className={hideHeader ? "" : "min-h-[100svh] bg-cream pb-24"} 
            style={hideHeader ? {} : { paddingTop: "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px))" }}
        >
            
            {/* Header Area */}
            {!hideHeader && (
                <div className="sticky top-[calc(var(--header-height-mobile)+env(safe-area-inset-top,0px))] bg-cream/80 backdrop-blur-xl z-30 pb-4 border-b border-stone/30">
                    <div className="px-6 pt-4 flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">
                                    {t({ mn: "Нээлттэй", en: "Available Now" })}
                                </p>
                                <h1 className="text-3xl font-black text-ink tracking-tight">
                                    {t({ mn: "Багш нар", en: "Mentors" })}
                                </h1>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone/50 flex items-center justify-center">
                                <Sparkles size={22} className="text-gold" />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth/50 group-focus-within:text-gold transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder={t({ mn: "Нэр, чадвараар хайх...", en: "Search by name or skill..." })}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-stone/20 border border-transparent focus:border-gold/10 focus:bg-white transition-all rounded-2xl py-3.5 pl-11 pr-4 text-[15px] text-ink placeholder-earth/40 outline-none shadow-inner"
                            />
                        </div>

                        {/* Discovery Chips */}
                        <div className="app-carousel !py-0 !px-0 !gap-2 hide-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-6 py-2.5 rounded-full text-[12px] font-black transition-all whitespace-nowrap border ${
                                        activeCategory === cat.id 
                                        ? "bg-ink text-white border-ink shadow-md" 
                                        : "bg-white text-earth border-stone/60 hover:border-gold/30"
                                    }`}
                                >
                                    {t(cat)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className={hideHeader ? "px-0" : "px-5 pb-10 mt-6"}>
                <AnimatePresence mode="popLayout">
                    {filteredMonks.length > 0 ? (
                        <motion.div 
                            layout
                            className="flex flex-col"
                        >
                            {filteredMonks.map((monk) => (
                                <MonkCard 
                                    key={monk._id?.toString()} 
                                    monk={monk} 
                                    onClick={() => handleMonkClick(monk._id?.toString() || "")}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 px-10"
                        >
                            <div className="w-20 h-20 rounded-[2.5rem] bg-stone/20 flex items-center justify-center mx-auto mb-6">
                                <Filter size={32} className="text-earth/40" />
                            </div>
                            <h3 className="text-lg font-black text-ink mb-2">
                                {t({ mn: "Илэрц олдсонгүй", en: "No mentors found" })}
                            </h3>
                            <p className="text-[14px] text-earth/60">
                                {t({ mn: "Та шүүлтүүрээ өөрчлөөд үзээрэй.", en: "Try adjusting your search or filters." })}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
        </div>
    );
}
