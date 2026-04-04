"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ChevronLeft, Star, Calendar, Award, MessageCircle, 
    Share2, ShieldCheck, Sparkles, Heart, Globe, 
    Clock, CheckCircle, MoreHorizontal, Send, StarHalf,
    UserCircle, Loader2
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Review {
    _id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function MonkProfileClient() {
    const params = useParams();
    const router = useRouter();
    const monkId = Array.isArray(params.id) ? params.id[0] : params.id;

    const { language: lang, t } = useLanguage();
    const { user } = useAuth();
    const isSignedIn = !!user;

    // --- State ---
    const [monk, setMonk] = useState<any | null>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    
    // New Review Form State
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState("");

    // --- Refs ---
    const calendarRef = useRef<HTMLDivElement>(null);

    // --- Data Loading ---
    useEffect(() => {
        async function loadData() {
            if (!monkId) return;
            try {
                setLoading(true);
                
                // 1. Fetch Monk & Services & Reviews in parallel
                const [mRes, sRes, rRes] = await Promise.all([
                    fetch(`/api/monks/${monkId}`),
                    fetch('/api/services'),
                    fetch(`/api/reviews/${monkId}`)
                ]);

                const mData = await mRes.json();
                const sData = await sRes.json();
                const rData = await rRes.json();

                setMonk(mData);
                setReviews(rData.reviews || []);
                setReviewStats(rData.stats || { averageRating: 0.0, totalReviews: 0 });

                // 2. Process Services
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
                    const key = s.name?.[lang as 'mn'|'en'] || s.title?.[lang as 'mn'|'en'] || s.name?.mn || s.id;
                    if (!uniqueServicesMap.has(key)) uniqueServicesMap.set(key, s);
                });
                
                const formatted = Array.from(uniqueServicesMap.values()).map((s: any) => ({
                    ...s,
                    price: s.price || (isSpecial ? 88800 : 50000),
                    duration: s.duration || "60 мин"
                }));
                setAvailableServices(formatted);

            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        }
        loadData();
    }, [monkId, lang]);

    // Check Wishlist Status
    useEffect(() => {
        if (isSignedIn && user?.wishlist && monkId) {
            setIsWishlisted(user.wishlist.includes(monkId));
        }
    }, [isSignedIn, user, monkId]);

    // --- Actions ---
    const toggleWishlist = async () => {
        if (!isSignedIn) {
            router.push(`/${lang}/sign-in`);
            return;
        }
        if (wishlistLoading) return;

        setWishlistLoading(true);
        try {
            const res = await fetch("/api/user/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ monkId })
            });
            if (res.ok) {
                setIsWishlisted(!isWishlisted);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: monkName,
            text: `${monkName} - ${monkTitle}. ${t({ mn: "Танд тусалж чадна.", en: "Can help you." })}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert(t({ mn: "Холбоос хуулагдлаа", en: "Link copied to clipboard" }));
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    const submitReview = async () => {
        if (!newReviewComment.trim() || submittingReview) return;
        setSubmittingReview(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    monkId,
                    rating: newReviewRating,
                    comment: newReviewComment
                })
            });
            if (res.ok) {
                const updatedReviews = await fetch(`/api/reviews/${monkId}`).then(r => r.json());
                setReviews(updatedReviews.reviews);
                setReviewStats(updatedReviews.stats);
                setNewReviewComment("");
                alert(t({ mn: "Сэтгэгдэл амжилттай үлдлээ", en: "Review submitted successfully" }));
            } else {
                const err = await res.json();
                alert(err.message || t({ mn: "Алдаа гарлаа", en: "An error occurred" }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleBook = (srvId?: string) => {
        const id = srvId || (availableServices[0]?._id || availableServices[0]?.id);
        if (!id) return;
        
        if (isSignedIn) {
            router.push(`/${lang}/booking/${id}?monkId=${monkId}&date=${selectedDate}`);
        } else {
            router.push(`/${lang}/sign-in`);
        }
    };

    // --- Helpers ---
    const monkName = monk?.name?.[lang as 'mn' | 'en'] || monk?.name?.mn || "";
    const monkTitle = monk?.title?.[lang as 'mn' | 'en'] || monk?.title?.mn || "Багш";
    const monkBio = monk?.bio?.[lang as 'mn' | 'en'] || monk?.bio?.mn || "";

    const calendarDays = useMemo(() => {
        const days = [];
        const start = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push({
                full: d.toISOString().split('T')[0],
                day: d.getDate(),
                weekday: d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { weekday: 'short' }),
                month: d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { month: 'short' })
            });
        }
        return days;
    }, [lang]);

    if (loading || !monk) return (
        <div className="h-[100svh] flex items-center justify-center bg-cream">
            <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="min-h-[100svh] bg-cream flex flex-col hide-scrollbar overflow-x-hidden">

            {/* ── IMMERSIVE HERO ── */}
            <div className="relative h-[55svh] shrink-0 overflow-hidden">
                <Image
                    src={monk.image || "/default-monk.jpg"}
                    alt={monkName}
                    fill
                    className="object-cover"
                    priority
                />
                
                {/* Overlays */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/10 to-transparent z-10" />
                
                {/* Floating Controls */}
                <div 
                    className="absolute z-30 w-full px-5 flex justify-between items-center"
                    style={{ top: "max(env(safe-area-inset-top, 0px), 16px)" }}
                >
                    <button
                        onClick={() => router.back()}
                        className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                        <ChevronLeft className="text-white" size={26} />
                    </button>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={handleShare}
                            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                        >
                            <Share2 size={20} className="text-white" />
                        </button>
                        <button 
                            onClick={toggleWishlist}
                            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isWishlisted ? "active" : "inactive"}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <Heart 
                                        size={22} 
                                        className={isWishlisted ? "text-red-500 fill-red-500" : "text-white"} 
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Identity Card (Bottom Overlap) */}
                <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative mb-3 group">
                            <div className="w-28 h-28 rounded-[2.8rem] border-4 border-white shadow-2xl overflow-hidden bg-white/50 backdrop-blur-md">
                                <img src={monk.image || "/default-monk.jpg"} className="w-full h-full object-cover" />
                            </div>
                            {monk.isAvailable !== false && (
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg shadow-emerald-500/30">
                                    <div className="w-full h-full rounded-full bg-emerald-500 animate-ping opacity-30" />
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-ink tracking-tight text-center">{monkName}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[14px] font-black text-gold uppercase tracking-widest">{monkTitle}</span>
                            <ShieldCheck size={16} className="text-emerald-500" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="relative z-20 px-6 pt-8 pb-40 space-y-12">
                
                {/* 1. Stats Grid */}
                <section className="grid grid-cols-4 gap-3">
                    {[
                        { icon: <CheckCircle />, val: monk.totalBookings || "120+", label: t({ mn: "Тус", en: "Helps" }) },
                        { icon: <Star />, val: reviewStats.averageRating || "5.0", label: t({ mn: "Үнэлгээ", en: "Rating" }) },
                        { icon: <Award />, val: `${monk.yearsOfExperience || 10}ж`, label: t({ mn: "Туршлага", en: "Exp" }) },
                        { icon: <Clock />, val: "~2ц", label: t({ mn: "Хариу", en: "Resp" }) },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-3 flex flex-col items-center justify-center border border-stone/10 shadow-sm">
                            <div className="text-gold/60 mb-1.5 scale-90">{s.icon}</div>
                            <div className="text-[16px] font-black text-ink leading-none">{s.val}</div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-earth/40 mt-1">{s.label}</div>
                        </div>
                    ))}
                </section>

                {/* 2. Availability Calendar */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[12px] font-black text-gold uppercase tracking-[0.2em]">
                            {t({ mn: "Боломжит өдрүүд", en: "Availability" })}
                        </h2>
                        <span className="text-[11px] font-bold text-earth/40">{t({ mn: "Дараагийн 14 хоног", en: "Next 14 days" })}</span>
                    </div>
                    <div 
                        ref={calendarRef}
                        className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6"
                    >
                        {calendarDays.map((d) => {
                            const isSelected = selectedDate === d.full;
                            return (
                                <button
                                    key={d.full}
                                    onClick={() => setSelectedDate(d.full)}
                                    className={`shrink-0 w-16 h-20 rounded-[1.8rem] flex flex-col items-center justify-center transition-all border ${
                                        isSelected 
                                            ? "bg-ink border-ink text-white shadow-xl shadow-ink/20 scale-110" 
                                            : "bg-white border-stone/10 text-earth hover:border-gold/30"
                                    }`}
                                >
                                    <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? "opacity-60" : "text-earth/40"}`}>
                                        {d.weekday}
                                    </span>
                                    <span className="text-[18px] font-black leading-none">{d.day}</span>
                                    {isSelected && <div className="w-1 h-1 rounded-full bg-gold mt-1.5" />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Services (Horizontal Carousel) */}
                <section>
                    <h2 className="text-[12px] font-black text-gold uppercase tracking-[0.2em] mb-5">
                        {t({ mn: "Санал болгож буй засал", en: "Rituals & Services" })}
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6">
                        {availableServices.map((svc: any) => (
                            <div 
                                key={svc._id || svc.id}
                                className="shrink-0 w-[240px] bg-white rounded-[2.5rem] p-6 border border-stone/10 shadow-sm flex flex-col"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-gold flex items-center justify-center mb-4">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-[16px] font-black text-ink leading-tight mb-1 truncate">
                                    {svc.name?.[lang as 'mn'|'en'] || svc.name?.mn || "Ritual"}
                                </h3>
                                <p className="text-[12px] font-bold text-earth/40 uppercase tracking-widest mb-4">
                                    {svc.duration || "60 min"}
                                </p>
                                <div className="mt-auto flex items-center justify-between">
                                    <p className="text-[18px] font-black text-ink">₮{svc.price.toLocaleString()}</p>
                                    <button 
                                        onClick={() => handleBook(svc._id || svc.id)}
                                        className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center active:scale-90 transition-transform"
                                    >
                                        <ChevronLeft size={20} className="rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Bio Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[12px] font-black text-gold uppercase tracking-[0.2em]">
                            {t({ mn: "Танилцуулга", en: "Biography" })}
                        </h2>
                        <Globe size={16} className="text-gold/40" />
                    </div>
                    <div className="relative">
                        <p className={`text-[15px] font-medium text-earth/80 leading-relaxed font-serif ${!isBioExpanded ? "line-clamp-4" : ""}`}>
                            {monkBio}
                        </p>
                        {monkBio.length > 200 && (
                            <button 
                                onClick={() => setIsBioExpanded(!isBioExpanded)}
                                className="mt-2 text-[13px] font-black text-gold flex items-center gap-1 active:scale-95 transition-transform"
                            >
                                {isBioExpanded ? t({ mn: "Хураах", en: "Show Less" }) : t({ mn: "Дэлгэрэнгүй", en: "Read More" })}
                                <ChevronLeft size={16} className={isBioExpanded ? "rotate-90" : "-rotate-90"} />
                            </button>
                        )}
                    </div>
                </section>

                {/* 5. Reviews Section */}
                <section className="space-y-6">
                    <div className="flex items-baseline justify-between mb-2">
                        <h2 className="text-[12px] font-black text-gold uppercase tracking-[0.2em]">
                            {t({ mn: "Үнэлгээ & Сэтгэгдэл", en: "Ratings & Reviews" })}
                        </h2>
                        <div className="flex items-center gap-1 text-gold">
                            <span className="text-[18px] font-black">{reviewStats.averageRating}</span>
                            <Star size={14} fill="currentColor" />
                            <span className="text-[11px] font-bold text-earth/30">({reviewStats.totalReviews})</span>
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map((r) => (
                                <div key={r._id} className="bg-stone/10 rounded-[2rem] p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white overflow-hidden">
                                                {r.userAvatar ? <img src={r.userAvatar} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-stone" />}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-black text-ink leading-none">{r.userName}</p>
                                                <div className="flex gap-0.5 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} className={i < r.rating ? "text-gold fill-gold" : "text-stone"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-earth/30">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-[14px] text-earth/70 leading-relaxed italic">"{r.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-earth/40 font-bold text-[13px]">
                                {t({ mn: "Одоогоор сэтгэгдэл байхгүй байна.", en: "No reviews yet." })}
                            </p>
                        )}
                    </div>

                    {/* Submit Review Form (Mobile Friendly) */}
                    {isSignedIn && (
                        <div className="bg-white rounded-[2.5rem] p-6 border border-stone/10 shadow-sm mt-8">
                            <h3 className="text-[14px] font-black text-ink mb-4">{t({ mn: "Үнэлгээ өгөх", en: "Rate this Monk" })}</h3>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star}
                                        onClick={() => setNewReviewRating(star)}
                                        className="p-1 active:scale-125 transition-transform"
                                    >
                                        <Star 
                                            size={28} 
                                            className={star <= newReviewRating ? "text-gold fill-gold" : "text-stone/30"} 
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <textarea 
                                    value={newReviewComment}
                                    onChange={(e) => setNewReviewComment(e.target.value)}
                                    placeholder={t({ mn: "Таны сэтгэгдэл...", en: "Share your experience..." })}
                                    className="w-full bg-stone/10 rounded-2xl p-4 text-[14px] outline-none border-2 border-transparent focus:border-gold/30 transition-all min-h-[100px] resize-none"
                                />
                                <button 
                                    onClick={submitReview}
                                    disabled={submittingReview}
                                    className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-gold text-white flex items-center justify-center shadow-lg shadow-gold/20 active:scale-90 transition-all disabled:opacity-50"
                                >
                                    {submittingReview ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-earth/40 mt-3 text-center">
                                {t({ mn: "Засал дууссаны дараа үнэлгээ өгөх боломжтой.", en: "Reviews only allowed after completed rituals." })}
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* ── STICKY BOTTOM BAR ── */}
            <div
                className="fixed left-0 right-0 px-6 bg-white/80 backdrop-blur-3xl border-t border-stone/20 z-50 flex items-center gap-4 pb-8 pt-4"
                style={{ bottom: "0px" }} // Usually on mobile we want it above the OS bar, but globals/layout handles safe area
            >
                <button 
                    onClick={() => router.push(`/${lang}/messenger?monkId=${monkId}`)}
                    className="w-16 h-16 rounded-[2.2rem] bg-stone/30 flex items-center justify-center text-ink active:scale-95 transition-transform shrink-0"
                >
                    <MessageCircle size={28} />
                </button>
                
                <button
                    onClick={() => handleBook()}
                    className="flex-1 h-16 bg-ink text-white font-black text-[16px] rounded-[2.2rem] active:scale-95 transition-all shadow-2xl shadow-ink/30 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="flex items-center justify-center gap-2">
                        <Calendar size={18} />
                        {!isSignedIn ? t({ mn: "Нэвтэрч орох", en: "Sign in to Book" }) : t({ mn: "Цаг захиалах", en: "Book Ritual" })}
                    </span>
                </button>
            </div>
        </div>
    );
}
