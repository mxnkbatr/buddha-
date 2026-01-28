"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    motion,
    AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import {
    ArrowLeft, Calendar, Clock, CheckCircle2, Loader2, Sparkles,
    ArrowRight, Stars, User, Mail, PenTool, Info, Shield, Hourglass, CreditCard, ChevronDown, LayoutGrid, Phone
} from "lucide-react";
import OverlayNavbar from "../../../components/Navbar";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Monk } from "@/database/types";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";

// ==========================================
// 1. VISUAL ASSETS & STYLES
// ==========================================

const CosmicBackground = ({ isNight }: { isNight: boolean }) => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-1000 ${isNight
            ? "bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#020617_100%)]"
            : "bg-[radial-gradient(ellipse_at_top,_#fffbeb_0%,_#fff7ed_100%)]"
            }`} />

        {/* Slow Moving Clouds */}
        <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className={`absolute top-[-40%] right-[-20%] w-[80vw] h-[80vw] rounded-full blur-[40px] opacity-20 ${isNight ? "bg-indigo-900" : "bg-amber-200"}`}
        />
        <motion.div
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className={`absolute bottom-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full blur-[50px] opacity-20 ${isNight ? "bg-fuchsia-900" : "bg-orange-100"}`}
        />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
);

// --- COMPONENT: SERVICE TICKET (The Informative Hero) ---
const ServiceTicket = ({ service, theme, t, lang }: any) => (
    <div className="relative group perspective-[1000px] mb-8">
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.accentGradient} opacity-20 blur-lg group-hover:opacity-30 transition-opacity`} />
        <div className={`relative p-6 rounded-[2rem] border overflow-hidden backdrop-blur-md transition-all duration-500 ${theme.ticketBg} ${theme.border}`}>

            {/* Ticket Perforations Decoration */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#fdfbf7] dark:bg-[#020617]" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-[#fdfbf7] dark:bg-[#020617]" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${theme.badge}`}>
                            {t({ mn: "Төлөвлөгөө", en: "Selected Ritual" })}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                            <Hourglass size={12} /> {service.duration}
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                        {service.name?.[lang] || service.title?.[lang] || (lang === 'mn' ? "Үйлчилгээ" : "Service")}
                    </h2>
                    <p className="text-xs md:text-sm opacity-70 max-w-lg leading-relaxed">
                        {service.description?.[lang] || service.desc?.[lang] || t({ mn: "Таны хувь заяаны төөргийг тайлж, ирээдүйн чиг баримжааг тодорхойлох гүн ухааны зөвлөгөө.", en: "A profound spiritual consultation to unravel your destiny lines and provide clarity for your future path." })}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">{t({ mn: "Үнэ", en: "Offering" })}</p>
                    <div className={`text-4xl font-serif font-medium ${theme.accentText}`}>
                        {/* PRICE OVERRIDE DISPLAY - Logic handled in parent or derived here */}
                        {Number(service.price).toLocaleString()}₮
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- COMPONENT: INFO ACCORDION ---
const InfoItem = ({ icon, title, text, theme }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b ${theme.border} last:border-0`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-current/5 ${theme.accentText}`}>{icon}</div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">{title}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 pl-12 text-sm leading-relaxed opacity-60">{text}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// 2. MAIN PAGE LOGIC
// ==========================================

export default function MonkBookingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const monkId = Array.isArray(params.id) ? params.id[0] : params.id;
    const initialServiceId = searchParams.get("serviceId");

    const { language: lang, t } = useLanguage();
    const { resolvedTheme } = useTheme();
    // --- AUTH UPDATE ---
    const { user } = useAuth();
    const isSignedIn = !!user;

    // -- State --
    const [monk, setMonk] = useState<Monk | null>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [userNote, setUserNote] = useState("");

    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [takenSlots, setTakenSlots] = useState<string[]>([]);

    // -- Theme --
    const isNight = false;

    useEffect(() => {
        setMounted(true);
        if (user) {
            // Handle both Clerk user (fullName) and DB user (firstName/lastName)
            const name = user.fullName || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "");
            setUserName(name);
            // AuthContext user object should have email and phone
            setUserEmail(user.email || user.primaryEmailAddress?.emailAddress || "");
            setUserPhone(user.phone || "");
        }

        async function loadData() {
            if (!monkId) return;
            try {
                setLoading(true);
                // 1. Monk
                const mRes = await fetch(`/api/monks/${monkId}`);
                const mData = await mRes.json();
                setMonk(mData);

                // 2. Services
                const sRes = await fetch('/api/services');
                const sData = await sRes.json();

                // Robust filtering: monkId match OR if the monk's document explicitly references it
                // SPECIAL MONKS: Show ALL services from ALL monks
                const isSpecial = mData.isSpecial === true;
                const services = isSpecial
                    ? sData // Show ALL services for special monks
                    : sData.filter((s: any) => {
                        const isDirectMatch = s.monkId === monkId;
                        const isReferenced = Array.isArray(mData.services) && mData.services.some((ms: any) => {
                            // Check if it's an ID string or an object with an ID
                            const msId = typeof ms === 'string' ? ms : (ms.id || ms._id);
                            // Match against either Mongo _id OR custom id
                            return msId === s._id || msId === s.id;
                        });
                        return isDirectMatch || isReferenced || s.isUniversal; // Also show if flagged as universal
                    });

                // Unique filtering by name
                const uniqueServicesMap = new Map();
                services.forEach((s: any) => {
                    const key = s.name?.[lang] || s.title?.[lang] || s.name?.mn || s.name?.en || s.id; // Fallback to ID
                    if (!uniqueServicesMap.has(key)) {
                        uniqueServicesMap.set(key, s);
                    }
                });
                // OVERRIDE PRICES based on Admin-controlled Monk Status
                const uniqueServices = Array.from(uniqueServicesMap.values()).map((s: any) => ({
                    ...s,
                    price: isSpecial ? 88800 : 50000
                }));

                setAvailableServices(uniqueServices);

                if (uniqueServices.length > 0) {
                    // Try to match initialServiceId from query params, otherwise fallback to first
                    const initial = uniqueServices.find((s: any) => s._id === initialServiceId) || uniqueServices[0];
                    setSelectedService(initial);
                    setSelectedDateIndex(0);
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        }
        loadData();
    }, [monkId, user, initialServiceId, lang]);

    // -- Calendar & Slots Logic --
    const calendarDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push({
                day: d.getDate(),
                weekday: d.toLocaleDateString(lang === 'mn' ? 'mn' : 'en', { weekday: 'short' }),
                full: d
            });
        }
        return dates;
    }, [lang]);

    // Expanded to 24 Hours
    const times = useMemo(() => {
        const t = [];
        for (let i = 0; i < 24; i++) {
            const h = i.toString().padStart(2, '0');
            t.push(`${h}:00`);
        }
        return t;
    }, []);

    const currentDaySlots = useMemo(() => {
        if (selectedDateIndex === null) return [];
        const dateObj = calendarDates[selectedDateIndex].full;
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        // Default to full 24h if no specific schedule found, or use schedule
        const dayConfig = monk?.schedule?.find(s => s.day === dayName) || { start: "00:00", end: "23:59", active: true };

        if (!dayConfig.active) return [];

        // 1-Hour Lead Time Enforcer
        const filteredBySchedule = times.filter(time => {
            return time >= dayConfig.start && time < dayConfig.end;
        });

        const isToday = dateObj.toDateString() === new Date().toDateString();
        if (isToday) {
            const now = new Date();
            const minValidTime = new Date(now.getTime() + 60 * 60 * 1000); // Now + 1 Hour

            return filteredBySchedule.filter(time => {
                const [h] = time.split(':').map(Number);
                const slotDate = new Date(dateObj);
                slotDate.setHours(h, 0, 0, 0);
                return slotDate >= minValidTime;
            });
        }

        return filteredBySchedule;
    }, [selectedDateIndex, monk, calendarDates, times]);

    useEffect(() => {
        if (selectedDateIndex === null || !monkId) return;
        // Fix Timezone Issue: Use local date components instead of toISOString (which is UTC)
        const d = calendarDates[selectedDateIndex].full;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        fetch(`/api/bookings?monkId=${monkId}&date=${dateStr}`).then(r => r.json()).then(setTakenSlots);
    }, [selectedDateIndex, monkId, calendarDates]);

    const handleBooking = async () => {
        if (!isSignedIn) { alert("Please sign in."); return; }
        if (!selectedService) { alert("Please select a service."); return; }

        setIsSubmitting(true);

        // Fix Timezone Issue here too
        const d = calendarDates[selectedDateIndex!].full;
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monkId,
                serviceId: selectedService._id,
                date: dateStr,
                time: selectedTime,
                userName,
                userEmail, // Optional
                userPhone, // Required
                note: userNote
            })
        });
        if (res.ok) setIsBooked(true);
        else {
            const json = await res.json();
            alert("Booking Failed: " + (json.message || "Unknown Error"));
        }
        setIsSubmitting(false);
    };

    if (!mounted) return null;
    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;

    // -- Theme Config --
    const theme = {
        glassPanel: isNight ? "bg-[#0f172a]/60 border-indigo-500/20 text-indigo-50" : "bg-white/60 border-amber-900/10 text-amber-950",
        ticketBg: isNight ? "bg-[#0f172a]/80" : "bg-[#fffefc]/90",
        border: isNight ? "border-indigo-500/20" : "border-amber-900/10",
        accentText: isNight ? "text-cyan-400" : "text-amber-600",
        accentGradient: isNight ? "from-cyan-900 to-blue-900" : "from-amber-200 to-orange-100",
        badge: isNight ? "border-cyan-500/50 text-cyan-300" : "border-amber-600/30 text-amber-700",
        slotActive: isNight ? "bg-cyan-600 border-cyan-500 text-white" : "bg-amber-500 border-amber-500 text-white",
        input: isNight ? "bg-black/20 border-white/10 focus:border-cyan-500/50" : "bg-white/50 border-amber-900/10 focus:border-amber-500/50",
    };

    return (
        <div className={`min-h-screen font-ethereal relative overflow-x-hidden ${isNight ? 'bg-[#020617]' : 'bg-[#FDFBF7]'}`}>
            <OverlayNavbar />
            <CosmicBackground isNight={isNight} />

            <main className="relative z-10 container mx-auto px-6 pt-24 md:pt-32 pb-24">

                <Link href="/monks" className="inline-flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity">
                    <div className={`p-2 rounded-full border ${isNight ? 'border-white/20' : 'border-black/10'}`}><ArrowLeft size={16} /></div>
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t({ mn: "Буцах", en: "Return" })}</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* --- LEFT: MONK DISPLAY --- */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 self-start space-y-8">

                        {/* 3D Monk Card */}
                        <div className="relative aspect-[3/4] rounded-[30px] overflow-hidden shadow-2xl border-2 border-white/20 group">
                            <Image src={monk!.image} alt={monk!.name[lang] || monk!.name.en} fill className="w-full h-full object-cover transform transition-transform duration-[1.5s] group-hover:scale-105" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${isNight ? "from-[#020617]" : "from-[#451a03]"} via-transparent to-transparent opacity-90`} />
                            <div className="absolute bottom-0 left-0 w-full p-8 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 mb-2">{monk!.title[lang]}</p>
                                <h1 className="text-4xl font-serif text-white">{monk!.name[lang]}</h1>
                            </div>
                        </div>

                        {/* Informative Stats */}
                        <div className={`p-6 rounded-3xl border backdrop-blur-md ${theme.glassPanel}`}>
                            <h3 className="font-celestial text-sm opacity-80 mb-4 pb-2 border-b border-current/10">{t({ mn: "Товч Намтар", en: "The Reader" })}</h3>
                            <p className="text-sm leading-relaxed opacity-70 mb-4">{monk!.bio[lang]}</p>
                            <div className="flex gap-4">
                                <div className={`flex items-center gap-2 text-xs font-bold ${theme.accentText}`}>
                                    <Stars size={14} /> <span>10+ Years Exp</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-bold ${theme.accentText}`}>
                                    <User size={14} /> <span>Certified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: BOOKING ENGINE --- */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className={`relative rounded-[40px] border backdrop-blur-xl shadow-2xl overflow-hidden ${theme.glassPanel}`}
                        >
                            <div className="p-8 md:p-10 space-y-10">

                                {availableServices.length === 0 ? (
                                    <div className="text-center py-20 opacity-50">
                                        <p className="text-lg font-serif">
                                            {t({ mn: "Одоогоор энэ багшид үйлчилгээ байхгүй байна.", en: "No services available for this monk at the moment." })}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* INFORMATIVE HERO TICKET */}
                                        {selectedService && <ServiceTicket service={selectedService} theme={theme} t={t} lang={lang} />}

                                        <AnimatePresence mode="wait">
                                            {isBooked ? (
                                                /* SUCCESS SCREEN */
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 mx-auto bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg mb-6">
                                                        <CheckCircle2 size={40} />
                                                    </motion.div>
                                                    <h2 className="text-3xl font-serif font-bold mb-4">{t({ mn: "Баталгаажлаа", en: "Confirmed" })}</h2>
                                                    <p className="opacity-60 mb-8">{t({ mn: "Таны захиалга амжилттай бүртгэгдлээ.", en: "Your destiny has been aligned." })}</p>

                                                    {/* --- BANK DETAILS SECTION (Monk Page) --- */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        className={`max-w-md mx-auto mb-8 p-6 rounded-2xl text-left space-y-4 relative overflow-hidden bg-white text-black shadow-xl border border-black/10`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`p-2 rounded-full bg-amber-500/20 text-amber-700`}>
                                                                <Shield size={18} />
                                                            </div>
                                                            <h3 className={`font-bold uppercase tracking-wider text-xs text-black`}>
                                                                {t({ mn: "Төлбөрийн Мэдээлэл", en: "Payment Details" })}
                                                            </h3>
                                                        </div>

                                                        <div className="space-y-3 text-sm text-black">
                                                            <div className="flex justify-between items-center">
                                                                <span className="opacity-60">{t({ mn: "Банк:", en: "Bank:" })}</span>
                                                                <span className="font-bold">{t({ mn: "Төрийн Банк", en: "State Bank" })}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="opacity-60">{t({ mn: "Данс:", en: "Account:" })}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold">888889896666</span>
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText("888889896666")}
                                                                        className={`p-1.5 rounded-md hover:bg-black/10 transition-colors text-amber-600`}
                                                                        title={t({ mn: "Хуулах", en: "Copy" })}
                                                                    >
                                                                        <CheckCircle2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="opacity-60">{t({ mn: "Нэр:", en: "Name:" })}</span>
                                                                <span className="font-bold">Gevabal Company</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="opacity-60">{t({ mn: "Дүн:", en: "Amount:" })}</span>
                                                                <span className={`font-bold text-amber-600`}>{Number(selectedService.price).toLocaleString()}₮</span>
                                                            </div>
                                                        </div>

                                                        <div className={`text-[10px] opacity-50 mt-4 pt-4 border-t border-black/10`}>
                                                            {t({
                                                                mn: "Гүйлгээний утга дээр утасны дугаараа бичнэ үү.",
                                                                en: "Please include your phone number in the transaction description."
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                    <Link href="/" className={`inline-block px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest ${isNight ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                                        {t({ mn: "Нүүр хуудас", en: "Return Home" })}
                                                    </Link>
                                                </motion.div>
                                            ) : (
                                                /* BOOKING STEPS */
                                                <>
                                                    {/* 0. SERVICE SELECTOR (If multiple available) */}
                                                    {availableServices.length > 1 && (
                                                        <section>
                                                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">
                                                                <LayoutGrid size={14} /> {t({ mn: "Зан Үйл Сонгох", en: "Choose Ritual" })}
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {availableServices.map((s) => (
                                                                    <button
                                                                        key={s._id}
                                                                        onClick={() => { setSelectedService(s); setSelectedTime(null); }}
                                                                        className={`
                                                                    p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group
                                                                    ${selectedService?._id === s._id ? theme.slotActive + " shadow-lg scale-[1.02]" : "border-current/10 hover:bg-current/5"}
                                                                `}
                                                                    >
                                                                        <div className="relative z-10">
                                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                                                                                {s.duration}
                                                                            </p>
                                                                            <p className="text-sm font-bold font-serif">
                                                                                {s.name?.[lang] || s.title?.[lang]}
                                                                            </p>
                                                                            <p className={`text-xs font-bold mt-2 ${selectedService?._id === s._id ? "text-white/90" : theme.accentText}`}>
                                                                                {Number(s.price).toLocaleString()}₮
                                                                            </p>
                                                                        </div>
                                                                        {selectedService?._id === s._id && (
                                                                            <motion.div layoutId="service-active" className="absolute inset-0 bg-white/10" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </section>
                                                    )}

                                                    {/* 1. DATE SELECTOR */}
                                                    <section>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-60">
                                                                <Calendar size={14} /> {t({ mn: "Өдөр Сонгох", en: "Select Date" })}
                                                            </h4>
                                                            <span className="text-[10px] opacity-40">{t({ mn: "Орон нутгийн цагаар", en: "Local Time" })}</span>
                                                        </div>
                                                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                                            {calendarDates.map((d, i) => (
                                                                <button
                                                                    key={i} onClick={() => { setSelectedDateIndex(i); setSelectedTime(null); }}
                                                                    className={`
                                                    shrink-0 w-16 h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center
                                                    ${selectedDateIndex === i ? theme.slotActive + " shadow-lg scale-105" : "border-current/10 hover:bg-current/5"}
                                                `}
                                                                >
                                                                    <span className="text-[9px] font-black uppercase mb-1 opacity-70">{d.weekday}</span>
                                                                    <span className="text-2xl font-serif font-bold">{d.day}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {/* 2. TIME SELECTOR */}
                                                    <AnimatePresence>
                                                        {selectedDateIndex !== null && (
                                                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                                <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">
                                                                    <Clock size={14} /> {t({ mn: "Цаг Сонгох", en: "Select Time" })}
                                                                </h4>
                                                                {currentDaySlots.length > 0 ? (
                                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                                        {currentDaySlots.map((time, idx) => {
                                                                            const isTaken = takenSlots.includes(time);
                                                                            return (
                                                                                <button
                                                                                    key={time} disabled={isTaken}
                                                                                    onClick={() => setSelectedTime(time)}
                                                                                    className={`
                                                                    py-3 rounded-xl text-xs font-bold border transition-all relative
                                                                    ${selectedTime === time ? theme.slotActive : isTaken ? "opacity-30 cursor-not-allowed bg-black/5 line-through" : "border-current/10 hover:bg-current/5"}
                                                                `}
                                                                                >
                                                                                    {time}
                                                                                </button>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-6 opacity-50 border border-dashed rounded-xl border-current/20">
                                                                        <p className="text-xs">{t({ mn: "Боломжит цаг байхгүй", en: "No available slots" })}</p>
                                                                    </div>
                                                                )}
                                                            </motion.section>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* 3. INPUT FORM & ACCORDION */}
                                                    <AnimatePresence>
                                                        {selectedTime && (
                                                            <motion.section
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="space-y-8 pt-8 border-t border-current/10"
                                                            >
                                                                {/* PROTOCOLS ACCORDION */}
                                                                <div className="rounded-2xl border border-current/10 p-2">
                                                                    <InfoItem
                                                                        icon={<Shield size={14} />}
                                                                        title={t({ mn: "Бэлтгэл Ажил", en: "Preparation Protocols" })}
                                                                        text={t({ mn: "Та тайван орчинд, өөрийгөө бэлдсэн байх хэрэгтэй. Онлайн уулзалт тул интернет холболтоо шалгаарай.", en: "Ensure you are in a quiet space with stable internet. Center your mind 5 minutes prior to the session." })}
                                                                        theme={theme}
                                                                    />
                                                                    <InfoItem
                                                                        icon={<Info size={14} />}
                                                                        title={t({ mn: "Нууцлал", en: "Privacy Policy" })}
                                                                        text={t({ mn: "Таны хувийн мэдээлэл болон яриа бүрэн нууцлагдана.", en: "All sessions are strictly confidential. Your data is encrypted and never shared." })}
                                                                        theme={theme}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-2">Name</label>
                                                                        <div className="relative">
                                                                            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                                                            <input value={userName} onChange={e => setUserName(e.target.value)} className={`w-full pl-10 pr-4 py-4 rounded-xl border outline-none font-serif text-base transition-all ${theme.input}`} placeholder="Full Name" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-2">Phone</label>
                                                                        <div className="relative">
                                                                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                                                            <input value={userPhone} onChange={e => setUserPhone(e.target.value)} className={`w-full pl-10 pr-4 py-4 rounded-xl border outline-none font-serif text-base transition-all ${theme.input}`} placeholder="99112233" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-2">Email (Optional)</label>
                                                                        <div className="relative">
                                                                            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                                                                            <input value={userEmail} onChange={e => setUserEmail(e.target.value)} className={`w-full pl-10 pr-4 py-4 rounded-xl border outline-none font-serif text-base transition-all ${theme.input}`} placeholder="Email Address" />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-2">Intention</label>
                                                                    <div className="relative">
                                                                        <PenTool size={14} className="absolute left-4 top-4 opacity-40" />
                                                                        <textarea value={userNote} onChange={e => setUserNote(e.target.value)} className={`w-full pl-10 pr-4 py-4 rounded-xl border outline-none font-serif text-base h-24 resize-none transition-all ${theme.input}`} placeholder={t({ mn: "Таны асуулт эсвэл зорилго...", en: "Your question or focus for the session..." })} />
                                                                    </div>
                                                                </div>

                                                                {/* ULTRA BUTTON */}
                                                                {isSignedIn ? (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                                                        onClick={handleBooking} disabled={!userName || !userPhone || !selectedService || isSubmitting}
                                                                        className="w-full relative group h-16 rounded-2xl overflow-hidden shadow-2xl mt-2 disabled:grayscale disabled:opacity-50"
                                                                    >
                                                                        <div className={`absolute inset-0 bg-gradient-to-r ${isNight ? 'from-cyan-600 to-blue-600' : 'from-amber-500 to-orange-600'} transition-all duration-300`} />
                                                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_linear_infinite]" />

                                                                        <div className="relative z-10 flex items-center justify-center gap-3 text-white h-full font-bold uppercase tracking-[0.2em] text-sm">
                                                                            {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                                                                <>
                                                                                    <CreditCard size={16} /> <span>{t({ mn: "Төлбөр Төлөх & Баталгаажуулах", en: "Complete Booking" })}</span> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </motion.button>
                                                                ) : (
                                                                    <Link href="/sign-in" className="block w-full">
                                                                        <button className="w-full h-14 rounded-2xl bg-zinc-800 text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 transition-colors">
                                                                            {t({ mn: "Нэвтэрч захиалга өгөх", en: "Sign In to Book" })}
                                                                        </button>
                                                                    </Link>
                                                                )}
                                                            </motion.section>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}