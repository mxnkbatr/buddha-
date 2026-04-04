"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Monk } from "@/database/types";
import { useAuth } from "@/contexts/AuthContext";

export default function MonkProfileClient() {
    const params = useParams();
    const router = useRouter();
    const monkId = Array.isArray(params.id) ? params.id[0] : params.id;

    const { language: lang, t } = useLanguage();
    const { user } = useAuth();
    const isSignedIn = !!user;

    const [monk, setMonk] = useState<Monk | null>(null);
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
                
                const uniqueServices = Array.from(uniqueServicesMap.values()).map((s: any) => ({
                    ...s,
                    price: isSpecial ? 88800 : (s.price || 50000)
                }));

                // Use database values for price and duration, falling back to defaults if missing
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

    // loading state
    if (loading || !monk) return (
        <div className="h-[100svh] flex items-center justify-center bg-cream">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
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
        <div className="min-h-[100svh] bg-cream flex flex-col">

            {/* ── HERO DARK SECTION ── */}
            <div className="relative h-[260px] bg-[#1A1713] shrink-0 overflow-hidden">
                {/* Mandala rings — subtle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[180, 120, 70].map((r, i) => (
                        <div key={i}
                            className="absolute rounded-full border border-saffron/10"
                            style={{ width: r * 2, height: r * 2 }}
                        />
                    ))}
                    <div className="absolute w-px h-full bg-saffron/10" />
                    <div className="absolute h-px w-full bg-saffron/10" />
                </div>

                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="absolute z-20 flex items-center justify-center w-10 h-10 rounded-2xl bg-white/8 border border-white/10 active:scale-95 transition-transform"
                    style={{ top: "max(env(safe-area-inset-top, 0px), 44px)", left: 20 }}
                >
                    <ChevronLeft className="text-white" size={22} />
                </button>
            </div>

            {/* ── WHITE CARD OVERLAP ── */}
            <div className="relative flex-1 bg-white -mt-10 rounded-t-[32px] pt-14 px-5 shadow-modal">

                {/* Avatar — centered, overlaps dark hero */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-[22px] p-1.5 shadow-card">
                        <Image
                            src={monk.image || "/default-monk.jpg"}
                            alt={monkName}
                            width={88} height={88}
                            className="w-full h-full object-cover rounded-[18px]"
                        />
                    </div>
                    {monk.isAvailable !== false && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-[6px] bg-live border-2 border-white" />
                    )}
                </div>

                {/* Name & Title */}
                <div className="text-center mb-6">
                    <h1 className="text-[22px] font-black text-ink tracking-tight">{monkName}</h1>
                    <p className="text-[13px] text-earth mt-1">{monkTitle} · {(monk as any).department || "Гандан хийд"}</p>
                    {monk.isSpecial && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-50 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            Онцлох багш
                        </span>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex bg-stone rounded-2xl overflow-hidden mb-6">
                    {[
                        { num: (monk as any).totalBookings || "247", label: lang === 'mn' ? "Захиалга" : "Sessions" },
                        { num: "4.9", label: lang === 'mn' ? "Үнэлгээ" : "Rating" },
                        { num: `${monk.yearsOfExperience || 10}`, label: lang === 'mn' ? "Жил" : "Years" },
                    ].map((s, i, arr) => (
                        <div key={i} className={`flex-1 py-3 text-center ${i < arr.length - 1 ? "border-r border-border" : ""}`}>
                            <div className="text-[18px] font-black text-ink">{s.num}</div>
                            <div className="text-[9px] font-bold uppercase tracking-wide text-earth mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Bio */}
                {monkBio && (
                    <div className="mb-6">
                        <p className="text-[14px] text-earth leading-relaxed">{monkBio}</p>
                    </div>
                )}

                {/* Services */}
                <div className="mb-6 pb-24">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-earth mb-3">
                        {lang === 'mn' ? "Үйлчилгээ" : "Services"}
                    </h2>
                    <div className="space-y-3">
                        {availableServices.map((svc: any) => {
                            const isSelected = selectedServiceId === (svc._id || svc.id);
                            return (
                                <div key={svc._id || svc.id}
                                    onClick={() => {
                                        setSelectedServiceId(svc._id || svc.id);
                                        handleBook(svc._id || svc.id);
                                    }}
                                    className={`rounded-2xl px-4 py-3.5 flex items-center justify-between press-effect cursor-pointer border-2 transition-all ${
                                        isSelected ? 'bg-gold/5 border-gold shadow-sm' : 'bg-stone border-transparent'
                                    }`}
                                >
                                    <div>
                                        <p className="text-[14px] font-bold text-ink">
                                            {svc.name?.[lang as 'mn' | 'en'] || svc.name?.mn || svc.title?.mn || "Үйлчилгээ"}
                                        </p>
                                        <p className="text-[11px] text-earth mt-0.5">{svc.duration || "60 мин"}</p>
                                    </div>
                                    <span className={`text-[13px] font-bold px-3 py-1.5 rounded-xl transition-colors ${
                                        isSelected ? 'bg-gold text-white' : 'bg-amber-50 text-amber-800'
                                    }`}>
                                        ₮{(svc.price || 50000).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── STICKY BOOK BUTTON ── */}
            <div
                className="fixed left-0 right-0 bottom-0 px-5 bg-white/90 backdrop-blur-md border-t border-stone/60 z-30"
                style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)", paddingTop: 12 }}
            >
                <button
                    onClick={() => handleBook()}
                    className="btn-primary btn-primary-full"
                >
                    {!isSignedIn ? (lang === 'mn' ? "Нэвтрэн захиалах" : "Sign in to Book") : (lang === 'mn' ? "Цаг захиалах" : "Book Session")}
                </button>
            </div>
        </div>
    );
}
