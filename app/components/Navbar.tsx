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
  Bell,
  X,
  Calendar,
  ArrowRight
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
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
  const isSubPage = false;


  // --- WISHLIST & NOTIFICATIONS STATE ---
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (user && isWishlistOpen) {
      fetch("/api/user/wishlist")
        .then(res => res.json())
        .then(data => setWishlist(data.wishlist || []))
        .catch(console.error);
    }
  }, [user, isWishlistOpen]);

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

          <div className="flex items-center gap-4 px-2 relative">
            {/* --- WISHLIST --- */}
            <div className="relative">
              <button 
                onClick={() => { setIsWishlistOpen(!isWishlistOpen); setIsNotifOpen(false); }}
                className={`p-2 transition-all duration-300 rounded-full ${isWishlistOpen ? 'bg-gold/10 text-gold shadow-[0_0_15px_rgba(217,119,6,0.2)]' : 'text-earth hover:text-gold'}`}
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={isWishlistOpen ? 2.5 : 2} fill={isWishlistOpen ? "currentColor" : "none"} />
              </button>

              {isWishlistOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-border flex justify-between items-center bg-cream/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-ink">Дуртай багш нар</h3>
                    <button onClick={() => setIsWishlistOpen(false)}><X size={14} /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {wishlist.length === 0 ? (
                      <div className="p-8 text-center text-earth text-xs italic">Хоосон байна</div>
                    ) : (
                      wishlist.map(monk => (
                        <LocalizedLink 
                          key={monk._id} 
                          href={`/monks/${monk._id}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-cream transition-colors border-b border-stone/50 last:border-0"
                        >
                          <img src={monk.image} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                          <div>
                            <p className="text-xs font-bold text-ink">{monk.name?.[lang] || monk.name?.mn}</p>
                            <p className="text-[10px] text-earth">{monk.title?.[lang] || monk.title?.mn}</p>
                          </div>
                          <ArrowRight size={12} className="ml-auto text-gold/50" />
                        </LocalizedLink>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- NOTIFICATIONS --- */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsWishlistOpen(false); }}
                className={`p-2 transition-all duration-300 rounded-full relative ${isNotifOpen ? 'bg-gold/10 text-gold shadow-[0_0_15px_rgba(217,119,6,0.2)]' : 'text-earth hover:text-gold'}`}
                aria-label="Notifications"
              >
                <Bell size={20} strokeWidth={isNotifOpen ? 2.5 : 2} fill={isNotifOpen ? "currentColor" : "none"} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-border flex justify-between items-center bg-cream/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-ink">Мэдэгдэл</h3>
                    <div className="flex gap-3">
                      <button onClick={() => markAsRead(undefined, true)} className="text-[10px] font-bold text-gold hover:underline">Бүгдийг уншсан</button>
                      <button onClick={() => setIsNotifOpen(false)}><X size={14} /></button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-earth text-xs italic">Мэдэгдэл алга</div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div 
                          key={notif._id?.toString()} 
                          className={`p-4 border-b border-stone/30 last:border-0 hover:bg-cream/30 transition-colors ${!notif.read ? 'bg-gold/5' : ''}`}
                          onClick={() => !notif.read && markAsRead(notif._id?.toString())}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'booking' ? 'bg-gold' : 'bg-success'}`} />
                            <div className="flex-1">
                              <p className="text-[11px] font-black text-ink mb-0.5">{notif.title[lang === 'mn' ? 'mn' : 'en']}</p>
                              <p className="text-[11px] text-earth leading-relaxed">{notif.message[lang === 'mn' ? 'mn' : 'en']}</p>
                              <p className="text-[9px] text-earth/60 mt-2 flex items-center gap-1">
                                <Calendar size={10} /> 
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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