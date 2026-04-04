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
    const { t, language: lang } = useLanguage();
    const validLang = (['mn', 'en'].includes(lang) ? lang : 'mn') as 'mn' | 'en';
    
    // Fallbacks
    const name = monk.name?.[validLang] || monk.name?.mn || monk.name?.en || "Unknown";
    const title = monk.title?.[validLang] || monk.title?.mn || monk.title?.en || "Үзмэрч";
    const years = monk.yearsOfExperience || 10;
    const price = (monk.services && monk.services[0]?.price) ? monk.services[0].price.toLocaleString() : "50,000";
    const isOnline = monk.isAvailable !== false;
    const rating = (monk as any).rating || "4.8";
    const reviews = (monk as any).reviews || 65;
    
    // We'll take the first specialty
    const specialty = Array.isArray(monk.specialties) && monk.specialties.length > 0
        ? monk.specialties[0]
        : (validLang === 'en' ? "Spiritual Guide" : "Засалч");

    return (
        <div className="hs-practitioner-card cursor-pointer mb-3" onClick={onClick}>
            {/* AuraOrb Avatar */}
            <div className="hs-aura-orb">
                <div className={`hs-aura-ring ${isOnline ? "online" : ""}`} />
                <img 
                    src={monk.image || "/default-monk.jpg"} 
                    alt={name} 
                    className="hs-practitioner-avatar" 
                />
                {isOnline && (
                    <span className="hs-online-dot" />
                )}
            </div>

            {/* Info */}
            <div className="hs-practitioner-info">
                <h3 className="hs-practitioner-name">{name}</h3>
                <p className="hs-practitioner-speciality">{specialty} · {years} жил</p>
                <div className="hs-practitioner-rating">
                  <span className="hs-star">★</span>
                  <span className="hs-rating-num">{rating}</span>
                  <span className="hs-review-count">({reviews})</span>
                </div>
            </div>

            {/* Right: Price + CTA */}
            <div className="hs-practitioner-right">
                <p className="hs-practitioner-price">₮{price}<span>/цаг</span></p>
                <div className="luminous-btn-sm hs-book-btn inline-flex items-center justify-center">
                  {t({ mn: "Захиалах", en: "Book" })}
                </div>
            </div>
        </div>
    );
}
