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

// Removed Nebulas visual effect for clarity

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
    welcome: t({ mn: "Бүртгүүлэх", en: "Create Account" }),
    instruction: t({ mn: "Эхлээд өөрийн бүртгэлийн төрлийг сонгоно уу", en: "First, choose your account type" }),
    roleClient: t({ mn: "Сүсэгтэн", en: "Seeker (Client)" }),
    roleClientDesc: t({ mn: "Засал ном уншуулах, үзмэрчтэй холбогдох", en: "To book rituals & consult monks" }),
    roleMonk: t({ mn: "Лам / Үзмэрч", en: "Monk / Guide" }),
    roleMonkDesc: t({ mn: "Үйлчилгээ үзүүлэх, сүсэгтэнд туслах", en: "To provide spiritual services" }),
    registerBtn: t({ mn: "Бүртгүүлэх", en: "Sign Up" }),
    verifyBtn: t({ mn: "Баталгаажуулах", en: "Verify Code" }),
    loginBtn: t({ mn: "Нэвтрэх", en: "Sign In" }),
    haveAccount: t({ mn: "Хаягтай юу?", en: "Already have an account?" }),
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFBEB] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <OverlayNavbar />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
          {content.welcome}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {content.instruction}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-stone-100">

          {/* Simple Role Selector */}
          {!pendingVerification && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setRole('client')}
                className={`p-4 rounded-xl border-2 text-left transition-all relative ${role === 'client' ? 'border-amber-500 bg-amber-50' : 'border-stone-100 hover:border-amber-200'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${role === 'client' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <User size={16} />
                </div>
                <div className="font-bold text-stone-900">{content.roleClient}</div>
                <div className="text-xs text-stone-500 mt-1">{content.roleClientDesc}</div>
                {role === 'client' && <div className="absolute top-3 right-3 text-amber-500"><ShieldCheck size={16} /></div>}
              </button>

              <button
                onClick={() => setRole('monk')}
                className={`p-4 rounded-xl border-2 text-left transition-all relative ${role === 'monk' ? 'border-amber-500 bg-amber-50' : 'border-stone-100 hover:border-amber-200'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${role === 'monk' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <ScrollText size={16} />
                </div>
                <div className="font-bold text-stone-900">{content.roleMonk}</div>
                <div className="text-xs text-stone-500 mt-1">{content.roleMonkDesc}</div>
                {role === 'monk' && <div className="absolute top-3 right-3 text-amber-500"><ShieldCheck size={16} /></div>}
              </button>
            </div>
          )}

          <ClerkLoaded>
            <form onSubmit={handleSignUp} className="space-y-6">

              {!pendingVerification && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">
                      {t({ mn: "Утасны дугаар", en: "Phone Number" })}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="text-stone-400" size={16} />
                      </div>
                      <input
                        type="tel"
                        placeholder="99112233"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">
                      {t({ mn: "Нууц үг", en: "Password" })}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="text-stone-400" size={16} />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 px-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {pendingVerification && (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-center animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-stone-600 mb-4">{t({ mn: "Таны утсанд ирсэн кодыг оруулна уу", en: "Enter code sent to your phone" })}</p>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full text-center tracking-[1em] px-3 py-4 border border-stone-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 text-lg font-bold"
                    autoFocus
                    required
                  />
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-stone-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50 transition-all uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (pendingVerification ? content.verifyBtn : content.registerBtn)}
                </button>
              </div>
            </form>

            {!pendingVerification && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-stone-500">{content.haveAccount}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/sign-in"
                    className="w-full flex justify-center py-3 px-4 border border-stone-300 rounded-xl shadow-sm bg-white text-sm font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {content.loginBtn}
                  </Link>
                </div>
              </div>
            )}
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}