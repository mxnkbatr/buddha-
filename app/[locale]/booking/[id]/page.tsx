"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Calendar as CalIcon, Clock, CheckCircle2, Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NativeBookingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const serviceId = Array.isArray(params.id) ? params.id[0] : params.id;
    const monkId = searchParams.get("monkId");

    const { language: lang, t } = useLanguage();
    const { user } = useAuth();
    const isSignedIn = !!user;

    const [monk, setMonk] = useState<any>(null);
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    // Form states
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    // Submission states
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Calendar view state
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        async function fetchBookings() {
            if (!monkId || !selectedDate) return;
            setFetchingSlots(true);
            try {
                const d = selectedDate.toISOString().split('T')[0];
                const res = await fetch(`/api/bookings?monkId=${monkId}&date=${d}`);
                if (res.ok) {
                    const data = await res.json();
                    setBookedSlots(data.map((b: any) => b.time));
                }
            } catch (e) { console.error(e); }
            finally { setFetchingSlots(false); }
        }
        fetchBookings();
    }, [monkId, selectedDate]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user) return;
        setSubmitting(true);
        setSubmitError("");
        
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    monkId,
                    serviceId,
                    date: selectedDate.toISOString().split('T')[0],
                    time: selectedTime,
                    userId: user._id || user.id,
                    userEmail: user.email,
                    userPhone: user.phone,
                    serviceName: service?.name,
                    notes: "",
                }),
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Booking failed");
            }
            
            setSubmitted(true);
            setTimeout(() => router.push(`/${lang}/profile`), 2500);
        } catch (err: any) {
            setSubmitError(err.message || t({ mn: "Алдаа гарлаа", en: "Booking failed" }));
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        async function loadData() {
            if (!serviceId || !monkId) return;
            try {
                const [sRes, mRes] = await Promise.all([
                    fetch(`/api/services/${serviceId}`),
                    fetch(`/api/monks/${monkId}`)
                ]);
                const sData = await sRes.json();
                const mData = await mRes.json();
                const finalPrice = mData.isSpecial ? 88800 : (sData.price || 45000);
                setService({ ...sData, price: finalPrice });
                setMonk(mData);
                setSelectedDate(new Date());
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        }
        loadData();
    }, [serviceId, monkId]);

    // Calendar generation
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; 
    };

    const calendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        let grid = [];
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let i = 1; i <= days; i++) grid.push(new Date(year, month, i));
        return grid;
    }, [currentMonth]);

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const availableTimes = useMemo(() => {
        const defaultSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
        const baseSlots = (monk?.schedule) ? (() => {
            const today = selectedDate || new Date();
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = dayNames[today.getDay()];
            const daySchedule = monk.schedule.find((s: any) => s.day === dayName && s.active !== false);
            if (!daySchedule) return [];
            if (daySchedule.slots?.length > 0) return daySchedule.slots;
            const slots: string[] = [];
            const startH = parseInt(daySchedule.start?.split(":")[0] || "9");
            const endH = parseInt(daySchedule.end?.split(":")[0] || "18");
            for (let h = startH; h < endH; h++) slots.push(`${h.toString().padStart(2, "0")}:00`);
            return slots;
        })() : defaultSlots;

        return baseSlots.filter((time: string) => !bookedSlots.includes(time));
    }, [monk, selectedDate, bookedSlots]);

    const morningSlots = availableTimes.filter((sl: string) => parseInt(sl.split(':')[0]) < 13);
    const afternoonSlots = availableTimes.filter((sl: string) => parseInt(sl.split(':')[0]) >= 13);

    if (submitted) return (
        <div className="min-h-[100svh] bg-cream flex flex-col items-center justify-center px-6 text-center">
            <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 rounded-[2.5rem] bg-live/10 flex items-center justify-center mb-8 border-4 border-white shadow-xl"
            >
                <CheckCircle2 size={48} className="text-live" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-3xl font-black text-ink mb-3 tracking-tight">
                    {t({ mn: "Захиалга баталгаажлаа", en: "Sacred Slot Confirmed" })}
                </h2>
                <p className="text-[15px] font-medium text-earth/60 leading-relaxed max-w-[280px]">
                    {t({ mn: "Таны захиалгын мэдээлэл самбар дээр харагдаж байна.", en: "Your ritual session has been successfully added to your dashboard." })}
                </p>
            </motion.div>
        </div>
    );

    if (loading || !monk || !service) {
        return <div className="h-[100svh] w-full flex items-center justify-center bg-cream"><div className="w-10 h-10 rounded-2xl border-4 border-gold border-t-transparent animate-spin" /></div>;
    }

    const monkName = monk.name?.[lang] || monk.name?.mn || monk.name?.en || "Багш";
    const serviceName = service.name?.[lang] || service.title?.[lang] || service.name?.mn || "Үйлчилгээ";

    return (
        <div className="min-h-[100svh] bg-cream flex flex-col relative pb-40 overflow-x-hidden hide-scrollbar">
            
            {/* ── PREMIUM STICKY HEADER ── */}
            <div className="px-6 pt-[max(env(safe-area-inset-top, 0px), 16px)] pb-6 flex items-center gap-5 border-b border-stone/30 bg-cream/80 backdrop-blur-3xl z-40 sticky top-0">
                <button 
                    onClick={() => router.back()}
                    className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-stone/40 flex items-center justify-center shrink-0 active:scale-95 transition-all"
                >
                    <ChevronLeft className="text-ink" size={24} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-[17px] font-black text-ink truncate leading-tight">{t({ mn: "Цаг захиалах", en: "Book Session" })}</h1>
                    <p className="text-[12px] font-bold text-gold uppercase tracking-[0.1em] truncate mt-1">{monkName} · {serviceName}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-stone flex items-center justify-center shrink-0">
                    <CalIcon size={20} className="text-ink" />
                </div>
            </div>

            <div className="px-6 pt-8 flex-1">
                
                {/* ── INTERACTIVE CALENDAR ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="app-card-premium p-6 mb-10 !rounded-[2.5rem] bg-white/50 border border-stone/30"
                >
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-[17px] font-black text-ink tracking-tight">
                            {currentMonth.getFullYear()} оны {currentMonth.getMonth() + 1}-р сар
                        </h2>
                        <div className="flex gap-3">
                            <button onClick={prevMonth} className="w-9 h-9 rounded-[1.2rem] bg-white border border-stone/50 flex items-center justify-center hover:bg-stone/20 active:scale-90 transition-all">
                                <ChevronLeft size={18} className="text-earth" />
                            </button>
                            <button onClick={nextMonth} className="w-9 h-9 rounded-[1.2rem] bg-white border border-stone/50 flex items-center justify-center hover:bg-stone/20 active:scale-90 transition-all">
                                <ChevronRight size={18} className="text-earth" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center">
                        {["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"].map(day => (
                            <div key={day} className="text-[11px] font-black text-earth/30 uppercase tracking-widest mb-4">{day}</div>
                        ))}
                        {calendarGrid.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} />;
                            
                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                            const isPast = date < new Date(new Date().setHours(0,0,0,0));
                            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            const dayName = dayNames[date.getDay()];
                            const hasSlot = !isPast && monk?.schedule?.some((s: any) => 
                              s.day === dayName && s.active !== false
                            );

                            return (
                                <div key={idx} className="flex flex-col items-center justify-center">
                                    <button 
                                        disabled={isPast || !hasSlot}
                                        onClick={() => setSelectedDate(date)}
                                        className={`w-11 h-11 rounded-[1.5rem] flex items-center justify-center text-[15px] font-black transition-all ${
                                            isSelected 
                                            ? "bg-ink text-white shadow-xl scale-110" : 
                                            isPast || !hasSlot 
                                            ? "text-earth/10 opacity-30 cursor-not-allowed" : "text-ink hover:bg-stone/50"
                                        }`}
                                    >
                                        {date.getDate()}
                                    </button>
                                    {hasSlot && !isSelected && !isPast && (
                                        <div className="w-1 h-1 rounded-full bg-gold mt-1" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── TIME SLOT SELECTION ── */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10 px-2"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={16} className="text-gold" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-earth">БОЛОМЖИТ ЦАГУУД</h3>
                    </div>

                    <div className="space-y-8">
                        {morningSlots.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-earth/30 uppercase tracking-widest mb-4">Өглөө</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {morningSlots.map((time: string) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 rounded-[1.5rem] text-[14px] font-black border-2 transition-all ${
                                                selectedTime === time 
                                                ? "bg-ink border-ink text-white shadow-lg scale-105" 
                                                : "bg-white border-stone/50 text-ink shadow-sm hover:border-gold/30"
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {afternoonSlots.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-earth/30 uppercase tracking-widest mb-4">Үдээс хойш</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {afternoonSlots.map((time: string) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 rounded-[1.5rem] text-[14px] font-black border-2 transition-all ${
                                                selectedTime === time 
                                                ? "bg-ink border-ink text-white shadow-lg scale-105" 
                                                : "bg-white border-stone/50 text-ink shadow-sm hover:border-gold/30"
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {availableTimes.length === 0 && !fetchingSlots && (
                            <div className="py-12 bg-stone/20 rounded-[2.5rem] border border-dashed border-stone/60 text-center">
                                <p className="text-[14px] font-bold text-earth/40 italic">
                                    {t({ mn: "Боломжит цаг олдсонгүй", en: "No available slots for this day" })}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── SUMMARY CARD ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="app-card-premium p-6 mb-10 !rounded-[2.5rem] bg-white border border-stone/10"
                >
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone/20">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cream flex items-center justify-center text-gold">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-ink">{serviceName}</p>
                                <p className="text-[11px] font-bold text-earth/40">{service.duration || "60 min"}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <p className="text-[17px] font-black text-gold">₮{Number(service.price).toLocaleString()}</p>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-earth/30 uppercase tracking-widest mb-1">Огноо</span>
                            <span className="text-[14px] font-black text-ink">{selectedDate ? selectedDate.toLocaleDateString() : "--"}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black text-earth/30 uppercase tracking-widest mb-1">Цаг</span>
                            <span className="text-[14px] font-black text-ink">{selectedTime || "--:--"}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── STICKY CHECKOUT ── */}
            <div 
                className="fixed left-0 w-full px-6 pt-4 pb-5 bg-white/100 backdrop-blur-3xl border-t border-stone/30 z-50"
                style={{ bottom: "calc(var(--tab-bar-height, 83px) + var(--sab, 0px))" }}
            >
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime || submitting}
                  className="w-full h-16 bg-ink text-white text-[16px] font-black rounded-[2.2rem] shadow-xl shadow-ink/20 flex items-center justify-center disabled:opacity-30 transition-all"
                >
                    {submitting 
                        ? <Loader2 size={24} className="animate-spin" /> 
                        : t({ mn: "Захиалгыг баталгаажуулах", en: "Proceed to Ritual" })}
                </motion.button>
                {submitError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-red-500 text-center mt-3 font-black uppercase tracking-widest">{submitError}</motion.p>
                )}
            </div>
        </div>
    );
}