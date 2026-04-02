"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClerkLoaded, useSignUp } from "@clerk/nextjs";
import { 
  Loader2, ShieldCheck, User, ScrollText, Phone, KeyRound 
} from "lucide-react";

import DivineBackground from "../../components/DivineBackground";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, login, loading: authLoading } = useAuth();

  const [role, setRole] = useState<"client" | "monk">("client");

  // Form State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push(`/${language}/dashboard`);
    }
  }, [user, authLoading, router, language]);

  const formatPhoneNumber = (phone: string) => {
    const clean = phone.replace(/\s+/g, '');
    if (/^\d{8}$/.test(clean)) return `+976${clean}`;
    if (!clean.startsWith('+')) return `+${clean}`;
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
        if (!res.ok) throw new Error(data.message || "Registration failed");

        await login({ identifier: formattedPhone, password });
        router.push(`/${language}/dashboard`);
      } else {
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
            router.push(`/${language}/onboarding/monk`);
          } else {
            throw new Error("Verification failed. Please check the code.");
          }
        }
      }
    } catch (err: any) {
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
    <div className="min-h-screen w-full relative">
      <DivineBackground />
      
      <main className="relative z-10 flex flex-col justify-center items-center px-6 py-20 min-h-screen">
        <div className="w-full max-w-2xl">
          
          <div className="text-center mb-10">
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex p-4 rounded-3xl bg-white shadow-modal border border-border mb-6"
            >
              <User size={32} className="text-gold" />
            </motion.div>
            <h2 className="text-display mb-2">{content.welcome}</h2>
            <p className="text-secondary">{content.instruction}</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="monastery-card p-8 md:p-12 bg-white/95 backdrop-blur-xl"
          >
            {/* Role Selector */}
            {!pendingVerification && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <button
                  onClick={() => setRole('client')}
                  className={`p-6 rounded-[2rem] border-2 text-left transition-design relative group ${role === 'client' ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold/30'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${role === 'client' ? 'bg-gold text-white shadow-gold' : 'bg-stone/10 text-earth/40 group-hover:bg-gold/10'}`}>
                    <User size={20} />
                  </div>
                  <div className="text-h2 text-ink mb-1">{content.roleClient}</div>
                  <div className="text-secondary text-[11px] leading-tight">{content.roleClientDesc}</div>
                  {role === 'client' && <div className="absolute top-4 right-4 text-gold"><ShieldCheck size={20} /></div>}
                </button>

                <button
                  onClick={() => setRole('monk')}
                  className={`p-6 rounded-[2rem] border-2 text-left transition-design relative group ${role === 'monk' ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold/30'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${role === 'monk' ? 'bg-gold text-white shadow-gold' : 'bg-stone/10 text-earth/40 group-hover:bg-gold/10'}`}>
                    <ScrollText size={20} />
                  </div>
                  <div className="text-h2 text-ink mb-1">{content.roleMonk}</div>
                  <div className="text-secondary text-[11px] leading-tight">{content.roleMonkDesc}</div>
                  {role === 'monk' && <div className="absolute top-4 right-4 text-gold"><ShieldCheck size={20} /></div>}
                </button>
              </div>
            )}

            <ClerkLoaded>
              <form onSubmit={handleSignUp} className="space-y-8">

                {!pendingVerification && (
                  <>
                    <div className="space-y-2">
                       <label className="text-label text-earth/60 ml-4">
                        {t({ mn: "Утасны дугаар", en: "Phone Number" })}
                      </label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" />
                        <input
                          type="tel"
                          placeholder="99XX XXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border border-border bg-stone/5 focus:border-gold outline-none transition-design font-black text-ink text-sm"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-label text-earth/60 ml-4">
                        {t({ mn: "Нууц үг", en: "Password" })}
                      </label>
                      <div className="relative">
                        <KeyRound size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" />
                        <input
                          type="password"
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border border-border bg-stone/5 focus:border-gold outline-none transition-design font-black text-ink text-sm"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                {pendingVerification && (
                  <div className="bg-gold/5 p-8 rounded-[2rem] border border-gold/10 text-center">
                    <p className="text-label text-gold mb-6">{t({ mn: "Таны утсанд ирсэн кодыг оруулна уу", en: "Verification Code" })}</p>
                    <input
                      type="text"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full text-center tracking-[0.5em] py-4 bg-white border border-gold/20 rounded-2xl focus:border-gold outline-none text-2xl font-black text-ink"
                      autoFocus
                      required
                    />
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-2xl bg-error/5 border border-error/10 text-error text-[10px] font-black uppercase tracking-widest text-center">
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="cta-button w-full h-16 shadow-gold group"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : (
                    <span className="text-sm uppercase tracking-[0.2em]">
                      {pendingVerification ? content.verifyBtn : content.registerBtn}
                    </span>
                  )}
                </button>
              </form>

              {!pendingVerification && (
                <div className="mt-12 text-center pt-8 border-t border-border">
                  <p className="text-label text-earth/40 mb-4">{content.haveAccount}</p>
                  <Link href="/sign-in">
                    <button className="text-sm font-black text-ink hover:text-gold uppercase tracking-[0.2em] transition-colors">
                      {content.loginBtn}
                    </button>
                  </Link>
                </div>
              )}
            </ClerkLoaded>
          </motion.div>
        </div>
      </main>
    </div>
  );
}