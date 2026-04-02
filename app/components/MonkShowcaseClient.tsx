"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { Monk } from "@/database/types";
import MonkCard from "./MonkCard";

export default function MonkShowcaseClient({ initialMonks }: { initialMonks: Monk[] }) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [wasm, setWasm] = useState<any>(null);

    // Initialize WASM for rust-based filtering (optional performance boost)
    useEffect(() => {
        import("rust-modules").then(async mod => {
            if (mod.default) {
                await mod.default();
            }
            setWasm(mod);
        }).catch(err => console.error("WASM load failed", err));
    }, []);

    const filteredMonks = useMemo<Monk[]>(() => {
        const query = searchQuery.toLowerCase();
        
        // Simple JS fallback filtering for search
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
        <div className="min-h-[100svh] bg-cream pb-24" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 60px)' }}>
            
            {/* Header Area */}
            <div className="px-6 pt-4 pb-4 sticky top-[env(safe-area-inset-top,44px)] z-20 bg-cream/90 backdrop-blur-md">
                <p className="text-saffron font-bold text-sm tracking-wide lowercase mb-1">
                    {t({ mn: "Өнөөдөр нээлттэй", en: "Open Today" })}
                </p>
                <h1 className="text-3xl font-black text-ink mb-6">
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

            {/* List Area */}
            <div className="px-4 pb-10 mt-2">
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
