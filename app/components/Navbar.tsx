"use client";

import React, { useState, useEffect, useRef } from "react";
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
  LogOut,
  Feather,
  MessageSquare
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatform } from "@/app/capacitor/hooks/usePlatform";
import { hapticsLight, hapticsMedium } from "@/app/capacitor/plugins/haptics";

const CONTENT = {
  logo: { mn: "Гэвабaл", en: "Gevabal" },
  login: { mn: "Нэвтрэх", en: "Sign In" },
  register: { mn: "Бүртгүүлэх", en: "Register" },
  dashboard: { mn: "Самбар", en: "Panel" },
  messenger: { mn: "Мессенжер", en: "Messenger" },
};

export default function OverlayNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { language: lang, setLanguage } = useLanguage();
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isNative, safeArea } = usePlatform();

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  if (!mounted) return null;

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  const toggleLanguage = async () => {
    // Haptic feedback on native platforms
    if (isNative) {
      await hapticsLight();
    }
    const nextLang = lang === "mn" ? "en" : "mn";
    switchLocale(nextLang);
  };

  const desktopNav = [
    { name: { mn: "Нүүр", en: "Home" }, href: "/" },
    { name: { mn: "Үзмэрч", en: "Exhibitor" }, href: "/monks" },
    { name: { mn: "Блог", en: "Blog" }, href: "/blog" },
    { name: { mn: "Мессенжер", en: "Messenger" }, href: "/messenger", auth: true },
    { name: { mn: "Бидний тухай", en: "About Us" }, href: "/about" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: { mn: "Нүүр", en: "Home" } },
    { id: "monks", icon: Users, href: "/monks", label: { mn: "Үзмэрч", en: "Monks" } },
    { id: "blog", icon: Feather, href: "/blog", label: { mn: "Блог", en: "Blog" } },
    { id: "messenger", icon: MessageSquare, href: "/messenger", label: { mn: "Мессенжер", en: "Messenger" }, auth: true },
    { id: "dashboard", icon: LayoutGrid, href: "/dashboard", label: { mn: "Самбар", en: "Panel" }, auth: true },
    { id: "about", icon: Compass, href: "/about", label: { mn: "Тухай", en: "About" } },
  ];

  const getIsActive = (href: string) => {
    const itemPath = href === '/' ? `/${lang}` : `/${lang}${href}`;
    return pathname === itemPath || (href !== '/' && pathname.startsWith(itemPath));
  };

  const LocalizedLink = ({ href, children, ...props }: any) => {
    const path = href === '/' ? `/${lang}` : `/${lang}${href}`;
    return <Link href={path} {...props}>{children}</Link>;
  };

  const Logo = ({ className = "" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-surface p-0.5 shadow-sm">
        <Image
          src="/logo.png"
          alt="Logo"
          width={44}
          height={44}
          className="w-full h-full object-cover rounded-full"
          priority
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="font-serif font-bold text-xl text-text-main leading-none tracking-tight">
          {CONTENT.logo[lang]}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 leading-tight mt-0.5">
          Sanctuary
        </span>
      </div>
    </div>
  );

  const isAuthPage = ["/sign-in", "/sign-up"].some(p => pathname.includes(p));

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <motion.header
        className={`fixed z-50 left-0 right-0 hidden md:flex justify-center pointer-events-none ${isAuthPage ? 'top-4' : ''}`}
        animate={{ y: isAuthPage ? 0 : (isScrolled ? 12 : 24) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className={`
          pointer-events-auto flex items-center justify-between transition-all duration-500 rounded-full border backdrop-blur-md
          ${isScrolled || isAuthPage
            ? "w-[85%] py-2.5 px-6 bg-surface/90 border-border shadow-lg shadow-black/5"
            : "w-[90%] py-4 px-8 bg-surface/70 border-white/50 shadow-sm"}
        `}>

          <LocalizedLink href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </LocalizedLink>

          <div className="flex items-center gap-1 bg-surface-alt/50 p-1 rounded-full border border-white/50">
            {desktopNav.filter(item => !item.auth || user).map((item) => {
              const isActive = getIsActive(item.href);
              return (
                <LocalizedLink
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all relative
                    ${isActive ? "text-white shadow-md" : "text-text-muted hover:bg-white/80 hover:text-primary"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="deskNavHighlight"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.name[lang]}
                </LocalizedLink>
              )
            })}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-white text-text-muted hover:border-primary hover:text-primary transition-colors"
            >
              <span className="text-[10px] font-black">{lang.toUpperCase()}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <LocalizedLink href="/dashboard" className="text-xs font-bold uppercase text-text-main hover:text-primary transition-colors">
                  {CONTENT.dashboard[lang]}
                </LocalizedLink>
                <div className="scale-100 hover:scale-105 transition-transform">
                  <UserButton />
                </div>
              </div>
            ) : (
              <LocalizedLink href="/sign-in">
                <button className="zen-button zen-button-primary text-xs py-2 px-6 uppercase tracking-widest shadow-lg shadow-primary/20">
                  {CONTENT.login[lang]}
                </button>
              </LocalizedLink>
            )}
          </div>
        </nav>
      </motion.header>

      {/* --- MOBILE TOP BAR --- */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 flex justify-between items-center bg-surface/80 backdrop-blur-md border-b border-border"
        style={{
          paddingTop: safeArea.top > 0 ? safeArea.top + 8 : 12,
          paddingBottom: 12,
          paddingLeft: safeArea.left > 0 ? safeArea.left + 16 : 16,
          paddingRight: safeArea.right > 0 ? safeArea.right + 16 : 16,
        }}
      >
        <LocalizedLink href="/" aria-label="Home">
          <Logo className="scale-90 origin-left" />
        </LocalizedLink>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-alt text-text-muted"
          >
            <span className="text-[9px] font-black">{lang.toUpperCase()}</span>
          </button>
          {user ? <UserButton /> : (
            <LocalizedLink href="/sign-in">
              <button className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">
                {CONTENT.login[lang]}
              </button>
            </LocalizedLink>
          )}
        </div>
      </div>

      {/* --- MOBILE BOTTOM DOCK --- */}
      {!isAuthPage && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
          style={{ paddingBottom: safeArea.bottom > 0 ? safeArea.bottom + 8 : 24 }}
        >
          <nav className="pointer-events-auto flex items-center justify-between w-full max-w-[400px] p-1.5 rounded-3xl bg-surface/90 border border-white/50 shadow-xl backdrop-blur-xl overflow-x-auto scrollbar-hide">
            {mobileNav.filter(item => !item.auth || user).map((item) => {
              const isActive = getIsActive(item.href);

              const handleTap = async () => {
                if (isNative) {
                  await hapticsLight();
                }
              };

              return (
                <LocalizedLink
                  key={item.id}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center py-3 relative group min-w-[60px]"
                  onClick={handleTap}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileActivePill"
                      className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                    />
                  )}
                  <div className={`transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-text-muted scale-100"}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                </LocalizedLink>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}