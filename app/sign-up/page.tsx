"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { ClerkLoaded, ClerkLoading, useSignUp } from "@clerk/nextjs";
import {
  Flower, UserPlus, Loader2, ShieldCheck, User, ScrollText, Sparkles, Orbit, Phone, KeyRound, Mail
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import OverlayNavbar from "../components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          type="button"
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
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { login } = useAuth(); // Custom login from AuthContext
  
  const [role, setRole] = useState<"client" | "monk">("client");
  
  // Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mouse Torch Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const torchBg = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(251, 191, 36, 0.08), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic cleanup
    const clean = phone.replace(/\s+/g, '');
    
    // If user types just 8 digits (Mongolian standard), add +976
    if (/^\d{8}$/.test(clean)) {
        return `+976${clean}`;
    }
    // If it doesn't start with +, add it (assuming they typed a country code or we need to enforce one)
    // But safely, let's assume if it's not +976 and not 8 digits, they better type +Code
    if (!clean.startsWith('+')) {
       // Default to Mongolia if ambiguous or just prepend +
       return `+${clean}`;
    }
    return clean;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      if (role === 'client') {
        // --- CUSTOM DB FLOW FOR CLIENTS ---
        // Bypass Clerk completely to avoid "phone_number is not a valid parameter" error if setting is off
        const res = await fetch("/api/auth/client-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                phoneNumber: formattedPhone, 
                password, 
                email: email || undefined 
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }

        // Auto-login after registration
        await login({ identifier: formattedPhone, password });
        router.push("/dashboard");

      } else {
        // --- CLERK FLOW FOR MONKS ---
        if (!pendingVerification) {
            const signUpParams: any = {
              phoneNumber: formattedPhone,
              password,
              unsafeMetadata: { role: role }
            };
            if (email) signUpParams.emailAddress = email;

            await signUp.create(signUpParams);
            await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
            setPendingVerification(true);
        } else {
            const completeSignUp = await signUp.attemptPhoneNumberVerification({ code: otp });
            if (completeSignUp.status === "complete") {
              await setActive({ session: completeSignUp.createdSessionId });
              router.push("/onboarding/monk");
            } else {
              console.log(JSON.stringify(completeSignUp, null, 2));
              throw new Error("Verification failed. Please check the code.");
            }
        }
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      const msg = err.errors ? err.errors[0].longMessage : err.message;
      setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const content = {
    leftTitle: t({ mn: "Хязгааргүй<br/>Боломж", en: "Infinite<br/>Potential" }),
    leftSubtitle: t({ mn: "Таны аялал эндээс эхэлнэ.", en: "Your journey starts here." }),
    quote: t({
      mn: '"Мянган бээрийн аялал нэг алхмаас эхэлдэг. Бидэнтэй нэгдэж, амар амгалан, гэгээрлийн төлөөх замаа өнөөдөр эхлүүлээрэй."',
      en: '"A journey of a thousand miles begins with a single step. Join us and begin your path towards peace and enlightenment today."'
    }),
    welcome: t({ mn: "Тавтай морил", en: "Welcome Home" }),
    instruction: t({ mn: "Та хэн болохыг сонгоно уу?", en: "How will you join us?" }),
    roleClient: t({ mn: "Хэрэглэгч", en: "Seeker" }),
    roleMonk: t({ mn: "Багш (Лам)", en: "Guide" }),
    registerBtn: role === "monk" ? t({ mn: "Багшаар бүртгүүлэх", en: "Register as Monk" }) : t({ mn: "Бүртгүүлэх", en: "Register" }),
    verifyBtn: t({ mn: "Баталгаажуулах", en: "Verify Account" }),
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

        {/* Magic Background Torch (Hidden on Mobile) */}
        <motion.div className="hidden md:block absolute inset-0 pointer-events-none" style={{ background: torchBg }} />

        <div className="hidden md:block absolute top-0 right-0 p-12 pointer-events-none opacity-5">
          <Flower size={300} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-block p-4 rounded-2xl bg-white shadow-xl mb-4 md:mb-6 text-amber-600 border border-amber-100"
            >
              <Sparkles size={32} />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#2a1a12] mb-3 tracking-tight">{content.welcome}</h2>
            <p className="text-[#5c4033] font-sans opacity-60 uppercase tracking-widest text-xs font-bold">{content.instruction}</p>
          </div>

          {/* Role Selection (Only show if not verifying) */}
          {!pendingVerification && (
             <RoleSelector role={role} setRole={setRole} content={content} />
          )}

          {/* Auth Actions */}
          <div className="space-y-4">
            <ClerkLoading>
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-amber-600" /></div>
            </ClerkLoading>

            <ClerkLoaded>
              
              <form onSubmit={handleSignUp} className="space-y-4">
                
                {/* --- Step 1: Registration Form --- */}
                {!pendingVerification && (
                    <div className="space-y-3">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            </div>
                            <input
                            type="tel"
                            placeholder={t({ mn: "Утасны дугаар (99112233)", en: "Phone Number (+976...)" })}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all font-sans text-stone-700 placeholder:text-stone-400"
                            required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            </div>
                            <input
                            type="password"
                            placeholder={t({ mn: "Нууц үг", en: "Password" })}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all font-sans text-stone-700 placeholder:text-stone-400"
                            required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            </div>
                            <input
                            type="email"
                            placeholder={t({ mn: "Имэйл (Сонголттой)", en: "Email (Optional)" })}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all font-sans text-stone-700 placeholder:text-stone-400"
                            />
                        </div>
                    </div>
                )}

                {/* --- Step 2: Verification Form (Clerk Only) --- */}
                {pendingVerification && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="space-y-3"
                    >
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                            <p className="text-sm text-amber-800 font-sans">
                                {t({ mn: `Бид таны ${phoneNumber} дугаар луу код илгээлээ.`, en: `We sent a code to ${phoneNumber}.` })}
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ShieldCheck className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                            </div>
                            <input
                            type="text"
                            placeholder={t({ mn: "Баталгаажуулах код", en: "Verification Code" })}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all font-sans text-stone-700 placeholder:text-stone-400"
                            required
                            autoFocus
                            />
                        </div>
                    </motion.div>
                )}

                {error && <p className="text-red-500 text-xs text-center font-bold px-4">{error}</p>}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="group relative w-full h-16 rounded-[1.5rem] overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-900/20 disabled:opacity-50 mt-4"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="relative z-10 flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-[0.2em]">
                    {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
                    {pendingVerification ? content.verifyBtn : content.registerBtn}
                  </div>
                </motion.button>
              
              </form>

              {/* 2. Secondary Login Button */}
              {!pendingVerification && (
                  <>
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#FDFBF7] px-4 text-stone-400">Or</span></div>
                    </div>

                    <Link href="/sign-in" className="block w-full">
                        <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }} whileTap={{ scale: 0.98 }}
                        className="w-full h-14 rounded-[1.5rem] border-2 border-stone-200 text-[#451a03] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-colors hover:border-amber-300"
                        >
                        <ShieldCheck size={16} /> {content.loginBtn}
                        </motion.button>
                    </Link>
                  </>
              )}

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