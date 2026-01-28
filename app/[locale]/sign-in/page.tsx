"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { SignInButton, ClerkLoaded, ClerkLoading, useSignIn } from "@clerk/nextjs";
import {
  Flower, UserPlus, Loader2, ShieldCheck, User, ScrollText, Sparkles, Orbit, KeyRound
} from "lucide-react";
// Ideally import this from @clerk/types, but we can define a local helper type to fix the error without extra dependencies
import type { PhoneCodeFactor } from "@clerk/types";

import { useLanguage } from "../../contexts/LanguageContext";
import OverlayNavbar from "../../components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

// Effects removed for clarity

// High-End Role Card with "Liquid" Selection
// eslint-disable-next-line @typescript-eslint/no-explicit-any


// ==========================================
// 2. MAIN PAGE
// ==========================================

export default function SignUpPage() {
  const { t } = useLanguage();
  const [role, setRole] = useState<"client" | "monk">("client");
  const { isLoaded, signIn, setActive } = useSignIn();
  const { login } = useAuth(); // Custom login
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    // Helper to format identifier
    const formatIdentifier = (ident: string) => {
      const clean = ident.replace(/\s+/g, '');
      if (clean.includes('@')) return clean; // Email
      if (/^\d{8}$/.test(clean)) return `+976${clean}`; // Mongolian
      if (/^\d+$/.test(clean) && !clean.startsWith('+')) return `+${clean}`; // Other number without +
      return ident;
    };

    const formattedIdentifier = formatIdentifier(email);

    // --- 1. TRY CUSTOM DB LOGIN FIRST ---
    // If successful, we are done. If it fails specifically because user is not found or has no password (monk), we try Clerk.
    try {
      if (!showOtpInput && password !== "Gevabal") { // Skip if OTP flow or Master Key
        try {
          await login({ identifier: formattedIdentifier, password });
          router.push("/dashboard");
          return; // Stop here if custom login works
        } catch (err: any) {
          // If error is NOT "Invalid credentials", it might be a system error or "not found"
          // "Invalid credentials" (401) usually means password wrong OR user not found.
          // My API returns 401 for both "User not found" and "Wrong password" to be safe, BUT
          // it returns "Please log in with the correct method" if user exists but has no password (Monk).
          // So:
          if (err.message === "Please log in with the correct method." || err.message === "Invalid credentials") {
            // It might be a Monk (Clerk user) or just wrong password.
            // Let's TRY Clerk as fallback. If Clerk also fails, we show "Invalid credentials".
            console.log("Custom login failed, trying Clerk...", err.message);
          } else {
            // Real error
            throw err;
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // Continue to Clerk logic
    }

    try {
      // --- OTP VERIFICATION ---
      if (showOtpInput) {
        const result = await signIn.attemptFirstFactor({
          strategy: "phone_code",
          code: otp,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
        } else {
          console.log(result);
          setError("Invalid code. Please try again.");
        }
        setLoading(false);
        return;
      }

      // --- MASTER KEY LOGIC ---
      if (password === "Gevabal") {
        const res = await fetch("/api/auth/master-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 404) throw new Error(data.message || "User not found.");
          throw new Error(data.message || "Master login failed.");
        }

        const result = await signIn.create({
          strategy: "ticket",
          ticket: data.token,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
          return;
        } else {
          throw new Error("Master Token verification failed.");
        }
      }

      // --- STANDARD CLERK LOGIN (Password or OTP) ---
      const params = password ? { identifier: formattedIdentifier, password } : { identifier: formattedIdentifier };

      const result = await signIn.create(params);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else if (result.status === "needs_first_factor") {

        // --- FIX START ---
        // 1. Safely access factors with optional chaining or fallback
        const factors = result.supportedFirstFactors || [];

        // 2. Find the factor and cast it to 'any' or 'PhoneCodeFactor'
        // This tells TypeScript: "I know this specific object has a phoneNumberId"
        const phoneFactor = factors.find(
          (factor) => factor.strategy === "phone_code"
        ) as PhoneCodeFactor | undefined; // Using explicit type or 'as any' works here

        if (phoneFactor) {
          // Send OTP
          await signIn.prepareFirstFactor({
            strategy: "phone_code",
            phoneNumberId: phoneFactor.phoneNumberId,
          });
          setShowOtpInput(true);
          setError("");
        } else {
          setError("Login failed. Please check credentials.");
        }
        // --- FIX END ---

      } else {
        console.log(result);
        setError("Sign in requirements not met.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = err.errors ? err.errors[0].longMessage : err.message;

      if (msg.includes("verification strategy is not valid") || msg.includes("password")) {
        if (!password) {
          msg = "Please enter password or use a phone number with SMS.";
        }
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
    welcome: t({ mn: "Нэвтрэх", en: "Welcome Back" }),
    instruction: t({ mn: "Мэдээллээ оруулна уу", en: "Sign in to your account" }),
    loginBtn: t({ mn: "Нэвтрэх", en: "Sign In" }),
    sendCode: t({ mn: "Код илгээх", en: "Send Code" }),
    verifyCode: t({ mn: "Баталгаажуулах", en: "Verify Code" }),
    registerBtn: t({ mn: "Бүртгүүлэх", en: "Create Account" }),
    forgotPassword: t({ mn: "Нууц үгээ мартсан уу?", en: "Forgot Password?" }),
    
    noAccount: t({ mn: "Бүртгэлгүй юу?", en: "Don't have an account?" }),
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

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-stone-100">
          <ClerkLoaded>
            <form onSubmit={handleSignIn} className="space-y-6">

              {!showOtpInput ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">
                      {t({ mn: "Имэйл эсвэл Утас", en: "Email or Phone" })}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">
                      {t({ mn: "Нууц үг", en: "Password" })}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t({ mn: "Хоосон байж болно (SMS-ээр нэвтрэх бол)", en: "Optional (if using SMS)" })}
                        className="appearance-none block w-full px-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-end mt-1">
                      <Link href="/forgot-password" className="text-xs font-medium text-amber-600 hover:text-amber-500">
                        {content.forgotPassword}
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-center animate-in fade-in zoom-in duration-300">
                  <p className="text-sm text-stone-600 mb-4">{t({ mn: "Баталгаажуулах код оруулна уу", en: "Enter verification code" })}</p>
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
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (showOtpInput ? content.verifyCode : content.loginBtn)}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <SignInButton mode="modal">
                <button type="button" className="w-full flex items-center justify-center gap-3 py-4 border border-stone-200 rounded-xl shadow-sm bg-white text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-70" />
                  {t({ mn: "Google-ээр нэвтрэх", en: "Sign in with Google" })}
                </button>
              </SignInButton>
            </div>

            {!showOtpInput && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-stone-500">{content.noAccount}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/sign-up"
                    className="w-full flex justify-center py-3 px-4 border border-stone-300 rounded-xl shadow-sm bg-white text-sm font-bold text-stone-700 hover:bg-stone-50"
                  >
                    {content.registerBtn}
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
