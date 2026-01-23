"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { SignUpButton, SignInButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import {
  Flower, UserPlus, Loader2, ShieldCheck, User, ScrollText, Sparkles, Orbit, Phone
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import OverlayNavbar from "../components/Navbar";

// ==========================================
// 1. VISUAL EFFECTS COMPONENTS
// ==========================================

const Nebulas = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.1)_0%,_transparent_50%)]"
    />
    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
  </div>
);

// High-End Role Card with "Liquid" Selection
const RoleSelector = ({ role, setRole, content }: any) => (
  <div className="grid grid-cols-2 gap-4 mb-8">
    {(["client", "monk"] as const).map((r) => {
      const isActive = role === r;
      return (
        <motion.button
          key={r}
          onClick={() => setRole(r)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative flex flex-col items-center justify-center py-6 rounded-[2rem] border overflow-hidden transition-all duration-300 ${isActive
            ? "border-amber-500 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.4)]"
            : "border-transparent bg-white/40 hover:bg-white/60"
            }`}
        >
          {/* Active Liquid Background */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-amber-100 to-white z-0"
              />
            )}
          </AnimatePresence>

          <div className={`relative z-10 flex flex-col items-center gap-3 ${isActive ? "text-amber-800" : "text-stone-500"}`}>
            {r === "client" ? (
              <div className={`p-3 rounded-full ${isActive ? 'bg-amber-500 text-white' : 'bg-stone-200'}`}>
                <User size={20} />
              </div>
            ) : (
              <div className={`p-3 rounded-full ${isActive ? 'bg-amber-500 text-white' : 'bg-stone-200'}`}>
                <ScrollText size={20} />
              </div>
            )}
            <span className="text-xs font-black uppercase tracking-widest">{content[`role${r.charAt(0).toUpperCase() + r.slice(1)}`]}</span>
          </div>
        </motion.button>
      );
    })}
  </div>
);

// ==========================================
// 2. MAIN PAGE
// ==========================================

export default function SignUpPage() {
  const { t } = useLanguage();
  const [role, setRole] = useState<"client" | "monk">("client");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Mouse Torch Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const torchBg = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(251, 191, 36, 0.08), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  const content = {
    leftTitle: t({ mn: "Хязгааргүй<br/>Боломж", en: "Infinite<br/>Potential" }),
    leftSubtitle: t({ mn: "Таны аялал эндээс эхэлнэ.", en: "Your journey starts here." }),
    quote: t({
      mn: "\"Мянган бээрийн аялал нэг алхмаас эхэлдэг. Бидэнтэй нэгдэж, амар амгалан, гэгээрлийн төлөөх замаа өнөөдөр эхлүүлээрэй.\"",
      en: "\"A journey of a thousand miles begins with a single step. Join us and begin your path towards peace and enlightenment today.\""
    }),
    welcome: t({ mn: "Тавтай морил", en: "Welcome Home" }),
    instruction: t({ mn: "Та хэн болохыг сонгоно уу?", en: "How will you join us?" }),
    roleClient: t({ mn: "Хэрэглэгч", en: "Seeker" }),
    roleMonk: t({ mn: "Багш (Лам)", en: "Guide" }),
    registerBtn: role === "monk" ? t({ mn: "Багшаар бүртгүүлэх", en: "Register as Monk" }) : t({ mn: "Бүртгүүлэх", en: "Register" }),
    loginBtn: t({ mn: "Нэвтрэх", en: "Enter Sanctuary" }),
    forgotPassword: t({ mn: "Нууц үгээ мартсан уу?", en: "Forgot Password?" }),
    footer: t({ mn: "Эв нэгдэл • Нигүүлсэл • Мэргэн ухаан", en: "Unity • Compassion • Wisdom" }),
  };

  return (
    <div
      className="min-h-screen w-full flex bg-[#FDFBF7] font-serif overflow-hidden selection:bg-amber-200"
      onMouseMove={handleMouseMove}
    >
      <OverlayNavbar />

      {/* --- LEFT SIDE: CINEMATIC VISUAL --- */}
      <div className="hidden lg:flex w-5/12 relative overflow-hidden bg-[#2a1a12] items-center justify-center">
        {/* Animated Layers */}
        <motion.div
          initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 20, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1600609842388-3e4b7b250571?q=80&w=2574&auto=format&fit=crop"
            alt="Temple"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a12] via-[#451a03]/60 to-transparent" />
        </motion.div>

        <Nebulas />

        {/* Content */}
        <div className="relative z-10 px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-amber-200/20 backdrop-blur-md mb-8 text-amber-100/60">
              <Orbit className="animate-spin-slow" size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{content.leftSubtitle}</span>
            </div>

            <h1
              className="text-6xl font-black text-amber-50 mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl"
              dangerouslySetInnerHTML={{ __html: content.leftTitle }}
            />

            <div className="w-12 h-1 bg-amber-500/50 mx-auto mb-8 rounded-full" />

            <p className="text-amber-100/70 text-lg font-sans font-light leading-relaxed max-w-sm mx-auto italic">
              {content.quote}
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE: INTERACTIVE FORM --- */}
      <div className="w-full lg:w-7/12 relative flex flex-col items-center justify-center p-6 sm:p-12 md:p-24">

        {/* Magic Background Torch */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: torchBg }} />

        <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-5">
          <Flower size={300} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-block p-4 rounded-2xl bg-white shadow-xl mb-6 text-amber-600 border border-amber-100"
            >
              <Sparkles size={32} />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2a1a12] mb-3 tracking-tight">{content.welcome}</h2>
            <p className="text-[#5c4033] font-sans opacity-60 uppercase tracking-widest text-xs font-bold">{content.instruction}</p>
          </div>

          {/* Role Selection */}
          <RoleSelector role={role} setRole={setRole} content={content} />

          {/* Phone Input (Optional/Required based on preference, here optional but encouraged) */}
          <div className="w-full mb-8 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            </div>
            <input
              type="tel"
              placeholder={t({ mn: "Утасны дугаар", en: "Phone Number" })}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all font-sans text-stone-700 placeholder:text-stone-400"
            />
          </div>

          {/* Auth Actions */}
          <div className="space-y-4">
            <ClerkLoading>
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-amber-600" /></div>
            </ClerkLoading>

            <ClerkLoaded>
              {/* 1. Primary Register Button */}
              <SignUpButton
                mode="modal"
                forceRedirectUrl={role === 'monk' ? "/onboarding/monk" : "/dashboard"}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="group relative w-full h-16 rounded-[1.5rem] overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-900/20"
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="relative z-10 flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-[0.2em]">
                    <UserPlus size={18} /> {content.registerBtn}
                  </div>
                </motion.button>
              </SignUpButton>

              {/* 2. Secondary Login Button */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#FDFBF7] px-4 text-stone-400">Or</span></div>
              </div>

              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }} whileTap={{ scale: 0.98 }}
                  className="w-full h-14 rounded-[1.5rem] border-2 border-stone-200 text-[#451a03] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-colors hover:border-amber-300"
                >
                  <ShieldCheck size={16} /> {content.loginBtn}
                </motion.button>
              </SignInButton>

              <div className="text-center mt-6">
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/60 hover:text-amber-600 hover:underline transition-colors"
                >
                  {content.forgotPassword}
                </Link>
              </div>
            </ClerkLoaded>
          </div>

          <div className="mt-12 text-center opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{content.footer}</p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}