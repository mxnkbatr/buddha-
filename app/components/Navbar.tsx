"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  LayoutGrid,
  Compass,
  Globe,
  LogIn,
  UserCircle,
  BookOpen,
  LogOut,
  Feather
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const CONTENT = {
  logo: { mn: "Гэвабaл", en: "Gevabal", ko: "Gevabal" },
  login: { mn: "Нэвтрэх", en: "Sign In", ko: "로그인" },
  register: { mn: "Бүртгүүлэх", en: "Register", ko: "등록" },
  dashboard: { mn: "Самбар", en: "Panel", ko: "패널" },
};

export default function OverlayNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { language: lang, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();
  const router = useRouter(); // Import useRouter

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    // Handle case where specific locale might not be present or we are switching
    // Path usually: /en/monks or /mn/monks
    // We assume the first segment is the locale if it matches known locales, but middleware enforces it.
    // If we are at /, middleware redirects. So pathname always has locale.
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  const toggleLanguage = () => {
    const nextLang = lang === "mn" ? "en" : (lang === "en" ? "ko" : "mn");
    switchLocale(nextLang);
  };

  const desktopNav = [
    { name: { mn: "Нүүр", en: "Home", ko: "홈" }, href: "/" },
    { name: { mn: "Үзмэрч", en: "Exhibitor", ko: "전시자" }, href: "/monks" },
    { name: { mn: "Блог", en: "Blog", ko: "블로그" }, href: "/blog" },
    { name: { mn: "Бидний тухай", en: "About Us", ko: "회사 소개" }, href: "/about" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: { mn: "Нүүр", en: "Home", ko: "홈" } },
    { id: "monks", icon: Users, href: "/monks", label: { mn: "Үзмэрч", en: "Monks", ko: "스님" } },
    { id: "blog", icon: Feather, href: "/blog", label: { mn: "Блог", en: "Blog", ko: "블로그" } },
    { id: "dashboard", icon: LayoutGrid, href: "/dashboard", label: { mn: "Самбар", en: "Panel", ko: "패널" } },
    { id: "about", icon: Compass, href: "/about", label: { mn: "Тухай", en: "About", ko: "소개" } },
  ];

  // Wrapper for Link to include locale
  const LocalizedLink = ({ href, children, ...props }: any) => {
    const path = href === '/' ? `/${lang}` : `/${lang}${href}`;
    return <Link href={path} {...props}>{children}</Link>;
  };

  // Reusable Logo Component for consistency
  const Logo = ({ className = "" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Image Container with Gold Ring */}
      <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0 overflow-hidden rounded-full border border-amber-200 shadow-md bg-gradient-to-br from-white to-amber-50 p-0.5">
        <Image
          src="/logo.png"
          alt="Logo"
          width={44}
          height={44}
          className="w-full h-full object-cover rounded-full"
          priority
          loading="eager"
        />
      </div>

      {/* Text Container - Fixed Alignment */}
      <div className="flex flex-col justify-center">
        <span className={`font-serif font-bold text-xl md:text-2xl leading-none tracking-tight ${isDark ? "text-amber-100" : "text-slate-800"}`}>
          {CONTENT.logo[lang]}
        </span>
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] leading-tight mt-0.5 ${isDark ? "text-amber-400/60" : "text-amber-600/50"}`}>
          Sanctuary
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP HEADER                                         */}
      {/* ========================================================= */}
      {["/sign-in", "/sign-up"].some(p => pathname.includes(p)) ? (
        // --- AUTH PAGE MINIMAL HEADER ---
        <header className="fixed z-50 top-6 left-8 hidden md:block">
          <LocalizedLink href="/" className="group" aria-label="Gevabal Home">
            <Logo />
          </LocalizedLink>
        </header>
      ) : (
        // --- STANDARD CENTERED PILL HERO ---
        <motion.header
          className="fixed z-50 left-0 right-0 hidden md:flex justify-center pointer-events-none"
          animate={{ y: isScrolled ? 15 : 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <nav className={`
            pointer-events-auto flex items-center justify-between transition-all duration-700 rounded-full border backdrop-blur-2xl shadow-2xl
            ${isScrolled
              ? "w-[85%] lg:w-[1100px] py-2 px-8"
              : "w-[90%] lg:w-[1200px] py-4 px-10"}
            ${isDark
              ? "bg-[#1a0f0a]/80 border-amber-800/40 text-amber-50 shadow-black/40"
              : "bg-white/70 border-white/60 text-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"}
          `}>

            {/* Logo Section */}
            <LocalizedLink href="/" className="group opacity-90 hover:opacity-100 transition-opacity" aria-label="Gevabal Home">
              <Logo />
            </LocalizedLink>

            {/* Links Section */}
            <div className="flex items-center gap-1">
              {desktopNav.map((item) => {
                const itemPath = item.href === '/' ? `/${lang}` : `/${lang}${item.href}`;
                const isActive = pathname === itemPath || (item.href !== '/' && pathname.startsWith(itemPath));
                return (
                  <LocalizedLink
                    key={item.href}
                    href={item.href}
                    className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.1em] transition-all relative overflow-hidden group
                      ${isActive
                        ? "text-white shadow-lg shadow-amber-500/20"
                        : "hover:bg-amber-50 hover:text-amber-700"}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="deskNavHighlight"
                        className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={isActive ? "text-white" : (isDark ? "text-amber-100/70" : "text-slate-600")}>
                      {item.name[lang]}
                    </span>
                  </LocalizedLink>
                )
              })}
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-90
                   ${isDark ? "border-amber-800/50 hover:bg-amber-900/30" : "border-amber-100 hover:bg-white hover:shadow-sm text-slate-500 hover:text-amber-600"}`}
                aria-label={lang === 'mn' ? "Switch to English" : "Монгол хэл рүү шилжих"}
              >
                <div className="flex flex-col items-center">
                  <Globe size={16} />
                  <span className="text-[8px] font-bold">{lang.toUpperCase()}</span>
                </div>
              </button>

              <div className={`h-6 w-[1px] mx-1 ${isDark ? "bg-amber-800/50" : "bg-slate-200"}`} />

              {user ? (
                <div className="flex items-center gap-4">
                  <LocalizedLink href="/dashboard" className={`text-xs font-black uppercase tracking-widest border-b-2 border-transparent hover:border-amber-600 transition-all ${isDark ? "text-amber-200" : "text-slate-600 hover:text-amber-700"}`}>
                    {CONTENT.dashboard[lang]}
                  </LocalizedLink>
                  <div className="scale-105">
                    {user.authType === 'clerk' ? (
                      <UserButton />
                    ) : (
                      <div className="relative group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center font-bold overflow-hidden cursor-pointer shadow-lg shadow-amber-600/20">
                          {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                          ) : user.firstName ? (
                            user.firstName[0]
                          ) : (
                            <UserCircle size={20} />
                          )}
                        </div>
                        <button onClick={logout} className="absolute top-full right-0 mt-3 bg-white border border-slate-100 shadow-xl p-3 rounded-2xl text-red-600 text-xs font-bold hidden group-hover:flex items-center gap-2 whitespace-nowrap z-50">
                          <LogOut size={14} /> Log Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <LocalizedLink href="/sign-up">
                  <button className="px-7 py-2.5 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 hover:to-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 transition-all active:scale-95 hover:-translate-y-0.5">
                    {CONTENT.login[lang]}
                  </button>
                </LocalizedLink>
              )}
            </div>
          </nav>
        </motion.header>
      )}


      {/* ========================================================= */}
      {/* 2. MOBILE TOP BAR                                         */}
      {/* ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center pointer-events-none bg-gradient-to-b from-white/90 to-transparent backdrop-blur-[2px]">
        <LocalizedLink href="/" className="pointer-events-auto block" aria-label="Gevabal Home">
          <Logo className="scale-90 origin-left" />
        </LocalizedLink>

        <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
          {!user && (
            <LocalizedLink href="/sign-in">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-5 h-10 rounded-full bg-amber-600 text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-amber-600/30"
              >
                {CONTENT.login[lang]}
              </motion.button>
            </LocalizedLink>
          )}

          <div className="flex gap-1 p-1 rounded-full bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
            <button
              onClick={toggleLanguage}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isDark ? "text-amber-200" : "text-amber-800 bg-white shadow-sm"}`}
            >
              <span className="text-[9px] font-black">{lang.toUpperCase()}</span>
            </button>
          </div>

          {user && (
            <div className="ml-1 scale-110 drop-shadow-md">
              {user.authType === 'clerk' ? <UserButton /> : (
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold overflow-hidden border-2 border-white shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <UserCircle size={18} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM DOCK                                     */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-5 flex justify-center pointer-events-none">
        <nav className={`
          pointer-events-auto flex items-center justify-between w-full max-w-[400px] px-2 py-2 rounded-[2rem] border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-700
          ${isDark ? "bg-[#1a0f0a]/90 border-amber-900/30" : "bg-white/80 border-white/50"}
        `}>
          {mobileNav.filter(item => user ? true : item.id !== 'dashboard').map((item) => {
            const itemPath = item.href === '/' ? `/${lang}` : `/${lang}${item.href}`;
            const isActive = pathname === itemPath || (item.href !== '/' && pathname.startsWith(itemPath));

            return (
              <LocalizedLink key={item.id} href={item.href} className="flex-1 flex flex-col items-center justify-center py-2 relative group min-w-[3.5rem]" aria-label={item.label[lang]}>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActivePill"
                      className="absolute w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 shadow-lg shadow-amber-500/40 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]"
                    />
                  )}
                </AnimatePresence>

                <div className={`transition-all duration-300 mb-1 z-10 ${isActive ? "text-white -translate-y-2" : (isDark ? "text-amber-200/50" : "text-slate-400")}`}>
                  {user && item.id === 'dashboard' ? <item.icon size={20} strokeWidth={2.5} /> :
                    !user && item.id === 'dashboard' ? <LogIn size={20} strokeWidth={2.5} /> :
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                </div>

                <span className={`text-[8px] font-bold uppercase tracking-tight transition-all absolute bottom-1.5 ${isActive ? "opacity-100 text-amber-600 scale-105" : "opacity-0 scale-90"}`}>
                  {user ? item.label[lang] : (item.id === 'dashboard' ? CONTENT.login[lang] : item.label[lang])}
                </span>
              </LocalizedLink>
            );
          })}
        </nav>
      </div>

    </>
  );
}