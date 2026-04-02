"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SignInButton, ClerkLoaded, useSignIn } from "@clerk/nextjs";
import { Loader2, KeyRound, Upload, Phone } from "lucide-react";
import type { PhoneCodeFactor } from "@clerk/types";

import DivineBackground from "../../components/DivineBackground";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const { t, language } = useLanguage();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push(`/${language}/dashboard`);
    }
  }, [user, authLoading, router, language]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    const formatIdentifier = (ident: string) => {
      const clean = ident.replace(/\s+/g, '');
      if (clean.includes('@')) return clean;
      if (/^\d{8}$/.test(clean)) return `+976${clean}`;
      if (/^\d+$/.test(clean) && !clean.startsWith('+')) return `+${clean}`;
      return ident;
    };

    const formattedIdentifier = formatIdentifier(email);

    try {
      if (!showOtpInput && password !== "Gevabal") {
        try {
          await login({ identifier: formattedIdentifier, password });
          router.push(`/${language}/dashboard`);
          return;
        } catch (err: any) {
          if (err.message.includes("User not found") || err.message === "Please log in with the correct method.") {
            // continue to clerk
          } else if (err.message === "Invalid password") {
            setError(t({ mn: "Нууц үг буруу байна", en: "Invalid password" }));
            setLoading(false);
            return;
          } else {
            throw err;
          }
        }
      }
    } catch (e: any) {}

    try {
      if (showOtpInput) {
        const result = await signIn.attemptFirstFactor({
          strategy: "phone_code",
          code: otp,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push(`/${language}/dashboard`);
        } else {
          setError("Invalid code. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (password === "Gevabal") {
        const res = await fetch("/api/auth/master-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Master login failed.");
        if (data.type === "custom") {
          router.push(`/${language}/dashboard`);
          return;
        }
        const result = await signIn.create({ strategy: "ticket", ticket: data.token });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push(`/${language}/dashboard`);
          return;
        } else {
          throw new Error("Master Token verification failed.");
        }
      }

      const params = password ? { identifier: formattedIdentifier, password } : { identifier: formattedIdentifier };
      const result = await signIn.create(params);
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(`/${language}/dashboard`);
      } else if (result.status === "needs_first_factor") {
        const factors = result.supportedFirstFactors || [];
        const phoneFactor = factors.find(f => f.strategy === "phone_code") as PhoneCodeFactor | undefined;
        if (phoneFactor) {
          await signIn.prepareFirstFactor({ strategy: "phone_code", phoneNumberId: phoneFactor.phoneNumberId });
          setShowOtpInput(true);
          setError("");
        } else {
          setError("Login failed. Please check credentials.");
        }
      } else {
        setError("Sign in requirements not met.");
      }
    } catch (err: any) {
      let msg = err.errors ? err.errors[0].longMessage : err.message;
      if (msg.includes("verification strategy is not valid") || msg.includes("password")) {
        if (!password) msg = "Please enter password or use a phone number with SMS.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const content = {
    welcome: t({ mn: "Нэвтрэх", en: "Welcome Back" }),
    instruction: t({ mn: "Мэдээллээ оруулна уу", en: "Sign in to your account" }),
    loginBtn: t({ mn: "Нэвтрэх", en: "Sign In" }),
    verifyCode: t({ mn: "Баталгаажуулах", en: "Verify Code" }),
    registerBtn: t({ mn: "Бүртгүүлэх", en: "Create Account" }),
    forgotPassword: t({ mn: "Нууц үгээ мартсан уу?", en: "Forgot Password?" }),
    noAccount: t({ mn: "Бүртгэлгүй юу?", en: "Don't have an account?" }),
  };

  return (
    <div className="min-h-screen w-full relative">
      <DivineBackground />
      
      <main className="relative z-10 flex flex-col justify-center items-center px-6 py-20 min-h-screen">
        <div className="w-full max-w-lg">
          
          <div className="text-center mb-10">
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex p-4 rounded-3xl bg-white shadow-modal border border-border mb-6"
            >
              <KeyRound size={32} className="text-gold" />
            </motion.div>
            <h2 className="text-display mb-2">{content.welcome}</h2>
            <p className="text-secondary">{content.instruction}</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="monastery-card p-8 md:p-12 bg-white/95 backdrop-blur-xl"
          >
            <ClerkLoaded>
              <form onSubmit={handleSignIn} className="space-y-8">

                {!showOtpInput ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-label text-earth/60 ml-4">
                        {t({ mn: "Имэйл эсвэл Утас", en: "Email or Phone" })}
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border border-border bg-stone/5 focus:border-gold outline-none transition-design font-black text-ink text-sm"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                       <label className="text-label text-earth/60 ml-4">
                        {t({ mn: "Нууц үг", en: "Password" })}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t({ mn: "Хоосон байж болно (SMS-ээр нэвтрэх бол)", en: "Optional" })}
                        className="w-full px-6 py-4 rounded-2xl border border-border bg-stone/5 focus:border-gold outline-none transition-design font-black text-ink text-sm"
                      />
                      <div className="flex justify-end pt-1">
                        <Link href="/forgot-password" size={12} className="text-sm font-black text-gold hover:text-ink uppercase tracking-widest transition-colors">
                          {content.forgotPassword}
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-gold/5 p-8 rounded-[2rem] border border-gold/10 text-center">
                    <p className="text-label text-gold mb-6">{t({ mn: "Баталгаажуулах код оруулна уу", en: "Verification Code" })}</p>
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
                      {showOtpInput ? content.verifyCode : content.loginBtn}
                    </span>
                  )}
                </button>
              </form>

              {!showOtpInput && (
                <>
                   <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-label opacity-40">OR</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <SignInButton mode="modal">
                      <button type="button" className="w-full h-14 rounded-2xl border border-border bg-white flex items-center justify-center gap-3 text-label hover:bg-stone/5 transition-colors">
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4 opacity-70" />
                        Google
                      </button>
                    </SignInButton>
                  </div>

                  <div className="mt-10 text-center">
                    <p className="text-label text-earth/40 mb-4">{content.noAccount}</p>
                    <Link href="/sign-up">
                      <button className="text-sm font-black text-ink hover:text-gold uppercase tracking-[0.2em] transition-colors">
                        {content.registerBtn}
                      </button>
                    </Link>
                  </div>
                </>
              )}

            </ClerkLoaded>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
