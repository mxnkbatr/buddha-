"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  MessageSquare,
  UserCircle,
  Heart,
  Bell,
  X,
  Calendar,
  ArrowRight,
  CalendarPlus
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePlatform } from "@/app/capacitor/hooks/usePlatform";
import { hapticsLight } from "@/app/capacitor/plugins/haptics";

const CONTENT = {
  logo: { mn: "Гэвабaл", en: "Gevabal" },
  login: { mn: "Нэвтрэх", en: "Sign In" },
  profile: { mn: "Профайл", en: "Profile" },
};

export default function NativeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { language: lang } = useLanguage();
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const router = useRouter();
  const { isNative, safeArea } = usePlatform();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  if (!mounted) return null;

  const getIsActive = (href: string) => {
    const itemPath = href === '/' ? `/${lang}` : `/${lang}${href}`;
    return pathname === itemPath || (href !== '/' && pathname.startsWith(itemPath));
  };

  const LocalizedLink = ({ href, children, ...props }: any) => {
    const path = href === '/' ? `/${lang}` : `/${lang}${href}`;
    return <Link href={path} {...props}>{children}</Link>;
  };

  const Logo = ({ className = "" }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-[14px] border border-stone/60 bg-white p-[2px] shadow-sm">
        <Image
          src="/logo.webp"
          alt="Logo"
          width={40}
          height={40}
          className="w-full h-full object-cover rounded-[10px]"
          priority
        />
      </div>
      <span className="font-serif font-black text-lg text-ink leading-none tracking-tight">
        {CONTENT.logo[lang]}
      </span>
    </div>
  );

  const desktopNav = [
    { name: { mn: "Нүүр", en: "Home" }, href: "/" },
    { name: { mn: "Үзмэрч", en: "Exhibitor" }, href: "/monks" },
    { name: { mn: "Захиалга", en: "Booking" }, href: "/booking" },
    { name: { mn: "Мессенжер", en: "Messenger" }, href: "/messenger", auth: true },
  ];

  const mobileNav = [
    { id: 'home', icon: Home, href: '/', label: { mn:'Нүүр', en:'Home' } },
    { id: 'monks', icon: Users, href: '/monks', label: { mn:'Лам нар', en:'Monks' } },
    { id: 'booking', icon: CalendarPlus, href: '/booking', label: { mn:'Захиалга', en:'Book' }, isCTA: true },
    { id: 'messenger', icon: MessageSquare, href: '/messenger', label: { mn:'Мессеж', en:'Messages' }, auth: true },
    { id: 'profile', icon: UserCircle, href: '/profile', label: { mn:'Профайл', en:'Profile' } }
  ];

  const isAuthPage = ["/sign-in", "/sign-up"].some(p => pathname.includes(p));

  return (
    <>
      {/* ── DESKTOP NAVBAR (Unchanged as requested) ── */}
      <header className="fixed z-50 top-0 left-0 right-0 hidden md:flex justify-center bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-3 px-8 transition-none">
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
                    <motion.div layoutId="deskNavHighlight" className="absolute inset-0 bg-gold rounded-full -z-10 shadow-gold" />
                  )}
                  {item.name[lang]}
                </LocalizedLink>
              )
            })}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <LocalizedLink href="/profile" className="text-xs font-black uppercase tracking-widest text-ink hover:text-gold transition-colors">
                  {CONTENT.profile[lang]}
                </LocalizedLink>
                <div className="scale-100 hover:scale-105 transition-transform"><UserButton /></div>
              </div>
            ) : (
              <LocalizedLink href="/sign-in"><button className="btn-primary text-xs py-2.5 px-6">{CONTENT.login[lang]}</button></LocalizedLink>
            )}
          </div>
        </nav>
      </header>

      {/* ── MOBILE TOP HEADER ── */}
      {!isAuthPage && (
        <header 
          className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex items-center justify-between px-5 ${
            isScrolled ? "bg-[rgba(253,251,247,0.92)] backdrop-blur-[20px] border-b border-stone/30" : "bg-transparent"
          }`}
          style={{ 
            height: `calc(54px + env(safe-area-inset-top, 44px))`,
            paddingTop: isNative ? `${Math.max(safeArea.top, 20)}px` : 'env(safe-area-inset-top, 44px)'
          }}
        >
          <LocalizedLink href="/" aria-label="Home" className="active:opacity-70 transition-opacity">
            <Logo />
          </LocalizedLink>

          <div className="flex items-center gap-3">
             <button className="tappable w-9 h-9 rounded-full bg-stone/50 flex items-center justify-center text-earth">
               <Heart size={18} strokeWidth={2.5} />
             </button>
             <button className="tappable w-9 h-9 rounded-full bg-stone/50 flex items-center justify-center text-earth relative">
               <Bell size={18} strokeWidth={2.5} />
               {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border border-white" />}
             </button>
             {user ? (
               <div className="transform scale-90"><UserButton /></div>
             ) : (
               <LocalizedLink href="/sign-in">
                 <button className="tappable bg-ink text-white rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                    Орох
                 </button>
               </LocalizedLink>
             )}
          </div>
        </header>
      )}

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      {!isAuthPage && (
        <nav 
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-2 pb-[env(safe-area-inset-bottom,0px)]"
          style={{ 
             height: `calc(83px + env(safe-area-inset-bottom, 0px))`,
             backgroundColor: "rgba(253, 251, 247, 0.92)",
             backdropFilter: "blur(20px)",
             WebkitBackdropFilter: "blur(20px)",
             borderTop: "0.5px solid rgba(28,20,16,0.08)"
          }}
        >
          {mobileNav.filter(item => !item.auth || user).map((item) => {
            const isActive = getIsActive(item.href);
            const isCTA = item.isCTA;
            const validLang = lang as 'mn' | 'en';

            const handleTap = async () => {
              if (isNative) {
                await hapticsLight();
              }
            };

            if (isCTA) {
              return (
                <LocalizedLink 
                  key={item.id} 
                  href={item.href}
                  onClick={handleTap}
                  className="flex flex-col items-center justify-center relative flex-1 tappable -translate-y-[16px]"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-gold flex items-center justify-center shadow-gold text-white">
                     <item.icon size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-ink mt-1.5 opacity-80 uppercase">
                    {item.label[validLang]}
                  </span>
                </LocalizedLink>
              );
            }

            return (
              <LocalizedLink
                key={item.id}
                href={item.href}
                onClick={handleTap}
                className="flex flex-col items-center justify-center flex-1 tappable relative h-full"
              >
                <div 
                  className={`w-12 h-10 flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-gold/15 text-gold rounded-[12px] -translate-y-1" : "text-earth/70"
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "drop-shadow-sm" : ""} />
                  
                  {/* Unread badge for messenger */}
                  {item.id === "messenger" && unreadCount > 0 && (
                    <span className="absolute top-2 right-[25%] w-2.5 h-2.5 bg-error rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                <span 
                  className={`text-[9px] font-black uppercase tracking-wider transition-all duration-300 absolute bottom-3 ${
                    isActive ? "text-gold opacity-100 translate-y-0" : "text-earth/50 opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  {item.label[validLang]}
                </span>
              </LocalizedLink>
            );
          })}
        </nav>
      )}
    </>
  );
}