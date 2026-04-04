"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { Monk } from "@/database/types";
import MonkCard from "./MonkCard";

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

    const filteredMonks = useMemo<Monk[]>(() => {
        const query = searchQuery.toLowerCase();
        return initialMonks.filter(monk => {
            if (!monk.isAvailable) return false;
            if (!query) return true;
            const nameMatch = (monk.name?.mn || "").toLowerCase().includes(query) || 
                              (monk.name?.en || "").toLowerCase().includes(query);
            const specialtyMatch = monk.specialties?.some(s => s.toLowerCase().includes(query));
            return nameMatch || specialtyMatch;
        });
    }, [initialMonks, searchQuery]);

    const handleMonkClick = (monkId: string) => {
        const validLang = (['mn', 'en'].includes(language) ? language : 'mn') as 'mn' | 'en';
        router.push(`/${validLang}/monks/${monkId}`);
    };

    return (
        <div 
            className={hideHeader ? "" : "min-h-[100svh] bg-cream pb-24"} 
            style={hideHeader ? {} : { paddingTop: 'calc(var(--header-height-mobile) + env(safe-area-inset-top))' }}
        >
            
            {/* Header Area */}
            {!hideHeader && (
                <div className="px-5 sticky top-[calc(var(--header-height-mobile)+env(safe-area-inset-top))] ios-header z-20 pb-5">
                    <p className="section-label mt-4">
                        {t({ mn: "Өнөөдөр нээлттэй", en: "Open Today" })}
                    </p>
                    <h1 className="text-[28px] font-black text-ink mb-6">
                        {t({ mn: "Багш нар", en: "Mentors" })}
                    </h1>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth" size={18} />
                        <input 
                            type="text" 
                            placeholder={t({ mn: "Хайх...", en: "Search..." })}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-stone/50 border border-transparent focus:border-gold/30 focus:bg-white transition-colors rounded-[16px] py-3 pl-11 pr-4 text-[15px] text-ink placeholder-earth outline-none shadow-sm"
                        />
                    </div>
                </div>
            )}

            <div className={hideHeader ? "px-4" : "px-4 pb-10 mt-2"}>
                {filteredMonks.length > 0 ? (
                    <div className="flex flex-col">
                        {filteredMonks.map((monk) => (
                            <MonkCard 
                                key={monk._id?.toString()} 
                                monk={monk} 
                                onClick={() => handleMonkClick(monk._id?.toString() || "")}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-lg font-serif text-earth">
                            {t({ mn: "Хайлтанд тохирох багш олдсонгүй.", en: "No monks match your search." })}
                        </p>
                    </div>
                )}
            </div>
            
        </div>
    );
}
