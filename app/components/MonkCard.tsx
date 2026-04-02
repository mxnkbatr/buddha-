"use client";

import React from "react";
import Image from "next/image";
import { Monk } from "@/database/types";
import { useLanguage } from "../contexts/LanguageContext";

interface MonkCardProps {
    monk: Monk;
    onClick?: () => void;
}

export default function MonkCard({ monk, onClick }: MonkCardProps) {
    const { language: lang } = useLanguage();
    const validLang = (['mn', 'en'].includes(lang) ? lang : 'mn') as 'mn' | 'en';
    
    // Fallbacks
    const name = monk.name?.[validLang] || monk.name?.mn || monk.name?.en || "Unknown";
    const title = monk.title?.[validLang] || monk.title?.mn || monk.title?.en || "Master";
    const years = monk.yearsOfExperience || 10;
    const price = monk.isSpecial ? "88,800" : "50,000";
    const isOnline = monk.isAvailable !== false;
    
    // We'll take first 2 specialties to keep it clean in the card
    const specialties = Array.isArray(monk.specialties) 
        ? monk.specialties.slice(0, 2)
        : [];

    return (
        <div className="monk-card" onClick={onClick}>
            {/* Avatar */}
            <div className="monk-avatar">
                <Image 
                    src={monk.image || "/default-monk.jpg"} 
                    alt={name} 
                    width={56} 
                    height={56} 
                    className="rounded-2xl object-cover h-[56px] w-[56px]" 
                />
                {isOnline && (
                    <div className="online-badge" />
                )}
            </div>

            {/* Info */}
            <div className="monk-info">
                <h3 className="text-[14px] font-bold text-ink leading-tight">{name}</h3>
                <p className="text-[11px] text-earth mt-0.5 opacity-80">
                    {title} · {years} жил
                </p>
                {/* Tags */}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                    {specialties.map((s, i) => (
                        <span key={i} className="tag">{s}</span>
                    ))}
                    {specialties.length === 0 && <span className="tag">Spiritual Guide</span>}
                </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
                <span className="text-[14px] font-bold text-gold tabular-nums">
                    ₮{price}
                </span>
                <span className="text-[10px] text-earth block opacity-60">/цаг</span>
            </div>
        </div>
    );
}
