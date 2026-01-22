"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    UserPlus,
    Sparkles,
    CalendarCheck,
    Video,
    LayoutDashboard,
    ArrowRight,
    ChevronDown,
    Info,
    HelpCircle,
    ShieldCheck,
    CreditCard
} from "lucide-react";
import OverlayNavbar from "../components/Navbar";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "next-themes";

const BlurReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

const GuideSection = ({ icon: Icon, title, children, theme, id }: any) => (
    <section id={id} className="py-12 border-b border-amber-900/10 last:border-0 scroll-mt-32">
        <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-2xl bg-amber-500/10 ${theme.accentText}`}>
                <Icon size={32} />
            </div>
            <h2 className={`text-3xl md:text-4xl font-serif font-black ${theme.text}`}>{title}</h2>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </section>
);

const StepCard = ({ number, title, desc, theme }: any) => (
    <div className={`p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-xl ${theme.glassPanel}`}>
        <div className="flex items-start gap-4">
            <span className={`text-4xl font-serif font-black opacity-20 ${theme.text}`}>{number}</span>
            <div>
                <h4 className={`text-xl font-bold mb-2 ${theme.text}`}>{title}</h4>
                <p className={`text-sm leading-relaxed opacity-70 ${theme.text}`}>{desc}</p>
            </div>
        </div>
    </div>
);

export default function GuidePage() {
    const { t } = useLanguage();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const isDark = false;
    const theme = {
        bg: "bg-[#FDFBF7]",
        text: "text-[#451a03]",
        accentText: "text-amber-600",
        glassPanel: "bg-white/60 border-amber-900/10",
        borderColor: "border-amber-900/10",
        btnGradient: "from-amber-500 to-orange-600"
    };

    if (!mounted) return null;

    return (
        <div className={`min-h-screen ${theme.bg} transition-colors duration-1000`}>
            <OverlayNavbar />

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full blur-[120px] bg-amber-200" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full blur-[100px] bg-orange-100" />
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-32 md:pt-48 pb-32">
                {/* Hero Header */}
                <div className="text-center mb-24">
                    <BlurReveal>
                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border mb-8 ${theme.glassPanel}`}>
                            <BookOpen size={16} className={theme.accentText} />
                            <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme.accentText}`}>
                                {t({ mn: "Хэрэглэгчийн заавар", en: "User Guide" })}
                            </span>
                        </div>
                    </BlurReveal>

                    <h1 className={`text-6xl md:text-9xl font-serif font-black leading-none mb-8 ${theme.text}`}>
                        <BlurReveal delay={0.1}>
                            {t({ mn: "Гэвабaл", en: "Gevabal" })}
                        </BlurReveal>
                        <BlurReveal delay={0.2}>
                            <span className={`italic font-light ${theme.accentText}`}>
                                {t({ mn: "Зөвлөх", en: "Concierge" })}
                            </span>
                        </BlurReveal>
                    </h1>

                    <BlurReveal delay={0.3} className="max-w-2xl mx-auto">
                        <p className={`text-lg md:text-2xl font-light leading-relaxed opacity-70 ${theme.text}`}>
                            {t({
                                mn: "Манай платформыг хэрхэн ашиглаж, өөрийн оюун санааны аяллаа эхлүүлэх талаарх дэлгэрэнгүй заавар.",
                                en: "A comprehensive guide on how to navigate our platform and begin your spiritual journey."
                            })}
                        </p>
                    </BlurReveal>
                </div>

                {/* Content Container */}
                <div className="max-w-4xl mx-auto">

                    {/* 1. ACCOUNTS */}
                    <GuideSection
                        id="accounts"
                        icon={UserPlus}
                        title={t({ mn: "Хэрхэн эхлэх вэ?", en: "Getting Started" })}
                        theme={theme}
                    >
                        <p className={`text-lg opacity-80 ${theme.text}`}>
                            {t({
                                mn: "Гэвабaл-д нэгдэх нь маш хялбар. Та ердөө хэдхэн алхмаар өөрийн хаягийг үүсгэж болно.",
                                en: "Joining Gevabal is simple. You can create your account in just a few steps."
                            })}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <StepCard
                                number="01"
                                title={t({ mn: "Бүртгүүлэх", en: "Sign Up" })}
                                desc={t({ mn: "Баруун дээд буланд байрлах 'Бүртгүүлэх' товчийг дарж өөрийн мэдээллээ оруулна.", en: "Click 'Register' in the top right and provide your basic details." })}
                                theme={theme}
                            />
                            <StepCard
                                number="02"
                                title={t({ mn: "Нэвтрэх", en: "Sign In" })}
                                desc={t({ mn: "Хэрэв та аль хэдийн бүртгэлтэй бол 'Нэвтрэх' товчийг ашиглан нэвтэрнэ үү.", en: "If you already have an account, use the 'Sign In' button to log back in." })}
                                theme={theme}
                            />
                        </div>
                    </GuideSection>

                    {/* 2. RITUALS */}
                    <GuideSection
                        id="rituals"
                        icon={Sparkles}
                        title={t({ mn: "Зан үйл & Үйлчилгээ", en: "Rituals & Services" })}
                        theme={theme}
                    >
                        <p className={`text-lg opacity-80 ${theme.text}`}>
                            {t({
                                mn: "Бид танд зурхай, засал ном, бясалгал зэрэг олон төрлийн оюун санааны үйлчилгээг санал болгож байна.",
                                en: "We offer a variety of spiritual services including astrology, rituals, and meditation."
                            })}
                        </p>
                        <div className="mt-8 space-y-4">
                            <div className={`p-8 rounded-[2.5rem] border ${theme.glassPanel}`}>
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <Info size={18} className={theme.accentText} />
                                    {t({ mn: "Үйлчилгээг сонгох", en: "Browsing Services" })}
                                </h4>
                                <p className="text-sm opacity-70 leading-relaxed mb-6">
                                    {t({
                                        mn: "'Үйлчилгээ' цэс рүү орж өөрт тохирох засал ном эсвэл мэргэ төлгийг сонгоорой. Үйлчилгээ бүр өөрийн гэсэн дэлгэрэнгүй тайлбар, үргэлжлэх хугацаа болон өргөлийн хэмжээтэй байх болно.",
                                        en: "Navigate to the 'Services' section to find the right ritual or divination. Each service includes a detailed description, duration, and offering amount."
                                    })}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                        <span className="text-[10px] font-black uppercase opacity-60 block mb-1">Rituals</span>
                                        <span className="font-bold">Зан Үйл</span>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                        <span className="text-[10px] font-black uppercase opacity-60 block mb-1">Divination</span>
                                        <span className="font-bold">Мэргэ</span>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                        <span className="text-[10px] font-black uppercase opacity-60 block mb-1">Meditation</span>
                                        <span className="font-bold">Бясалгал</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GuideSection>

                    {/* 3. BOOKING */}
                    <GuideSection
                        id="booking"
                        icon={CalendarCheck}
                        title={t({ mn: "Захиалга өгөх", en: "How to Book" })}
                        theme={theme}
                    >
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StepCard
                                    number="STEP 01"
                                    title={t({ mn: "Цаг Сонгох", en: "Select Time" })}
                                    desc={t({ mn: "Хуанлиас өөрт боломжтой өдөр болон цагийг сонгоно.", en: "Pick a date and time slot that works for you from the calendar." })}
                                    theme={theme}
                                />
                                <StepCard
                                    number="STEP 02"
                                    title={t({ mn: "Мэдээлэл", en: "Information" })}
                                    desc={t({ mn: "Өөрийн нэр, имэйл болон хүсэл зорилгоо бичиж үлдээнэ.", en: "Enter your name, email, and any specific intentions or questions." })}
                                    theme={theme}
                                />
                                <StepCard
                                    number="STEP 03"
                                    title={t({ mn: "Төлбөр", en: "Payment" })}
                                    desc={t({ mn: "Төлбөрийн мэдээллийн дагуу гүйлгээ хийж баталгаажуулна.", en: "Follow the payment instructions to secure your session." })}
                                    theme={theme}
                                />
                            </div>

                            <div className={`p-8 rounded-[2.5rem] bg-amber-600 text-white shadow-2xl overflow-hidden relative group`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />
                                <div className="relative z-10">
                                    <h4 className="flex items-center gap-2 font-black uppercase tracking-widest text-xs mb-4">
                                        <CreditCard size={14} /> {t({ mn: "Төлбөрийн заавар", en: "Payment Instructions" })}
                                    </h4>
                                    <p className="text-xl font-serif mb-6 opacity-90">
                                        {t({
                                            mn: "Захиалга хийсний дараа танд харагдах данс руу өргөлөө шилжүүлж, гүйлгээний утга дээр утасны дугаараа бичээрэй.",
                                            en: "After booking, transfer the offering to the provided account and include your phone number as a reference."
                                        })}
                                    </p>
                                    <div className="flex gap-4">
                                        <ShieldCheck size={24} className="opacity-50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Secure Verification</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GuideSection>

                    {/* 4. LIVE SPACES */}
                    <GuideSection
                        id="live"
                        icon={Video}
                        title={t({ mn: "Шуд дамжуулалт", en: "Live Spaces" })}
                        theme={theme}
                    >
                        <p className={`text-lg opacity-80 ${theme.text}`}>
                            {t({
                                mn: "Захиалсан цаг болоход та видео дуудлагаар багштайгаа шууд холбогдох болно.",
                                en: "When your session starts, you will connect directly with your guide via a live video call."
                            })}
                        </p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h5 className="font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    {t({ mn: "Хэрхэн нэгдэх вэ?", en: "How to Join" })}
                                </h5>
                                <ul className="space-y-3 text-sm opacity-70">
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={14} className="mt-1 shrink-0" />
                                        {t({ mn: "Өөрийн 'Самбар' цэс рүү орно.", en: "Go to your 'Dashboard' section." })}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={14} className="mt-1 shrink-0" />
                                        {t({ mn: "Идэвхтэй захиалга дээрх 'Нэгдэх' товчийг дарна.", en: "Click the 'Join Room' button on your active booking." })}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={14} className="mt-1 shrink-0" />
                                        {t({ mn: "Камер болон микрофондоо зөвшөөрөл өгнө.", en: "Grant permission for your camera and microphone." })}
                                    </li>
                                </ul>
                            </div>
                            <div className={`p-6 rounded-3xl border ${theme.glassPanel} flex items-center justify-center`}>
                                <div className="text-center">
                                    <Video size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Virtual Sanctuary Interface</p>
                                </div>
                            </div>
                        </div>
                    </GuideSection>

                    {/* 5. DASHBOARD */}
                    <GuideSection
                        id="dashboard"
                        icon={LayoutDashboard}
                        title={t({ mn: "Хэрэглэгчийн Самбар", en: "Your Dashboard" })}
                        theme={theme}
                    >
                        <p className={`text-lg opacity-80 ${theme.text}`}>
                            {t({
                                mn: "Та өөрийн бүх захиалга, түүх болон хувийн мэдээллээ нэг дороос хянах боломжтой.",
                                en: "Track all your bookings, history, and profile settings in one central place."
                            })}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className={`p-6 rounded-3xl border ${theme.glassPanel}`}>
                                <h6 className="font-bold mb-2">{t({ mn: "Идэвхтэй захиалга", en: "Upcoming Sessions" })}</h6>
                                <p className="text-xs opacity-60">{t({ mn: "Удахгүй болох засал, номын цагаа хянаж, лайв өрөө рүү шууд орох.", en: "Monitor upcoming sessions and join your live rooms directly." })}</p>
                            </div>
                            <div className={`p-6 rounded-3xl border ${theme.glassPanel}`}>
                                <h6 className="font-bold mb-2">{t({ mn: "Түүх", en: "Spiritual History" })}</h6>
                                <p className="text-xs opacity-60">{t({ mn: "Өмнөх бүх үйлчилгээнүүдийнхээ түүхийг харах.", en: "View the records of your past rituals and divinations." })}</p>
                            </div>
                        </div>
                    </GuideSection>

                    {/* CTA / Support */}
                    <section className="py-24 text-center">
                        <HelpCircle size={48} className={`mx-auto mb-6 opacity-20 ${theme.text}`} />
                        <h3 className={`text-3xl font-serif font-bold mb-4 ${theme.text}`}>
                            {t({ mn: "Асуулт байна уу?", en: "Still have questions?" })}
                        </h3>
                        <p className={`mb-10 opacity-60 ${theme.text}`}>
                            {t({
                                mn: "Хэрэв танд ямар нэгэн тусламж хэрэгтэй бол манай дэмжлэгийн багтай холбогдоорой.",
                                en: "If you need further assistance, don't hesitate to reach out to our support team."
                            })}
                        </p>
                        <button className={`px-12 py-5 rounded-2xl bg-stone-900 text-white font-black uppercase tracking-[.2em] text-xs shadow-2xl transition-all active:scale-95`}>
                            {t({ mn: "Холбоо барих", en: "Contact Support" })}
                        </button>
                    </section>

                </div>
            </main>
        </div>
    );
}
