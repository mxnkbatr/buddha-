"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Sparkles, Clock, Calendar as CalIcon, X, AlertCircle } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
  _id: string;
  id?: string;
  name?: { mn: string; en: string };
  title?: { mn: string; en: string };
  description?: { mn: string; en: string };
  price: number;
  duration?: string;
  image?: string;
}

interface Monk {
  _id: string;
  name: { mn: string; en: string };
  image: string;
  title?: { mn: string; en: string };
  services?: Service[];
  schedule?: Array<{ day: string; active?: boolean; start?: string; end?: string; slots?: string[] }>;
  isSpecial?: boolean;
}

// ─── Confetti Component ───────────────────────────────────────────────────────
function Confetti() {
  const colors = ["#D97706", "#059669", "#3B82F6", "#EC4899", "#8B5CF6", "#F59E0B"];
  const pieces = Array.from({ length: 50 });
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{
            background: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: "-10px",
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720 - 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 1.5,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language: lang, t } = useLanguage();
  const { user } = useAuth();

  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const monkId = searchParams.get("monkId");

  // ── State ──
  const [monk, setMonk] = useState<Monk | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"select" | "confirm" | "success" | "error">("select");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Fetch Monk + Services in parallel ──
  useEffect(() => {
    if (!monkId) return;
    (async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          fetch(`/api/monks/${monkId}`),
          fetch(`/api/services?monkId=${monkId}`).catch(() => ({ ok: false } as any)),
        ]);
        const mData: Monk = await mRes.json();
        setMonk(mData);

        // Build services list: monk embedded services OR external services collection
        let services: Service[] = [];
        if (sRes.ok) {
          const sData = await sRes.json();
          if (Array.isArray(sData) && sData.length > 0) services = sData;
        }
        // Fallback: embedded monk.services
        if (services.length === 0 && mData.services?.length) {
          services = mData.services.map((s: any) => ({
            ...s,
            _id: s._id || s.id || `${s.name?.mn}`,
            price: mData.isSpecial ? 88800 : (s.price || 45000),
          }));
        }
        // Fallback: if bookingId is a valid serviceId
        if (services.length === 0 && bookingId && bookingId.length > 10) {
          const r = await fetch(`/api/services/${bookingId}`).catch(() => null);
          if (r?.ok) {
            const sd = await r.json();
            services = [{ ...sd, price: mData.isSpecial ? 88800 : (sd.price || 45000) }];
          }
        }
        setAllServices(services);
        if (services.length > 0) setSelectedService(services[0]);
      } catch (e) {
        console.error("Failed to load booking data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [monkId, bookingId]);

  // ── Fetch booked slots when date changes ──
  useEffect(() => {
    if (!monkId || !selectedDate) return;
    setFetchingSlots(true);
    setSelectedTime(null);
    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch(`/api/bookings?monkId=${monkId}&date=${dateStr}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setBookedSlots(Array.isArray(data) ? data : []))
      .catch(() => setBookedSlots([]))
      .finally(() => setFetchingSlots(false));
  }, [monkId, selectedDate]);

  // ── Calendar grid ──
  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = (() => { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; })();
    const grid: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let i = 1; i <= days; i++) grid.push(new Date(year, month, i));
    return grid;
  }, [currentMonth]);

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const isDayAvailable = useCallback((date: Date) => {
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    if (isPast) return false;
    if (!monk?.schedule) return true;
    const dayName = DAY_NAMES[date.getDay()];
    return monk.schedule.some(s => s.day === dayName && s.active !== false);
  }, [monk]);

  // ── Available time slots ──
  const availableTimes = useMemo(() => {
    const defaultSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    let slots: string[] = [];

    if (monk?.schedule) {
      const dayName = DAY_NAMES[selectedDate.getDay()];
      const daySchedule = monk.schedule.find(s => s.day === dayName && s.active !== false);
      if (daySchedule?.slots?.length) {
        slots = daySchedule.slots;
      } else if (daySchedule) {
        const startH = parseInt(daySchedule.start?.split(":")[0] || "9");
        const endH = parseInt(daySchedule.end?.split(":")[0] || "18");
        for (let h = startH; h < endH; h++) slots.push(`${h.toString().padStart(2, "0")}:00`);
      }
    } else {
      slots = defaultSlots;
    }

    return slots.filter(t => !bookedSlots.includes(t));
  }, [monk, selectedDate, bookedSlots]);

  // First available time highlight
  const firstAvailable = availableTimes[0];

  // ── Submit booking ──
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !user || !selectedService) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monkId,
          serviceId: selectedService._id || selectedService.id,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
          userId: user._id || user.id,
          userName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email,
          userEmail: user.email,
          userPhone: user.phone || "",
          serviceName: selectedService.name || selectedService.title,
          note: "",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Booking failed");
      }

      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message || t({ mn: "Алдаа гарлаа", en: "Booking failed" }));
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Add to Calendar ──
  const addToCalendar = () => {
    if (!selectedDate || !selectedTime || !monk || !selectedService) return;
    const dateStr = selectedDate.toISOString().split("T")[0].replace(/-/g, "");
    const [h, m] = selectedTime.split(":").map(Number);
    const duration = parseInt(selectedService.duration || "60");
    const endH = h + Math.floor(duration / 60);
    const endM = m + (duration % 60);
    const start = `${dateStr}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
    const end = `${dateStr}T${String(endH).padStart(2, "0")}${String(endM).padStart(2, "0")}00`;
    const monkName = monk.name?.[lang as "mn" | "en"] || monk.name?.mn;
    const svcName = selectedService.name?.[lang as "mn" | "en"] || selectedService.name?.mn || "Засал";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${svcName} — ${monkName}`)}&dates=${start}/${end}&details=${encodeURIComponent("Gevabal - Буддын духовн платформ")}`;
    window.open(url, "_blank");
  };

  // ═══════════════════════════════════════════════════════════
  // SUCCESS screen
  // ═══════════════════════════════════════════════════════════
  if (step === "success") {
    const monkName = monk?.name?.[lang as "mn" | "en"] || monk?.name?.mn || "Багш";
    const svcName = selectedService?.name?.[lang as "mn" | "en"] || selectedService?.name?.mn || "Засал";
    return (
      <div className="min-h-[100svh] bg-cream flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <Confetti />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-28 h-28 rounded-[2.5rem] bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mb-8 shadow-xl"
        >
          <CheckCircle2 size={56} className="text-emerald-500" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-[28px] font-black text-ink mb-3 tracking-tight">
            {t({ mn: "Захиалга амжилттай!", en: "Booking Confirmed!" })}
          </h2>
          <p className="text-[15px] text-earth/60 leading-relaxed max-w-[280px] mx-auto mb-8">
            {t({ mn: `${monkName} багштай ${svcName} засал захиалагдлаа.`, en: `Your session with ${monkName} has been booked.` })}
          </p>

          {/* Summary pill */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone/20 mb-8 text-left max-w-[320px] mx-auto">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone/20">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-stone/20">
                <Image src={monk?.image || "/default-monk.jpg"} alt={monkName} width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[15px] font-black text-ink">{monkName}</p>
                <p className="text-[12px] font-bold text-gold">{svcName}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-earth/40 uppercase">{t({ mn: "Огноо", en: "Date" })}</p>
                <p className="text-[14px] font-black text-ink">{selectedDate?.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US")}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-earth/40 uppercase">{t({ mn: "Цаг", en: "Time" })}</p>
                <p className="text-[14px] font-black text-ink">{selectedTime}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-earth/40 uppercase">{t({ mn: "Үнэ", en: "Price" })}</p>
                <p className="text-[14px] font-black text-gold">₮{Number(selectedService?.price || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-[320px] mx-auto">
            <button
              onClick={addToCalendar}
              className="w-full py-4 rounded-[1.8rem] bg-white border-2 border-stone/40 font-black text-[15px] text-ink active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CalIcon size={18} className="text-gold" />
              {t({ mn: "📅 Calendar-т нэмэх", en: "📅 Add to Calendar" })}
            </button>
            <button
              onClick={() => router.push(`/${lang}/profile`)}
              className="w-full py-4 rounded-[1.8rem] bg-ink font-black text-[15px] text-white active:scale-95 transition-all"
            >
              {t({ mn: "Профайл руу буцах", en: "Go to Profile" })}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LOADING skeleton
  // ═══════════════════════════════════════════════════════════
  if (loading || !monk) {
    return (
      <div className="min-h-[100svh] bg-cream px-5 pt-[calc(env(safe-area-inset-top,44px)+16px)]">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-11 h-11" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex gap-3 overflow-hidden mb-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 w-40 shrink-0" />)}
        </div>
        <Skeleton className="h-80 w-full mb-6" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  const monkName = monk.name?.[lang as "mn" | "en"] || monk.name?.mn || "Багш";
  const selectedSvcName = selectedService?.name?.[lang as "mn" | "en"] || selectedService?.name?.mn || "Үйлчилгээ";
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-[100svh] bg-cream flex flex-col">

      {/* ── STICKY HEADER ── */}
      <header
        className="px-5 pb-4 flex items-center gap-4 bg-cream/90 backdrop-blur-xl border-b border-stone/20 sticky top-0 z-30"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 44px) + 10px)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-stone/30 flex items-center justify-center shrink-0 active:scale-90 transition-all"
        >
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-stone/20 shrink-0">
            <Image src={monk.image || "/default-monk.jpg"} alt={monkName} width={44} height={44} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[16px] font-black text-ink truncate">{t({ mn: "Цаг захиалах", en: "Book Session" })}</h1>
            <p className="text-[12px] font-bold text-gold truncate">{monkName}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-40">

        {/* ══ SECTION 1: SERVICE SELECTION ══ */}
        {allServices.length > 0 && (
          <div className="pt-6 pb-2">
            <p className="text-[11px] font-black text-earth/40 uppercase tracking-[0.2em] px-5 mb-4">
              {t({ mn: "1. Үйлчилгээ сонгох", en: "1. Choose Service" })}
            </p>
            <div className="flex gap-3 overflow-x-auto pl-5 pr-5 pb-2 scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
              {allServices.map(svc => {
                const isSelected = selectedService?._id === svc._id || selectedService?.id === svc.id;
                const svcName = svc.name?.[lang as "mn" | "en"] || svc.name?.mn || svc.title?.[lang as "mn" | "en"] || svc.title?.mn || "Үйлчилгээ";
                return (
                  <motion.button
                    key={svc._id || svc.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setSelectedService(svc); setSelectedTime(null); }}
                    className={`shrink-0 w-44 rounded-3xl border-2 overflow-hidden text-left transition-all ${
                      isSelected
                        ? "border-gold shadow-[0_0_0_4px_rgba(217,119,6,0.12)] bg-white"
                        : "border-stone/30 bg-white/70"
                    }`}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {svc.image && (
                      <div className="w-full h-24 overflow-hidden bg-stone/20">
                        <Image src={svc.image} alt={svcName} width={176} height={96} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[13px] font-black text-ink leading-tight line-clamp-2 flex-1">{svcName}</p>
                        {isSelected && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                            <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-[18px] font-black text-gold leading-none">₮{Number(svc.price).toLocaleString()}</p>
                      {svc.duration && (
                        <p className="text-[11px] font-bold text-earth/50 mt-1">
                          <Clock size={10} className="inline mr-1" />{svc.duration}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ SECTION 2: CALENDAR ══ */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[11px] font-black text-earth/40 uppercase tracking-[0.2em] mb-4">
            {t({ mn: "2. Огноо сонгох", en: "2. Pick a Date" })}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-5 border border-stone/20 shadow-sm"
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="w-9 h-9 rounded-xl bg-stone/20 flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronLeft size={18} className="text-earth" />
              </button>
              <h2 className="text-[16px] font-black text-ink">
                {currentMonth.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US", { year: "numeric", month: "long" })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="w-9 h-9 rounded-xl bg-stone/20 flex items-center justify-center active:scale-90 transition-all"
              >
                <ChevronRight size={18} className="text-earth" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-3">
              {(lang === "mn"
                ? ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"]
                : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
              ).map(d => (
                <div key={d} className="text-center text-[11px] font-black text-earth/30 uppercase tracking-wider pb-2">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-1.5 gap-x-0.5">
              {calendarGrid.map((date, idx) => {
                if (!date) return <div key={`e-${idx}`} />;
                const isSelected = date.toDateString() === selectedDate?.toDateString();
                const isToday = date.toDateString() === today.toDateString();
                const available = isDayAvailable(date);
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                      <motion.button
                        whileTap={available ? { scale: 0.9 } : {}}
                        onClick={() => available && setSelectedDate(date)}
                        disabled={!available}
                        className={`w-10 h-10 rounded-[0.9rem] flex items-center justify-center text-[14px] font-black transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-gold to-amber-600 text-white shadow-gold"
                            : isToday && !isSelected
                            ? "border-2 border-gold text-gold"
                            : !available
                            ? "text-earth/20 cursor-not-allowed bg-transparent"
                            : "text-ink hover:bg-stone/30"
                        }`}
                      >
                        {date.getDate()}
                      </motion.button>
                    </AnimatePresence>
                    {available && !isSelected && (
                      <div className="w-1 h-1 rounded-full bg-gold/60 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ══ SECTION 3: TIME SLOTS ══ */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[11px] font-black text-earth/40 uppercase tracking-[0.2em] mb-4">
            {t({ mn: "3. Цаг сонгох", en: "3. Choose Time" })}
          </p>

          {fetchingSlots ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="py-10 bg-stone/10 rounded-[2rem] border border-dashed border-stone/40 text-center">
              <Clock size={28} className="text-earth/30 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-earth/40">
                {t({ mn: "Боломжит цаг олдсонгүй", en: "No available slots" })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* All slots — both booked and available */}
              {(() => {
                const allSlots = monk?.schedule
                  ? (() => {
                      const dayName = DAY_NAMES[selectedDate.getDay()];
                      const daySchedule = monk.schedule?.find(s => s.day === dayName && s.active !== false);
                      if (!daySchedule) return availableTimes;
                      if (daySchedule.slots?.length) return daySchedule.slots;
                      const startH = parseInt(daySchedule.start?.split(":")[0] || "9");
                      const endH = parseInt(daySchedule.end?.split(":")[0] || "18");
                      const s = [];
                      for (let h = startH; h < endH; h++) s.push(`${h.toString().padStart(2, "0")}:00`);
                      return s;
                    })()
                  : ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

                return allSlots.map(time => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;
                  const isFirst = time === firstAvailable && !selectedTime;
                  const durationMins = parseInt(selectedService?.duration || "60");

                  return (
                    <motion.button
                      key={time}
                      whileTap={!isBooked ? { scale: 0.93 } : {}}
                      disabled={isBooked}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      className={`relative rounded-[1.5rem] py-4 px-2 flex flex-col items-center justify-center gap-1 transition-all border-2 ${
                        isBooked
                          ? "bg-stone/20 border-stone/20 cursor-not-allowed opacity-50"
                          : isSelected
                          ? "bg-gradient-to-br from-gold to-amber-600 border-gold text-white shadow-[0_4px_20px_rgba(217,119,6,0.35)]"
                          : isFirst
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-white border-stone/30 text-ink hover:border-gold/30 hover:shadow-sm"
                      }`}
                    >
                      {isFirst && !selectedTime && (
                        <div className="absolute -top-2 -right-1 bg-gold text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          ✦
                        </div>
                      )}
                      <span className={`text-[15px] font-black ${isBooked ? "line-through opacity-50" : ""}`}>
                        {time}
                      </span>
                      <span className={`text-[10px] font-bold ${isSelected ? "text-white/70" : "text-earth/40"}`}>
                        {durationMins} {t({ mn: "мин", en: "min" })}
                      </span>
                    </motion.button>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* ══ SECTION 4: SUMMARY CARD ══ */}
        <AnimatePresence>
          {selectedService && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-5 pt-6 pb-2"
            >
              <p className="text-[11px] font-black text-earth/40 uppercase tracking-[0.2em] mb-4">
                {t({ mn: "4. Баталгаажуулах", en: "4. Review & Confirm" })}
              </p>
              <div className="bg-white rounded-[2rem] border border-stone/20 shadow-sm overflow-hidden">
                {/* Monk banner */}
                <div className="flex items-center gap-4 p-5 border-b border-stone/10">
                  <div className="w-14 h-14 rounded-[1.2rem] overflow-hidden border-2 border-stone/20">
                    <Image src={monk.image || "/default-monk.jpg"} alt={monkName} width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-ink">{monkName}</p>
                    <p className="text-[12px] font-bold text-gold">{selectedSvcName}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[22px] font-black text-gold leading-none">₮{Number(selectedService.price).toLocaleString()}</p>
                    {selectedService.duration && (
                      <p className="text-[11px] text-earth/40 font-bold mt-0.5">{selectedService.duration}</p>
                    )}
                  </div>
                </div>

                {/* Date & Time row */}
                <div className="grid grid-cols-2 divide-x divide-stone/10">
                  <div className="p-5">
                    <p className="text-[10px] font-black text-earth/30 uppercase tracking-widest mb-1">
                      {t({ mn: "Огноо", en: "Date" })}
                    </p>
                    <p className="text-[15px] font-black text-ink">
                      {selectedDate.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US", { month: "short", day: "numeric", weekday: "short" })}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black text-earth/30 uppercase tracking-widest mb-1">
                      {t({ mn: "Цаг", en: "Time" })}
                    </p>
                    <p className="text-[15px] font-black text-ink">{selectedTime} · {selectedService.duration || "60 мин"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ STICKY CTA BUTTON ══ */}
      <div
        className="fixed left-0 right-0 px-5 pt-4 pb-3 bg-white/95 backdrop-blur-xl border-t border-stone/20 z-40"
        style={{ bottom: "calc(var(--tab-bar-height, 83px) + var(--sab, 0px))" }}
      >
        <AnimatePresence mode="wait">
          {step === "error" ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-3 mb-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-[13px] font-bold text-red-600">{errorMsg}</p>
              </div>
              <button
                onClick={() => { setStep("select"); setErrorMsg(""); }}
                className="w-full py-4 rounded-[1.8rem] bg-ink text-white font-black text-[16px] active:scale-95 transition-all"
              >
                {t({ mn: "Дахин оролдох", en: "Try Again" })}
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="confirm"
              whileTap={selectedDate && selectedTime && !submitting ? { scale: 0.97 } : {}}
              onClick={handleConfirm}
              disabled={!selectedService || !selectedDate || !selectedTime || submitting}
              className={`w-full h-16 rounded-[2rem] font-black text-[16px] flex items-center justify-center gap-2 transition-all ${
                selectedService && selectedDate && selectedTime && !submitting
                  ? "bg-gradient-to-r from-ink to-ink/90 text-white shadow-[0_4px_24px_rgba(26,15,5,0.3)]"
                  : "bg-stone/30 text-earth/40 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>{t({ mn: "Захиалж байна...", en: "Booking..." })}</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>{t({ mn: "Захиалга баталгаажуулах", en: "Confirm Booking" })}</span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}