"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
const MotionImage = motion(Image);
import {
    ArrowLeft, Calendar, Clock, CheckCircle2, Loader2,
    Sparkles, Star, User, ArrowRight, Hourglass, Shield, Info, ChevronDown, Phone
} from "lucide-react";
import { useTheme } from "next-themes";
import OverlayNavbar from "../../../components/Navbar";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Monk } from "@/database/types";
import { useAuth } from "@/contexts/AuthContext";

// --- ANIMATION VARIANTS ---
const containerVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVar = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 50 } }
};

// --- COSMIC BACKGROUND (Unchanged Colors, enhanced float) ---
const CosmicBackground = ({ isNight }: { isNight: boolean }) => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-1000 ${isNight
            ? "bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#020617_100%)]"
            : "bg-[radial-gradient(ellipse_at_top,_#fffbeb_0%,_#fff7ed_100%)]"
            }`} />

        <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className={`absolute top-[-30%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-20 safari-gpu ${isNight ? "bg-cyan-900" : "bg-amber-200"}`}
        />
        <motion.div
            animate={{ rotate: -360, scale: [1, 1.3, 1], x: [0, -50, 0] }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-20 safari-gpu ${isNight ? "bg-fuchsia-900" : "bg-orange-100"}`}
        />
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/noise.svg')] mix-blend-overlay" />
    </div>
);

// --- COMPONENT: THE HOLOGRAPHIC TICKET (Enhanced Entrance) ---
const ServiceTicket = ({ service, monkName, theme, lang }: any) => (
    <motion.div
        variants={itemVar}
        className={`relative w-full p-6 md:p-8 rounded-[2rem] overflow-hidden border backdrop-blur-md mb-8 ${theme.glassPanel}`}
    >
        {/* Animated Shimmer Line */}
        <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute top-0 left-0 w-1/2 h-full -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none"
        />

        <div className={`absolute top-0 left-0 w-1 h-full ${theme.accentBg}`} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
                {/* Top Badges */}
                <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${theme.badgeBorder} ${theme.badgeText}`}>
                        {service.type === 'divination' ? (lang === 'mn' ? "Мэргэ" : "Divination") : (lang === 'mn' ? "Зан үйл" : "Ritual")}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold opacity-60 ${theme.text}`}>
                        <Hourglass size={12} /> {service.duration}
                    </span>
                </div>

                {/* Service Name */}
                <h1 className={`text-2xl md:text-4xl font-serif font-black tracking-tight mb-2 ${theme.text}`}>
                    {service.name?.[lang]}
                </h1>

                {/* Monk Attribution */}
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs opacity-60 ${theme.text}`}>{lang === 'mn' ? 'Багш:' : 'Guide:'}</span>
                    <div className="relative group">
                        <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.monkGradient} drop-shadow-sm`}>
                            {monkName}
                        </span>
                        <motion.span
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }}
                            className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-current to-transparent opacity-50 origin-left safari-gpu"
                        />
                    </div>
                    <div className={`p-1 rounded-full bg-yellow-500/10 text-yellow-600`}>
                        <Star size={12} fill="currentColor" />
                    </div>
                </div>

                <p className={`mt-4 text-sm max-w-lg leading-relaxed opacity-70 ${theme.text}`}>
                    {service.description?.[lang] || (lang === 'mn' ? "Таны хувь заяаны зам мөрийг тольдох үйл." : "A session to align your destiny path.")}
                </p>
            </div>

            <div className="text-right">
                <span className={`text-[10px] uppercase tracking-widest opacity-50 block mb-1 ${theme.text}`}>
                    {lang === 'mn' ? "Өргөл" : "Offering"}
                </span>
                <div className={`text-4xl font-serif font-medium ${theme.accentText}`}>
                    {service.price?.toLocaleString()}₮
                </div>
            </div>
        </div>
    </motion.div>
);

// --- COMPONENT: INFO ACCORDION (Smoother Expand) ---
const InfoItem = ({ icon, title, text, theme }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b ${theme.borderColor} last:border-0`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-current/5 ${theme.accentText} transition-transform group-hover:scale-110`}>{icon}</div>
                    <span className={`text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 ${theme.text} transition-opacity`}>{title}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={14} className={`${theme.text}`} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="overflow-hidden safari-gpu"
                    >
                        <p className={`pb-4 pl-12 text-sm leading-relaxed opacity-60 ${theme.text}`}>{text}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function RitualBookingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const lockedMonkId = searchParams.get("monkId"); // Read monk ID from query params
    const { t, language: lang } = useLanguage();
    const { resolvedTheme } = useTheme();

    // --- AUTH UPDATE ---
    const { user } = useAuth();
    const isSignedIn = !!user;

    const [mounted, setMounted] = useState(false);
    const [service, setService] = useState<any | null>(null);
    const [monks, setMonks] = useState<Monk[]>([]);
    const [selectedMonk, setSelectedMonk] = useState<Monk | null>(null);

    const [loading, setLoading] = useState(true);
    const [isBooked, setIsBooked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [takenSlots, setTakenSlots] = useState<string[]>([]);

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [userNote, setUserNote] = useState("");

    const isNight = resolvedTheme === "dark";

    // --- THEME CONFIG (Preserved) ---
    const theme = isNight ? {
        bg: "bg-[#020617]",
        text: "text-indigo-50",
        accentText: "text-cyan-400",
        accentBg: "bg-cyan-500",
        glassPanel: "bg-[#0f172a]/60 border-indigo-500/20",
        badgeBorder: "border-cyan-500/30",
        badgeText: "text-cyan-300",
        borderColor: "border-white/10",
        monkGradient: "from-cyan-400 to-blue-500",
        slotActive: "bg-cyan-600 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]",
        slotDisabled: "opacity-30 bg-white/5 cursor-not-allowed",
        slotDefault: "border-white/10 hover:bg-white/10 text-indigo-200",
        input: "bg-black/20 border-white/10 focus:border-cyan-500/50 text-white placeholder-white/20",
        btnGradient: "from-cyan-600 to-blue-600"
    } : {
        bg: "bg-[#FDFBF7]",
        text: "text-amber-950",
        accentText: "text-amber-600",
        accentBg: "bg-amber-500",
        glassPanel: "bg-white/60 border-amber-900/10 shadow-xl",
        badgeBorder: "border-amber-600/20",
        badgeText: "text-amber-700",
        borderColor: "border-amber-900/10",
        monkGradient: "from-amber-600 to-orange-700",
        slotActive: "bg-amber-500 border-amber-500 text-white shadow-[0_5px_15px_rgba(245,158,11,0.3)]",
        slotDisabled: "opacity-30 bg-black/5 cursor-not-allowed",
        slotDefault: "border-amber-900/10 hover:bg-amber-50 text-amber-900",
        input: "bg-white border-amber-900/10 focus:border-amber-500/50 text-amber-900 placeholder-amber-900/30",
        btnGradient: "from-amber-500 to-orange-600"
    };

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
            if (!id) return;
            try {
                setLoading(true);
                let fetchedService = null;
                const sRes = await fetch(`/api/services/${id}`);
                if (sRes.ok) fetchedService = await sRes.json();
                else {
                    const all = await (await fetch('/api/services')).json();
                    fetchedService = all.find((s: any) => s._id === id || s.id === id);
                }
                setService(fetchedService);

                const mRes = await fetch('/api/monks');
                const allMonks = await mRes.json();

                // Sort monks: special monks first
                const sortedMonks = allMonks.sort((a: Monk, b: Monk) => {
                    if (a.isSpecial && !b.isSpecial) return -1;
                    if (!a.isSpecial && b.isSpecial) return 1;
                    return 0;
                });

                // If monkId is locked via query params, only use that monk
                if (lockedMonkId) {
                    const lockedMonk = sortedMonks.find((m: Monk) => m._id === lockedMonkId);
                    if (lockedMonk) {
                        setMonks([lockedMonk]);
                        setSelectedMonk(lockedMonk);
                    }
                } else {
                    setMonks(sortedMonks);

                    // Auto-select special monk if available
                    const specialMonk = sortedMonks.find((m: Monk) => m.isSpecial === true);
                    if (specialMonk) {
                        setSelectedMonk(specialMonk);
                    } else if (fetchedService?.monkId) {
                        const assigned = sortedMonks.find((m: Monk) => m._id === fetchedService.monkId);
                        if (assigned) setSelectedMonk(assigned);
                    } else {
                        const available = sortedMonks.filter((m: Monk) => m.services?.some(s => s.id === fetchedService.id || s.id === fetchedService._id));
                        if (available.length > 0) setSelectedMonk(available[0]);
                        else if (sortedMonks.length > 0) setSelectedMonk(sortedMonks[0]);
                    }
                }

            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        loadData();
    }, [id, user, lockedMonkId]);

    const dates = useMemo(() => {
        const arr = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            arr.push({
                day: d.getDate(),
                week: d.toLocaleDateString(lang === 'mn' ? 'mn' : 'en', { weekday: 'short' }),
                fullDate: d
            });
        }
        return arr;
    }, [lang]);

    const times = useMemo(() => [
        "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00"
    ], []);

    useEffect(() => {
        async function checkSlots() {
            if (selectedMonk && selectedDateIndex !== null) {
                const d = dates[selectedDateIndex].fullDate.toISOString().split('T')[0];
                try {
                    const res = await fetch(`/api/bookings?monkId=${selectedMonk._id}&date=${d}`);
                    if (res.ok) setTakenSlots(await res.json());
                } catch (e) { }
            }
        }
        checkSlots();
    }, [selectedMonk, selectedDateIndex, dates]);

    const handleBooking = async () => {
        if (!isSignedIn) { alert("Please sign in."); return; }
        setIsSubmitting(true);
        try {
            // Use local date string instead of UTC ISO string to avoid timezone shifting
            const year = dates[selectedDateIndex!].fullDate.getFullYear();
            const month = String(dates[selectedDateIndex!].fullDate.getMonth() + 1).padStart(2, '0');
            const day = String(dates[selectedDateIndex!].fullDate.getDate()).padStart(2, '0');
            const d = `${year}-${month}-${day}`;

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monkId: selectedMonk?._id, serviceId: service._id,
                    date: d, time: selectedTime,
                    userName,
                    userEmail, // Optional
                    userPhone, // Required
                    note: userNote
                })
            });

            if (res.ok) {
                setIsBooked(true);
            } else {
                const errorData = await res.json();
                const errorMessage = errorData.message || "Booking Failed";

                // Show specific error messages
                if (res.status === 400 && errorMessage.includes("past")) {
                    alert(lang === 'mn'
                        ? "Өнгөрсөн цагт захиалга өгөх боломжгүй. Өөр цаг сонгоно уу."
                        : "Cannot book times in the past. Please select a future time.");
                } else if (res.status === 409) {
                    alert(lang === 'mn'
                        ? "Энэ цаг аль хэдийн захиалагдсан байна. Өөр цаг сонгоно уу."
                        : "This time slot is already taken. Please choose another time.");
                } else {
                    alert(errorMessage);
                }
            }
        } catch (e) {
            console.error(e);
            alert(lang === 'mn' ? "Алдаа гарлаа" : "An error occurred");
        }
        finally { setIsSubmitting(false); }
    };

    if (!mounted) return null;
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]"><Loader2 className="animate-spin text-amber-600" /></div>;
    if (!service) return <div>Not Found</div>;

    return (
        <div className={`min-h-screen font-ethereal relative overflow-x-hidden ${theme.bg} transition-colors duration-700`}>
            <OverlayNavbar />
            <CosmicBackground isNight={isNight} />

            <main className="relative z-10 container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24">

                {/* Animated Back Link */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link href="/services" className={`inline-flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity ${theme.text}`}>
                        <div className={`p-2 rounded-full border ${theme.borderColor}`}><ArrowLeft size={16} /></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold">{t({ mn: "Буцах", en: "Return" })}</span>
                    </Link>
                </motion.div>

                <motion.div
                    variants={containerVar}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-20 items-start"
                >

                    {/* --- LEFT: MONK PROFILE (STICKY & ANIMATED) --- */}
                    <motion.div
                        variants={itemVar} className="lg:col-span-4 lg:sticky lg:top-32 space-y-8 z-20">
                        {/* Floating Monk Image */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="group relative aspect-[4/3] md:aspect-[3/4] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl cursor-none"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-t ${isNight ? "from-[#020617]" : "from-[#451a03]"} via-transparent to-transparent opacity-80 z-10 transition-opacity group-hover:opacity-60`} />

                            <MotionImage
                                src={selectedMonk?.image || "/default-monk.jpg"}
                                alt="Monk"
                                fill
                                className="w-full h-full object-cover"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="absolute bottom-0 left-0 w-full p-8 z-20 text-center">
                                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 mb-2">{selectedMonk?.title?.[lang]}</motion.p>
                                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl font-serif text-white">{selectedMonk?.name?.[lang]}</motion.h2>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className={`p-6 rounded-3xl border backdrop-blur-md transition-transform ${theme.glassPanel}`}
                        >
                            <h3 className={`font-celestial text-sm opacity-80 mb-4 pb-2 border-b ${theme.borderColor} ${theme.text}`}>
                                {t({ mn: "Багшийн тухай", en: "About the Guide" })}
                            </h3>
                            <p className={`text-sm leading-relaxed opacity-70 mb-6 ${theme.text}`}>
                                {selectedMonk?.bio?.[lang]}
                            </p>

                            <div className="flex gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-current/5 ${theme.accentText}`}>
                                    <Star size={12} fill="currentColor" /> <span className="text-[10px] font-bold uppercase tracking-wider">Master</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-current/5 ${theme.accentText}`}>
                                    <User size={12} /> <span className="text-[10px] font-bold uppercase tracking-wider">Certified</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* --- RIGHT: BOOKING ENGINE (LAYOUT ANIMATIONS) --- */}
                    <div className="lg:col-span-8">
                        {/* Pass isSpecial prop implicitly via modified price display inside component or pass monk for accurate check */}
                        <ServiceTicket
                            service={{
                                ...service,
                                price: selectedMonk?.isSpecial
                                    ? 88800
                                    : 50000
                            }}
                            monkName={selectedMonk?.name?.[lang]}
                            theme={theme}
                            lang={lang}
                        />

                        <motion.div
                            variants={itemVar}
                            layout
                            className={`relative rounded-[40px] border backdrop-blur-3xl overflow-hidden shadow-2xl ${theme.glassPanel}`}
                        >
                            <div className="p-8 md:p-12 space-y-12">
                                <AnimatePresence mode="wait">
                                    {isBooked ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-12 text-center"
                                        >
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                                className="w-24 h-24 mx-auto bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg mb-6 relative"
                                            >
                                                <Hourglass size={48} />
                                                {/* Pending Pulse */}
                                                <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full bg-amber-500 z-[-1]" />
                                            </motion.div>
                                            <h2 className={`text-3xl font-serif font-bold mb-4 ${theme.text}`}>{t({ mn: "Захиалга Админд Илгээгдлээ", en: "Request Sent to Admin" })}</h2>
                                            <p className={`opacity-60 mb-8 ${theme.text}`}>{t({ mn: "Төлбөр төлөгдсөний дараа таны захиалга баталгаажих болно.", en: "Your request has been sent. It will be accepted after payment verification." })}</p>

                                            {/* --- BANK DETAILS SECTION --- */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className={`max-w-md mx-auto mb-8 p-6 rounded-2xl border text-left space-y-4 relative overflow-hidden ${isNight ? "bg-black/5 border-black/5" : "bg-black/5 border-black/5"}`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`p-2 rounded-full ${isNight ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/20 text-amber-600"}`}>
                                                        <Shield size={18} />
                                                    </div>
                                                    <h3 className={`font-bold uppercase tracking-wider text-xs ${theme.text}`}>
                                                        {t({ mn: "Төлбөрийн Мэдээлэл", en: "Payment Details" })}
                                                    </h3>
                                                </div>

                                                <div className={`space-y-3 text-sm ${theme.text}`}>
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
                                                                className={`p-1.5 rounded-md hover:bg-black/10 transition-colors ${theme.accentText}`}
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
                                                        <span className={`font-bold ${theme.accentText}`}>
                                                            {selectedMonk?.isSpecial
                                                                ? "88,800"
                                                                : "50,000"}₮
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={`text-[10px] opacity-50 mt-4 pt-4 border-t ${theme.borderColor}`}>
                                                    {t({
                                                        mn: "Гүйлгээний утга дээр утасны дугаараа бичнэ үү.",
                                                        en: "Please include your phone number in the transaction description."
                                                    })}
                                                </div>
                                            </motion.div>

                                            <Link href="/">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-10 py-3 rounded-full font-bold uppercase tracking-widest text-xs ${isNight ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                                    {t({ mn: "Нүүр хуудас", en: "Return Home" })}
                                                </motion.button>
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <motion.div layout className="space-y-10">

                                            {/* MONK SELECTION (STEP 0) */}
                                            {monks.length > 1 && (
                                                <section className="mb-10">
                                                    <h4 className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-6 ${theme.text}`}>
                                                        <User size={14} /> {t({ mn: "Багш сонгох", en: "Select Guide" })}
                                                    </h4>
                                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mask-fade">
                                                        {monks.map((m, idx) => (
                                                            <motion.button
                                                                key={m._id?.toString() || idx}
                                                                onClick={() => { setSelectedMonk(m); setSelectedDateIndex(null); setSelectedTime(null); }}
                                                                whileHover={{ y: -5 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className={`relative flex-shrink-0 w-48 p-4 rounded-2xl border transition-all text-left group overflow-hidden ${selectedMonk?._id === m._id ? theme.slotActive : theme.glassPanel}`}
                                                            >
                                                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                                                    <img src={m.image} alt={m.name?.[lang]} className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                                                                    <div>
                                                                        <div className="flex items-center gap-1">
                                                                            <p className="text-[10px] font-bold uppercase opacity-70">{m.title?.[lang]}</p>
                                                                            {m.isSpecial && (
                                                                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 font-black uppercase">Special</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="font-serif font-bold leading-tight line-clamp-1">{m.name?.[lang]}</p>
                                                                    </div>
                                                                </div>
                                                                {selectedMonk?._id === m._id && (
                                                                    <motion.div layoutId="activeMonkRing" className="absolute inset-0 border-2 border-white/50 rounded-2xl z-20" />
                                                                )}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {/* DATE SELECTION */}
                                            <section>
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-60 ${theme.text}`}>
                                                        <Calendar size={14} /> {t({ mn: "I. Өдөр Сонгох", en: "I. Select Date" })}
                                                    </h4>
                                                </div>
                                                {/* Drag Constraints removed for simple scroll, smoother experience */}
                                                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mask-fade">
                                                    <motion.div className="flex gap-4">
                                                        {dates.map((d, i) => (
                                                            <motion.button
                                                                key={i}
                                                                layout
                                                                variants={itemVar}
                                                                whileHover={{ y: -5 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => { setSelectedDateIndex(i); setSelectedTime(null); }}
                                                                className={`
                                                    relative shrink-0 w-20 h-28 rounded-2xl flex flex-col items-center justify-center transition-colors duration-300 border-2
                                                    ${selectedDateIndex === i ? theme.slotActive : theme.slotDefault}
                                                `}
                                                            >
                                                                <span className="text-[10px] font-bold uppercase mb-1 opacity-70 relative z-10">{d.week}</span>
                                                                <span className="text-3xl font-serif font-bold relative z-10">{d.day}</span>

                                                                {selectedDateIndex === i && (
                                                                    <motion.div
                                                                        layoutId="activeDateDot"
                                                                        className="absolute bottom-3 w-1.5 h-1.5 bg-white rounded-full z-10"
                                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                                    />
                                                                )}
                                                            </motion.button>
                                                        ))}
                                                    </motion.div>
                                                </div>
                                            </section>

                                            {/* TIME SELECTION */}
                                            <AnimatePresence>
                                                {selectedDateIndex !== null && (
                                                    <motion.section
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="space-y-6 overflow-hidden safari-gpu"
                                                    >
                                                        <h4 className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-60 ${theme.text}`}>
                                                            <Clock size={14} /> {t({ mn: "II. Цаг Сонгох", en: "II. Select Time" })}
                                                        </h4>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                            {times.map((time, idx) => {
                                                                const isTaken = takenSlots.includes(time);
                                                                return (
                                                                    <motion.button
                                                                        key={time}
                                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: idx * 0.05 }}
                                                                        disabled={isTaken}
                                                                        onClick={() => setSelectedTime(time)}
                                                                        className={`
                                                            py-4 rounded-xl text-xs font-bold border transition-all relative overflow-hidden group
                                                            ${selectedTime === time ? theme.slotActive : isTaken ? theme.slotDisabled : theme.slotDefault}
                                                        `}
                                                                    >
                                                                        <span className="relative z-10">{time}</span>

                                                                        {selectedTime === time && (
                                                                            <motion.div
                                                                                layoutId="activeTime"
                                                                                className="absolute inset-0 bg-white/20 z-0"
                                                                                transition={{ duration: 0.3 }}
                                                                            />
                                                                        )}

                                                                        {isTaken && (
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <div className="w-[80%] h-[1px] bg-current opacity-50 rotate-45" />
                                                                            </div>
                                                                        )}
                                                                    </motion.button>
                                                                )
                                                            })}
                                                        </div>
                                                    </motion.section>
                                                )}
                                            </AnimatePresence>

                                            {/* USER FORM */}
                                            <AnimatePresence>
                                                {selectedTime && (
                                                    <motion.section
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`space-y-8 pt-8 border-t ${theme.borderColor} safari-gpu`}
                                                    >
                                                        <div className={`rounded-2xl border ${theme.borderColor} p-1`}>
                                                            <InfoItem
                                                                icon={<Shield size={14} />}
                                                                title={t({ mn: "Бэлтгэл", en: "Protocol" })}
                                                                text={t({ mn: "Та тайван орчинд, өөрийгөө бэлдсэн байх хэрэгтэй.", en: "Ensure you are in a quiet space. Center your mind prior to the session." })}
                                                                theme={theme}
                                                            />
                                                            <InfoItem
                                                                icon={<Info size={14} />}
                                                                title={t({ mn: "Нууцлал", en: "Privacy" })}
                                                                text={t({ mn: "Таны мэдээлэл бүрэн нууцлагдана.", en: "All sessions are strictly confidential." })}
                                                                theme={theme}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <input value={userName} onChange={e => setUserName(e.target.value)} className={`w-full p-4 rounded-xl border outline-none font-serif text-sm transition-all focus:scale-[1.01] ${theme.input}`} placeholder={t({ mn: "Таны Нэр", en: "Full Name" })} />
                                                            <div className="relative">
                                                                <input value={userPhone} onChange={e => setUserPhone(e.target.value)} className={`w-full p-4 pl-12 rounded-xl border outline-none font-serif text-sm transition-all focus:scale-[1.01] ${theme.input}`} placeholder={t({ mn: "Утасны дугаар (99112233)", en: "Phone Number" })} />
                                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                                                            </div>
                                                            <input value={userEmail} onChange={e => setUserEmail(e.target.value)} className={`w-full p-4 rounded-xl border outline-none font-serif text-sm transition-all focus:scale-[1.01] ${theme.input}`} placeholder={t({ mn: "И-мэйл (Заавал биш)", en: "Email Address (Optional)" })} />
                                                        </div>
                                                        <textarea value={userNote} onChange={e => setUserNote(e.target.value)} className={`w-full p-4 rounded-xl border outline-none font-serif h-24 resize-none transition-all focus:scale-[1.01] ${theme.input}`} placeholder={t({ mn: "Хүсэлт / Зорилго...", en: "Intention or questions..." })} />

                                                        {isSignedIn ? (
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                                onClick={handleBooking} disabled={!userName || !userPhone || isSubmitting}
                                                                className={`w-full h-16 rounded-2xl overflow-hidden relative group mt-4 shadow-xl ${!userName || !userPhone ? 'opacity-50 grayscale' : ''}`}
                                                            >
                                                                <div className={`absolute inset-0 bg-gradient-to-r ${theme.btnGradient}`} />

                                                                {/* Button Cinematic Shine Effect */}
                                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />

                                                                <div className="relative z-10 flex items-center justify-center gap-3 text-white h-full font-black uppercase tracking-[0.2em] text-sm">
                                                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <> <Sparkles size={18} /> {t({ mn: "Баталгаажуулах", en: "Confirm Booking" })} <ArrowRight size={18} /></>}
                                                                </div>
                                                            </motion.button>
                                                        ) : (
                                                            <Link href="/sign-in" className="block w-full">
                                                                <motion.button whileHover={{ scale: 1.02 }} className="w-full h-14 rounded-2xl bg-zinc-800 text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 transition-colors">
                                                                    {t({ mn: "Нэвтэрч захиалга өгөх", en: "Sign In to Book" })}
                                                                </motion.button>
                                                            </Link>
                                                        )}
                                                    </motion.section>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}