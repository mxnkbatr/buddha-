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
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: { mn: "Нүүр", en: "Home" } },
    { id: "monks", icon: Users, href: "/monks", label: { mn: "Үзмэрч", en: "Monks" } },
    { id: "blog", icon: Feather, href: "/blog", label: { mn: "Блог", en: "Blog" } },
    { id: "messenger", icon: MessageSquare, href: "/messenger", label: { mn: "Мессенжер", en: "Messenger" }, auth: true },
    { id: "dashboard", icon: LayoutGrid, href: "/dashboard", label: { mn: "Самбар", en: "Panel" }, auth: true },
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
      <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-full border border-border bg-white p-1 shadow-card">
        <Image
          src="/logo.webp"
          alt="Logo"
          width={48}
          height={48}
          className="w-full h-full object-cover rounded-full"
          priority
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="font-serif font-black text-xl text-ink leading-none tracking-tight">
          {CONTENT.logo[lang]}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/80 leading-tight mt-1">
          {lang === 'mn' ? 'Ариун' : 'Sanctuary'}
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
            ? "w-[85%] py-2.5 px-6 bg-white/95 border-border shadow-lg shadow-black/5"
            : "w-[90%] py-4 px-8 bg-cream/70 border-white/50 shadow-sm"}
        `}>

          <LocalizedLink href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </LocalizedLink>

          <div className="flex items-center gap-1 bg-stone/50 p-1.5 rounded-full border border-border/40">
            {desktopNav.filter(item => !item.auth || user).map((item) => {
              const isActive = getIsActive(item.href);
              return (
                <LocalizedLink
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all relative
                    ${isActive ? "text-white" : "text-earth hover:bg-white/80 hover:text-gold"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="deskNavHighlight"
                      className="absolute inset-0 bg-gold rounded-full -z-10 shadow-gold"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.name[lang]}
                </LocalizedLink>
              )
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <LocalizedLink href="/dashboard" className="text-xs font-black uppercase tracking-widest text-ink hover:text-gold transition-colors">
                  {CONTENT.dashboard[lang]}
                </LocalizedLink>
                <div className="scale-100 hover:scale-105 transition-transform">
                  <UserButton />
                </div>
              </div>
            ) : (
              <LocalizedLink href="/sign-in">
                <button className="cta-button text-xs py-2.5 px-6 uppercase tracking-[0.2em]">
                  {CONTENT.login[lang]}
                </button>
              </LocalizedLink>
            )}
          </div>
        </nav>
      </motion.header>

      {/* --- MOBILE TOP HEADER (iOS Status Bar Optimized) --- */}
      <div
        className="md:hidden mobile-header"
        style={{ paddingTop: `max(${safeArea.top}px, 44px)` }}
      >
        <LocalizedLink href="/" aria-label="Home">
          <Logo className="scale-90 origin-left" />
        </LocalizedLink>

        <div className="header-actions">
          {user ? (
            <div className="scale-90 origin-right transition-transform hover:scale-100">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <LocalizedLink href="/sign-in">
              <button className="bg-gold text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {CONTENT.login[lang]}
              </button>
            </LocalizedLink>
          )}
        </div>
      </div>

      {/* --- MOBILE BOTTOM TAB BAR (iOS Native Feel) --- */}
      {!isAuthPage && (
        <nav
          className="md:hidden mobile-tab-bar"
          style={{ paddingBottom: `max(${safeArea.bottom}px, 16px)` }}
        >
          {mobileNav.filter(item => !item.auth || user).map((item) => {
            const isActive = getIsActive(item.href);

            const handleTap = async () => {
              if (isNative) {
                await hapticsLight();
              }
            };

            const validLang = lang as 'mn' | 'en';

            return (
              <LocalizedLink 
                key={item.id}
                href={item.href} 
                className="tab-item"
                onClick={handleTap}
              >
                <div className={`tab-icon-wrap ${isActive ? 'active' : ''}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`tab-label ${isActive ? 'active' : ''}`}>
                  {item.label[validLang]}
                </span>
                {isActive && <div className="tab-active-dot" />}
              </LocalizedLink>
            );
          })}
        </nav>
      )}
    </>
  );
}