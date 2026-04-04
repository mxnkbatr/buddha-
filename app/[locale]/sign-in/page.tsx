"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Loader2, Eye, EyeOff } from "lucide-react";
import type { PhoneCodeFactor } from "@clerk/types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const { t, language } = useLanguage();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!authLoading && user) router.push(`/${language}/dashboard`);
  }, [user, authLoading, router, language]);

  const formatId = (v: string) => {
    const c = v.replace(/\s+/g, "");
    if (c.includes("@")) return c;
    if (/^\d{8}$/.test(c)) return `+976${c}`;
    if (/^\d+$/.test(c) && !c.startsWith("+")) return `+${c}`;
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true); setError("");
    const fmtId = formatId(identifier);

    try {
      if (showOtpInput) {
        const r = await signIn!.attemptFirstFactor({ strategy: "phone_code", code: otp });
        if (r.status === "complete") {
          await setActive!({ session: r.createdSessionId });
          router.push(`/${language}/profile`);
        }
        setLoading(false); return;
      }

      // Try custom DB first
      try {
        await login({ identifier: fmtId, password });
        router.push(`/${language}/dashboard`); return;
      } catch (dbErr: any) {
        if (dbErr.message === "Invalid password") {
          setError(t({ mn: "Нууц үг буруу байна", en: "Incorrect password" }));
          setLoading(false); return;
        }
        // continue to Clerk
      }

      const r = await signIn!.create({ identifier: fmtId, password });
      if (r.status === "complete") {
        await setActive!({ session: r.createdSessionId });
        router.push(`/${language}/profile`);
      } else if (r.status === "needs_first_factor") {
        const pf = r.supportedFirstFactors?.find(f => f.strategy === "phone_code") as PhoneCodeFactor | undefined;
        if (pf) {
          await signIn!.prepareFirstFactor({ strategy: "phone_code", phoneNumberId: pf.phoneNumberId });
          setShowOtpInput(true);
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || t({ mn: "Нэвтрэхэд алдаа гарлаа", en: "Sign in failed" }));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100svh] bg-cream flex flex-col">
      {/* Top safe area */}
      <div style={{ height: "max(env(safe-area-inset-top, 0px), 44px)" }} />

      {/* Header */}
      <div className="px-6 pt-6 pb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-white rounded-2xl shadow-card p-2 flex items-center justify-center">
          <Image src="/logo.png" alt="Gevabal" width={52} height={52} className="rounded-xl object-cover" />
        </div>
        <h1 className="text-[26px] font-black text-ink tracking-tight mb-1">
          {t({ mn: "Тавтай морил", en: "Welcome back" })}
        </h1>
        <p className="text-[14px] text-earth">
          {t({ mn: "Гэвабалд нэвтрэх", en: "Sign in to Gevabal" })}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!showOtpInput ? (
            <>
              <div>
                <label className="input-label">
                  {t({ mn: "Имэйл / Утасны дугаар", en: "Email / Phone" })}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={t({ mn: "example@mail.com эсвэл 99001122", en: "example@mail.com or 99001122" })}
                  className="input"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="input-label">
                  {t({ mn: "Нууц үг", en: "Password" })}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-12"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-earth"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link href={`/${language}/forgot-password`} className="text-[13px] text-gold font-semibold">
                  {t({ mn: "Нууц үг мартсан?", en: "Forgot password?" })}
                </Link>
              </div>
            </>
          ) : (
            <div>
              <label className="input-label">
                {t({ mn: "Баталгаажуулах код (SMS)", en: "Verification code (SMS)" })}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="000000"
                className="input text-center text-2xl font-bold tracking-[0.5em]"
                required
              />
              <p className="text-[12px] text-earth text-center mt-3">
                {t({ mn: "Утасны дугаарт SMS илгээгдлээ", en: "SMS code sent to your phone" })}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] text-red-600 font-medium">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary btn-primary-full mt-2">
            {loading
              ? <Loader2 size={20} className="animate-spin" />
              : showOtpInput
                ? t({ mn: "Баталгаажуулах", en: "Verify" })
                : t({ mn: "Нэвтрэх", en: "Sign In" })}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-earth font-medium">
            {t({ mn: "эсвэл", en: "or" })}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-[14px] text-earth">
          {t({ mn: "Бүртгэл байхгүй юу?", en: "No account?" })}{" "}
          <Link href={`/${language}/sign-up`} className="text-gold font-bold">
            {t({ mn: "Бүртгүүлэх", en: "Sign up" })}
          </Link>
        </p>
      </div>

      <div style={{ height: "max(env(safe-area-inset-bottom, 0px), 32px)" }} />
    </div>
  );
}
