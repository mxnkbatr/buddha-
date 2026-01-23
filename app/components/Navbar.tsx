"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  Sparkles,
  LayoutGrid,
  Compass,
  Globe,
  Sun,
  Moon,
  LogIn,
  UserCircle,
  BookOpen,
  Flower,
  LogOut
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const CONTENT = {
  logo: { mn: "Гэвабaл", en: "Gevabal" },
  login: { mn: "Нэвтрэх", en: "Sign In" },
  register: { mn: "Бүртгүүлэх", en: "Register" },
  dashboard: { mn: "Самбар", en: "Panel" },
};

export default function OverlayNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { language: lang, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Monitor scroll for desktop pill effect
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  if (!mounted) return null;

  const isDark = false;
  const toggleLanguage = () => setLanguage(lang === "mn" ? "en" : "mn");
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const desktopNav = [
    { name: { mn: "Нүүр", en: "Home" }, href: "/" },
    { name: { mn: "Үзмэрч", en: "Exhibitor" }, href: "/monks" },
    { name: { mn: "Бидний тухай", en: "About Us" }, href: "/about" },
    { name: { mn: "Заавар", en: "Guide" }, href: "/guide" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: { mn: "Нүүр", en: "Home" } },
    { id: "monks", icon: Users, href: "/monks", label: { mn: "Үзмэрч", en: "Monks" } },
    { id: "dashboard", icon: LayoutGrid, href: "/dashboard", label: { mn: "Самбар", en: "Panel" } },
    { id: "guide", icon: BookOpen, href: "/guide", label: { mn: "Заавар", en: "Guide" } },
    { id: "about", icon: Compass, href: "/about", label: { mn: "Тухай", en: "About" } },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP HEADER (Extra Rounded Pill)                   */}
      {/* ========================================================= */}
      <motion.header
        className="fixed z-50 left-0 right-0 hidden md:flex justify-center pointer-events-none"
        animate={{ y: isScrolled ? 15 : 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <nav className={`
          pointer-events-auto flex items-center justify-between transition-all duration-700 rounded-full border backdrop-blur-2xl shadow-2xl
          ${isScrolled
            ? "w-[85%] lg:w-[1100px] py-3 px-10"
            : "w-[90%] lg:w-[1200px] py-5 px-12"}
          ${isDark
            ? "bg-[#d4a373]/90 border-amber-700/50 text-[#451a03] shadow-amber-900/20"
            : "bg-white/80 border-amber-100 text-[#451a03] shadow-amber-900/10"}
        `}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Gevabal Home">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-amber-500/20 shadow-inner">
              <Image src="/logo.png" alt="Logo" width={40} height={40} priority className="object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="font-serif font-black text-xl tracking-tighter">{CONTENT.logo[lang]}</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full">
            {desktopNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.1em] transition-all
                  ${pathname === item.href
                    ? (isDark ? "bg-amber-600 text-[#1a0505]" : "bg-[#451a03] text-white")
                    : "opacity-60 hover:opacity-100"}`}
              >
                {item.name[lang]}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="w-11 h-11 rounded-full border flex items-center justify-center border-current/10 hover:bg-current/10 transition-all active:scale-90"
              aria-label={lang === 'mn' ? "Switch to English" : "Монгол хэл рүү шилжих"}
            >
              <Globe size={18} />
            </button>

            <div className="h-8 w-[1px] bg-current/10 mx-1" />

            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 border-b-2 border-amber-500/50">
                  {CONTENT.dashboard[lang]}
                </Link>
                <div className="scale-110">
                    {user.authType === 'clerk' ? (
                        <UserButton />
                    ) : (
                        <div className="relative group">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold overflow-hidden cursor-pointer">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                                ) : user.firstName ? (
                                    user.firstName[0]
                                ) : user.phone ? (
                                    user.phone.slice(-4)
                                ) : (
                                    <UserCircle size={20} />
                                )}
                            </div>
                            <button onClick={logout} className="absolute top-full right-0 mt-2 bg-white border shadow-xl p-2 rounded-xl text-red-500 text-xs font-bold hidden group-hover:flex items-center gap-2 whitespace-nowrap">
                                <LogOut size={14} /> Log Out
                            </button>
                        </div>
                    )}
                </div>
              </div>
            ) : (
              <Link href="/sign-in">
                <button className="px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 transition-all active:scale-95">
                  {CONTENT.login[lang]}
                </button>
              </Link>
            )}
          </div>
        </nav>
      </motion.header>


      {/* ========================================================= */}
      {/* 2. MOBILE TOP BAR (High Obviousness Login)               */}
      {/* ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 group max-w-[40%]" aria-label="Gevabal Home">
          <div className="relative w-8 h-8 overflow-hidden rounded-full border-2 border-amber-400/30 shadow-inner group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={32} height={32} sizes="32px" className="object-cover" />
          </div>
          <span className="font-serif font-black text-sm tracking-tight text-white drop-shadow-md truncate">{CONTENT.logo[lang]}</span>
        </Link>

        <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
          {/* VERY OBVIOUS LOGIN BUTTON FOR MOBILE */}
          {!user && (
            <Link href="/sign-in">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="px-5 h-11 rounded-full bg-amber-600 text-white text-[11px] font-black tracking-tighter uppercase shadow-lg shadow-amber-900/30 border border-amber-400/50"
              >
                {CONTENT.login[lang]}
              </motion.button>
            </Link>
          )}

          {/* Quick Action Circle Buttons */}
          <div className="flex gap-1 p-1 rounded-full bg-black/5 backdrop-blur-md border border-white/10">
            <button
              onClick={toggleLanguage}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? "text-amber-200" : "text-amber-900"}`}
              aria-label={lang === 'mn' ? "Switch to English" : "Монгол хэл рүү шилжих"}
            >
              <span className="text-[10px] font-black">{lang === 'mn' ? 'EN' : 'MN'}</span>
            </button>


          </div>

          {user && (
            <div className="ml-1 scale-125 drop-shadow-lg">
                {user.authType === 'clerk' ? <UserButton /> : (
                    <Link href="/dashboard" className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold overflow-hidden border-2 border-white">
                        {user.avatar ? (
                            <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                        ) : user.firstName ? (
                            user.firstName[0]
                        ) : user.phone ? (
                            <span className="text-[8px]">{user.phone.slice(-4)}</span>
                        ) : (
                            <UserCircle size={16} />
                        )}
                    </Link>
                )}
            </div>
          )}
        </div>
      </div>


      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM DOCK (Extra Rounded & Labeled)          */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-5 flex justify-center">
        <nav className={`
          flex items-center justify-between text-black
          
          
          w-full max-w-[440px] px-3 py-3 rounded-full border shadow-[0_-15px_50px_rgba(0,0,0,0.2)] backdrop-blur-3xl transition-all duration-700
          ${isDark ? "bg-[#1a0505]/95 border-amber-900/50 shadow-black" : "bg-white/95 border-amber-100 shadow-amber-900/10"}
        `}>
          {mobileNav.map((item) => {
            const isActive = pathname === item.href;

            // Standard Icons (Dynamic Dashboard/Login logic)
            return (
              <Link key={item.id} href={item.href} className="flex-1 flex flex-col items-center justify-center py-2 relative group" aria-label={item.label[lang]}>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className={`absolute inset-x-2 inset-y-1 rounded-full -z-10 ${isDark ? "bg-amber-900/20" : "bg-amber-100"}`}
                    />
                  )}
                </AnimatePresence>

                <div className={`transition-all duration-300 mb-1 ${isActive ? (isDark ? "text-amber-400 scale-110" : "text-[#451a03] scale-110") : "opacity-40"}`}>
                  {user ? (
                    item.id === 'dashboard' ? <item.icon size={22} strokeWidth={2.5} /> : <item.icon size={22} strokeWidth={2} />
                  ) : (
                    item.id === 'dashboard' ? <LogIn size={22} strokeWidth={2.5} /> : <item.icon size={22} strokeWidth={2} />
                  )}
                </div>

                <span className={`text-[9px] font-black uppercase tracking-tight transition-all ${isActive ? "opacity-100" : "opacity-30"}`}>
                  {user ? item.label[lang] : (item.id === 'dashboard' ? CONTENT.login[lang] : item.label[lang])}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

    </>
  );
}