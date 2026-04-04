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
  MessageSquare,
  Heart,
  Bell
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
  profile: { mn: "Профайл", en: "Profile" },
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
    { id: "profile", icon: UserCircle, href: "/profile", label: { mn: "Профайл", en: "Profile" }, auth: false },
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

      </div>
    </div>
  );

  const isAuthPage = ["/sign-in", "/sign-up"].some(p => pathname.includes(p));
  const isSubPage = pathname.split('/').length > 2 && 
                    !['dashboard', 'messenger', 'blog', 'monks'].includes(pathname.split('/')[2]);

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <header
        className="fixed z-50 top-0 left-0 right-0 hidden md:flex justify-center bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-3 px-8 transition-none"
      >
        <nav className="w-full max-w-7xl flex items-center justify-between">

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

          <div className="flex items-center gap-4 px-2">
            <button className="p-2 text-earth hover:text-gold transition-colors relative" aria-label="Wishlist">
              <Heart size={20} strokeWidth={2} />
            </button>
            <button className="p-2 text-earth hover:text-gold transition-colors relative" aria-label="Notifications">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white shadow-sm" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <LocalizedLink href="/profile" className="text-xs font-black uppercase tracking-widest text-ink hover:text-gold transition-colors">
                  {CONTENT.profile[lang]}
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
      </header>

      {/* --- MOBILE TOP HEADER (iOS Status Bar Optimized) --- */}
      {!isSubPage && (
        <div
          className="md:hidden mobile-header"
          style={{ paddingTop: `max(${safeArea.top}px, 20px)`, paddingBottom: 8 }}
        >
        <LocalizedLink href="/" aria-label="Home" className="scale-75 origin-left">
          <Logo />
        </LocalizedLink>

        <div className="header-actions flex items-center gap-1.5 mb-1">
          <button className="p-2 text-earth active:scale-90 transition-transform" aria-label="Wishlist">
            <Heart size={18} strokeWidth={2} />
          </button>
          <button className="relative p-2 text-earth active:scale-90 transition-transform" aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error rounded-full border border-white" />
          </button>

          {user ? (
            <div className="scale-90 origin-right transition-transform hover:scale-100">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <LocalizedLink href="/sign-in">
              <button className="bg-gold text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-transform">
                {CONTENT.login[lang]}
              </button>
            </LocalizedLink>
          )}
        </div>
      </div>
      )}

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