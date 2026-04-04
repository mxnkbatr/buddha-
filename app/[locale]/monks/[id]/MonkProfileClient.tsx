"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Star, Calendar, Award, MessageCircle, Share2, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Monk } from "@/database/types";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function MonkProfileClient() {
    const params = useParams();
    const router = useRouter();
    const monkId = Array.isArray(params.id) ? params.id[0] : params.id;

    const { language: lang, t } = useLanguage();
    const { user } = useAuth();
    const isSignedIn = !!user;

    const [monk, setMonk] = useState<any | null>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!monkId) return;
            try {
                setLoading(true);
                const mRes = await fetch(`/api/monks/${monkId}`);
                const mData = await mRes.json();
                setMonk(mData);

                const sRes = await fetch('/api/services');
                const sData = await sRes.json();

                const isSpecial = mData.isSpecial === true;
                const services = isSpecial
                    ? sData 
                    : sData.filter((s: any) => {
                        const isDirectMatch = s.monkId === monkId;
                        const isReferenced = Array.isArray(mData.services) && mData.services.some((ms: any) => {
                            const msId = typeof ms === 'string' ? ms : (ms.id || ms._id);
                            return msId === s._id || msId === s.id;
                        });
                        return isDirectMatch || isReferenced || s.isUniversal;
                    });

                const uniqueServicesMap = new Map();
                services.forEach((s: any) => {
                    const key = s.name?.[lang] || s.title?.[lang] || s.name?.mn || s.name?.en || s.id;
                    if (!uniqueServicesMap.has(key)) {
                        uniqueServicesMap.set(key, s);
                    }
                });
                
                const uniqueServices = Array.from(uniqueServicesMap.values());

                const formatted = uniqueServices.map((s: any) => ({
                    ...s,
                    price: s.price || (isSpecial ? 88800 : 50000),
                    duration: s.duration || "60 мин"
                }));
                setAvailableServices(formatted);
                if (formatted.length > 0) {
                    setSelectedServiceId(formatted[0]._id || formatted[0].id);
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        }
        loadData();
    }, [monkId, lang]);

    if (loading || !monk) return (
        <div className="h-[100svh] flex items-center justify-center bg-cream">
            <div className="w-10 h-10 rounded-2xl border-4 border-gold border-t-transparent animate-spin" />
        </div>
    );

    const monkName = monk.name[lang as 'mn' | 'en'] || monk.name.mn || monk.name.en || "";
    const monkTitle = monk.title?.[lang as 'mn' | 'en'] || monk.title?.mn || "Багш";
    const monkBio = monk.bio?.[lang as 'mn' | 'en'] || monk.bio?.mn || "";

    const handleBook = (srvId?: string) => {
        const id = srvId || selectedServiceId || (availableServices[0]?._id || availableServices[0]?.id);
        if (!id) return;
        
        if (isSignedIn) {
            router.push(`/${lang}/booking/${id}?monkId=${monkId}`);
        } else {
            router.push(`/${lang}/sign-in`);
        }
    };

    return (
        <div className="min-h-[100svh] bg-cream flex flex-col hide-scrollbar overflow-x-hidden">

            {/* ── IMMERSIVE HEADER ── */}
            <div className="relative h-[65svh] shrink-0 overflow-hidden">
                <Image
                    src={monk.image || "/default-monk.jpg"}
                    alt={monkName}
                    fill
                    className="object-cover"
                    priority
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent z-10" />
                
                {/* Controls */}
                <div 
                    className="absolute z-20 w-full px-5 flex justify-between items-center"
                    style={{ top: "max(env(safe-area-inset-top, 0px), 16px)" }}
                >
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                        <ChevronLeft className="text-white" size={24} />
                    </button>
                    <button className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <Share2 size={18} className="text-white" />
                    </button>
                </div>

                {/* Identity Overlap */}
                <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-6 mt-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-white">
                                <img src={monk.image || "/default-monk.jpg"} className="w-full h-full object-cover" />
                            </div>
                            {monk.isAvailable !== false && (
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-live border-4 border-white shadow-md aura-pulse" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-ink tracking-tight mb-1">{monkName}</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-[14px] font-black text-gold uppercase tracking-widest">{monkTitle}</p>
                            <span className="w-1 h-1 rounded-full bg-stone" />
                            <div className="flex items-center gap-1">
                                <ShieldCheck size={14} className="text-live" />
                                <span className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">{t({ mn: "Баталгаажсан", en: "Verified" })}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── CONTENT SECTION ── */}
            <div className="relative z-20 px-6 pt-6 pb-32">
                
                {/* Stats Widgets */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-4 mb-10"
                >
                    {[
                        { icon: <Calendar size={18} />, val: monk.totalBookings || "247", label: t({ mn: "Тус", en: "Helps" }) },
                        { icon: <Star size={18} />, val: "4.9", label: t({ mn: "Үнэлгээ", en: "Rating" }) },
                        { icon: <Award size={18} />, val: `${monk.yearsOfExperience || 10}`, label: t({ mn: "Жил", en: "Years" }) },
                    ].map((s, i) => (
                        <div key={i} className="flex-1 app-card-premium p-4 flex flex-col items-center justify-center !rounded-[2.5rem] border border-stone-100">
                            <div className="text-gold mb-2 opacity-80">{s.icon}</div>
                            <div className="text-[20px] font-black text-ink leading-tight">{s.val}</div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-earth/50 mt-1">{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Bio Block */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <h2 className="text-[11px] font-black text-gold uppercase tracking-[0.2em] mb-4">
                        {t({ mn: "Товч танилцуулга", en: "Profile bio" })}
                    </h2>
                    <p className="text-[16px] font-medium text-earth/80 leading-relaxed font-serif">
                        {monkBio}
                    </p>
                </motion.div>

                {/* Services Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-[11px] font-black text-gold uppercase tracking-[0.2em] mb-5">
                        {t({ mn: "Санал болгож буй үйлчилгээ", en: "Available Rituals" })}
                    </h2>
                    <div className="space-y-4">
                        {availableServices.map((svc: any) => {
                            const isSelected = selectedServiceId === (svc._id || svc.id);
                            return (
                                <motion.div 
                                    key={svc._id || svc.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedServiceId(svc._id || svc.id)}
                                    className={`app-card-premium p-6 flex items-center justify-between !rounded-[2.5rem] cursor-pointer transition-all border-2 ${
                                        isSelected ? 'border-gold bg-gold/5 shadow-gold/10' : 'border-stone/20 bg-white'
                                    }`}
                                >
                                    <div className="flex gap-5 items-center">
                                        <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center transition-colors ${isSelected ? 'bg-gold text-white shadow-gold/20' : 'bg-stone/50 text-earth'}`}>
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[16px] font-black text-ink leading-tight">
                                                {svc.name?.[lang as 'mn' | 'en'] || svc.name?.mn || svc.title?.mn || "Ritual"}
                                            </p>
                                            <p className="text-[13px] font-bold text-earth/40 uppercase tracking-widest mt-1.5">{svc.duration || "60 min"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[18px] font-black text-ink">₮{svc.price.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* ── STICKY ACTIONS ── */}
            <div
                className="fixed left-0 right-0 bottom-0 px-6 bg-white/80 backdrop-blur-3xl border-t border-stone/30 z-40 flex items-center gap-4"
                style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)", paddingTop: 16 }}
            >
                {/* Chat FAB */}
                <button 
                    onClick={() => router.push(`/${lang}/messenger?monkId=${monkId}`)}
                    className="w-16 h-16 rounded-[2.2rem] bg-stone flex items-center justify-center text-ink active:scale-90 transition-transform shrink-0"
                >
                    <MessageCircle size={28} />
                </button>
                
                <button
                    onClick={() => handleBook()}
                    className="flex-1 h-16 bg-ink text-white font-black text-[16px] rounded-[2.2rem] active:scale-95 transition-all shadow-xl shadow-ink/20"
                >
                    {!isSignedIn ? t({ mn: "Нэвтэрч орох", en: "Sign in to Book" }) : t({ mn: "Цаг захиалах", en: "Book Session" })}
                </button>
            </div>
        </div>
    );
}
