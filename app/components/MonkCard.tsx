"use client";

import React from "react";
import Image from "next/image";
import { Monk } from "@/database/types";
import { useLanguage } from "../contexts/LanguageContext";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface MonkCardProps {
    monk: Monk;
    onClick?: () => void;
}

export default function MonkCard({ monk, onClick }: MonkCardProps) {
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
        if (!user) return alert("Please sign in to save practitioners");
        
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
            <div className="hs-aura-orb relative">
                <div className={`hs-aura-ring ${isOnline ? "online" : ""}`} />
                <img 
                    src={monk.image || "/default-monk.jpg"} 
                    alt={name} 
                    className="hs-practitioner-avatar" 
                />
                {isOnline && (
                    <span className="hs-online-dot" />
                )}
                
                {/* Heart Toggle */}
                <button 
                    onClick={toggleWishlist}
                    className={`absolute -top-1 -right-1 p-2 rounded-full transition-all duration-300 z-10 ${isLiked ? 'text-gold scale-110 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]' : 'text-white/80 hover:text-white'}`}
                >
                    <Heart size={18} fill={isLiked ? "currentColor" : "rgba(0,0,0,0.2)"} strokeWidth={2.5} />
                </button>
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
