"use client";

import React from "react";
import Image from "next/image";
import { Monk } from "@/database/types";
import { useLanguage } from "../contexts/LanguageContext";
import { Heart, Star, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MonkCardProps {
    monk: Monk;
    index?: number;
    onClick?: () => void;
}

export default function MonkCard({ monk, index = 0, onClick }: MonkCardProps) {
    const { t, language: lang } = useLanguage();
    const { user } = useAuth();
    const validLang = (['mn', 'en'].includes(lang) ? lang : 'mn') as 'mn' | 'en';
    
    const [isLiked, setIsLiked] = useState(false);
    const monkId = monk._id?.toString();

    useEffect(() => {
        if (user?.wishlist && monkId) {
            setIsLiked(user.wishlist.includes(monkId));
        }
    }, [user, monkId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return alert(t({ mn: "Нэвтэрч орж хадгална уу", en: "Please sign in to save practitioners" }));
        
        const prev = isLiked;
        setIsLiked(!prev); // Optimistic update

        try {
            const res = await fetch("/api/user/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ monkId }),
            });
            if (!res.ok) setIsLiked(prev); 
        } catch (err) {
            setIsLiked(prev);
        }
    };

    const name = monk.name?.[validLang] || monk.name?.mn || monk.name?.en || "Unknown";
    const titleText = monk.title?.[validLang] || monk.title?.mn || monk.title?.en || "Үзмэрч";
    const years = monk.yearsOfExperience || 10;
    const price = (monk.services && monk.services[0]?.price) ? monk.services[0].price.toLocaleString() : "50,000";
    const isOnline = monk.isAvailable !== false;
    const rating = (monk as any).rating || "4.8";
    const reviews = (monk as any).reviews || 65;
    
    const specialty = Array.isArray(monk.specialties) && monk.specialties.length > 0
        ? monk.specialties[0]
        : (validLang === 'en' ? "Spiritual Guide" : "Засалч");

    return (
        <motion.div 
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="app-card-premium p-4 mb-4 flex gap-5 items-center !rounded-[2rem] cursor-pointer"
        >
            {/* Avatar & Status */}
            <div className="relative w-24 h-24 flex-shrink-0">
                <div className={`absolute inset-0 rounded-full ${isOnline ? "aura-pulse" : "bg-stone/50"}`} />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm z-10">
                    <Image 
                        src={monk.image || "/default-monk.jpg"} 
                        alt={name} 
                        fill
                        priority={index < 3}
                        loading={index < 3 ? undefined : "lazy"}
                        className="object-cover" 
                    />
                </div>
                {isOnline && (
                    <span className="absolute bottom-1 right-2 w-4 h-4 bg-live border-2 border-white rounded-full z-20" />
                )}
                
                {/* Heart Toggle */}
                <button 
                    onClick={toggleWishlist}
                    className={`absolute -top-1 -left-1 p-2 rounded-full transition-all duration-300 z-30 ${isLiked ? 'text-gold scale-110 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]' : 'text-earth/30 hover:text-earth'}`}
                >
                    <Heart size={20} fill={isLiked ? "currentColor" : "transparent"} strokeWidth={2.5} />
                </button>
            </div>

            {/* Info Container */}
            <div className="flex-1 min-w-0 pr-2">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-black text-ink leading-tight truncate">{name}</h3>
                    <p className="text-[11px] font-black text-gold uppercase tracking-widest opacity-80">{titleText}</p>
                </div>
                
                <p className="text-[13px] text-earth/60 mt-1 truncate">{specialty} · {years} жил</p>
                
                <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center bg-stone/50 px-2 py-0.5 rounded-full">
                        <Star size={10} className="text-gold fill-gold mr-1" />
                        <span className="text-[11px] font-black text-ink">{rating}</span>
                    </div>
                    <span className="text-[10px] text-earth/40 font-bold uppercase tracking-wider">({reviews} сэтгэгдэл)</span>
                </div>
            </div>

            {/* Right: Booking Focus */}
            <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-earth/40 uppercase tracking-widest mb-0.5">{t({ mn: "Цаг", en: "Hour" })}</p>
                    <p className="text-[15px] font-black text-ink">₮{price}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center text-white shadow-lg">
                    <ChevronRight size={20} />
                </div>
            </div>
        </motion.div>
    );
}
