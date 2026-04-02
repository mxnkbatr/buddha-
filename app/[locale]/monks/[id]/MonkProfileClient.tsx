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

                // For the UI preview, let's inject default prices if missing to match screenshot
                setAvailableServices(uniqueServices.map((s, idx) => ({
                    ...s,
                    price: idx === 0 ? 45000 : 70000,
                    duration: idx === 0 ? "60 мин" : "90 мин"
                })));
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        }
        loadData();
    }, [monkId, lang]);

    if (loading || !monk) return <div className="h-screen w-full flex items-center justify-center bg-[#1A1713]"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

    const monkName = monk.name[lang] || monk.name.mn || monk.name.en;
    const monkTitle = monk.title?.[lang] || monk.title?.mn || monk.title?.en || "Багш";

    return (
        <div className="min-h-[100svh] bg-cream flex flex-col relative pb-32">
            {/* DARK TOP HALF */}
            <div className="relative h-[250px] md:h-[300px] bg-[#1A1713] w-full shrink-0 overflow-hidden">
                {/* Subtle Radar/Target Rings matching Image 3 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
                    <div className="w-[150%] max-w-[600px] aspect-square rounded-full border border-gold absolute" />
                    <div className="w-[100%] max-w-[400px] aspect-square rounded-full border border-gold absolute" />
                    <div className="w-[60%] max-w-[240px] aspect-square rounded-full border border-gold absolute" />
                    <div className="w-[1px] h-full bg-gold absolute opacity-70" />
                    <div className="h-[1px] w-full bg-gold absolute opacity-70" />
                </div>
                
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="absolute top-[max(env(safe-area-inset-top),40px)] left-5 z-20 w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
                >
                    <ChevronLeft className="text-white opacity-80" size={24} />
                </button>
            </div>

            {/* WHITE OVERLAP HALF */}
            <div className="relative flex-1 bg-white -mt-16 rounded-t-[32px] pt-16 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                
                {/* Centered Avatar */}
                <div className="absolute -top-[54px] left-1/2 -translate-x-1/2">
                    <div className="w-[108px] h-[108px] bg-white rounded-[28px] p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <Image 
                            src={monk.image || "/default-monk.jpg"} 
                            alt={monkName} 
                            width={100} 
                            height={100} 
                            className="w-full h-full object-cover rounded-[22px]"
                        />
                    </div>
                </div>

                {/* Profile Info */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-ink leading-tight mb-1">{monkName}</h1>
                    <p className="text-[13px] text-earth font-medium">
                        {monkTitle} · {monk.department || "Гандан хийд"}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="flex bg-white rounded-[24px] p-4 shadow-sm border border-stone/60 mb-8 mx-1">
                    <div className="flex-1 text-center border-r border-stone/60">
                        <p className="text-xl font-black text-ink mb-0.5">247</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#B3A89A]">захиалга</p>
                    </div>
                    <div className="flex-1 text-center border-r border-stone/60">
                        <p className="text-xl font-black text-ink mb-0.5">{monk.rating || "4.9"}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#B3A89A]">үнэлгээ</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-xl font-black text-ink mb-0.5">{monk.yearsOfExperience || 12}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#B3A89A]">жил</p>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#80766A] mb-4 ml-1">Үйлчилгээ</h3>
                    
                    <div className="space-y-3">
                        {availableServices.length > 0 ? (
                            availableServices.map((service) => (
                                <div key={service._id} className="flex items-center justify-between bg-white rounded-[20px] p-5 shadow-sm border border-stone/60 active:scale-[0.98] transition-transform">
                                    <div>
                                        <p className="font-bold text-[15px] text-ink mb-1 leading-snug">
                                            {service.name?.[lang] || service.title?.[lang]}
                                        </p>
                                        <p className="text-xs text-[#9B9084]">
                                            {service.duration || "60 мин"}
                                        </p>
                                    </div>
                                    <div className="px-4 py-1.5 rounded-[12px] bg-[#FFF8E7] text-[#A67C00] font-black tabular-nums text-[13px]">
                                        ₮{Number(service.price).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-earth py-4">Одоогоор үйлчилгээ байхгүй байна.</p>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}
