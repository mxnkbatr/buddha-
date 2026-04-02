"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

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

    // Form states
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    // Calendar view state
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
                
                // Set default price logic 
                const finalPrice = mData.isSpecial ? 88800 : (sData.price || 45000);
                
                setService({ ...sData, price: finalPrice });
                setMonk(mData);
                
                // Select today by default
                setSelectedDate(new Date());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [serviceId, monkId]);

    // Calendar generation
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        // Adjust so Monday is 0 instead of Sunday being 0 for Mongolian calendar
        return day === 0 ? 6 : day - 1; 
    };

    const calendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        
        let grid = [];
        for (let i = 0; i < firstDay; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= days; i++) {
            grid.push(new Date(year, month, i));
        }
        return grid;
    }, [currentMonth]);

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    // Fixed dummy times per screenshot
    const availableTimes = ["09:00", "11:00", "14:00", "16:00"];

    if (loading || !monk || !service) {
        return <div className="h-screen w-full flex items-center justify-center bg-cream"><div className="w-8 h-8 rounded-full border-2 border-[#D97706] border-t-transparent animate-spin" /></div>;
    }

    const monkName = monk.name?.[lang] || monk.name?.mn || monk.name?.en || "Багш";
    const serviceName = service.name?.[lang] || service.title?.[lang] || service.name?.mn || "Үйлчилгээ";

    const formattedSelectedDate = selectedDate ? `${selectedDate.getFullYear()}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}` : "--";

    return (
        <div className="min-h-[100svh] bg-cream flex flex-col relative pb-32">
            {/* Header */}
            <div className="px-6 pt-[max(env(safe-area-inset-top),40px)] pb-6 flex items-center gap-4 border-b border-stone/50 bg-cream z-10 sticky top-0">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-[#F6F4F0] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                >
                    <ChevronLeft className="text-ink" size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-ink">{t({ mn: "Цаг захиалах", en: "Book Session" })}</h1>
                    <p className="text-[11px] font-medium text-earth">{monkName} · {serviceName}</p>
                </div>
            </div>

            <div className="px-6 pt-6 pb-24 flex-1">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-ink">
                        {currentMonth.getFullYear()} оны {currentMonth.getMonth() + 1}-р сар
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-[#F6F4F0] flex items-center justify-center active:bg-stone">
                            <ChevronLeft size={16} className="text-[#80766A]" />
                        </button>
                        <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-[#F6F4F0] flex items-center justify-center active:bg-stone">
                            <ChevronLeft size={16} className="text-[#80766A] rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"].map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-[#b7b0a7]">{day}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 mb-10">
                    {calendarGrid.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} />;
                        
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        const isPast = date < new Date(new Date().setHours(0,0,0,0));
                        // Dummy logic: mock available days 
                        const hasSlot = !isPast && date.getDate() % 2 === 0;

                        return (
                            <div key={idx} className="flex flex-col items-center justify-start h-10">
                                <button 
                                    disabled={isPast}
                                    onClick={() => setSelectedDate(date)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                                        isSelected ? "bg-[#D97706] text-white" : 
                                        isPast ? "text-[#D4CEC9]" : "text-ink"
                                    }`}
                                >
                                    {date.getDate()}
                                </button>
                                {/* Available indicator dot */}
                                {hasSlot && !isSelected && !isPast && (
                                    <div className="w-1 h-1 rounded-full bg-[#D97706] mt-1" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Time Selection */}
                <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#80766A] mb-4">ЦАГ СОНГОХ</h3>
                <div className="flex flex-wrap gap-2 mb-10">
                    {availableTimes.map(time => {
                        const isSelected = selectedTime === time;
                        return (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-5 py-2.5 rounded-2xl text-[14px] font-black border transition-colors ${
                                    isSelected ? "bg-[#1C1410] border-[#1C1410] text-[#FDFBF7]" : "bg-[#FDFBF7] border-stone/80 text-[#1C1410]"
                                }`}
                            >
                                {time}
                            </button>
                        );
                    })}
                </div>

                {/* Summary Card */}
                <div className="bg-[#FDFBF7] rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone/60 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[#80766A] text-[13px] font-medium">Огноо</span>
                        <span className="text-[#1C1410] font-bold text-[14px]">{formattedSelectedDate}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[#80766A] text-[13px] font-medium">Цаг</span>
                        <span className="text-[#1C1410] font-bold text-[14px]">{selectedTime || "--:--"}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 border-b border-stone/40 pb-4">
                        <span className="text-[#80766A] text-[13px] font-medium">Үргэлжлэх</span>
                        <span className="text-[#1C1410] font-bold text-[14px]">{service.duration || "60 мин"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#1C1410] font-black text-[14px]">Нийт</span>
                        <span className="text-[#D97706] font-black text-[18px]">₮{Number(service.price).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Fixed Checkout Button */}
            <div className="fixed bottom-0 left-0 w-full px-6 pt-3 pb-[max(env(safe-area-inset-bottom),24px)] bg-[#FDFBF7]/90 backdrop-blur-md border-t border-stone/40">
                <button 
                    disabled={!selectedDate || !selectedTime}
                    className="w-full bg-[#D97706] text-white rounded-[22px] py-[15px] font-bold text-[15px] disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(217,119,6,0.25)]"
                >
                    Баталгаажуулах
                </button>
            </div>
        </div>
    );
}