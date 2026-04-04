"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-hero-bg border-t border-white/5 pt-32 pb-12 relative overflow-hidden hidden md:block">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('/noise.svg')]" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          {/* Brand */}
          <div className="md:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-14 h-14 p-1 bg-white/5 rounded-full border border-white/10 group-hover:border-gold/30 transition-colors">
                <Image src="/logo.webp" alt="Gevabal" width={56} height={56} className="rounded-full" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-serif font-black text-2xl text-white tracking-tight leading-none italic">Gevabal</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mt-1.5 opacity-80">Sanctuary</span>
              </div>
            </Link>
            <p className="text-secondary opacity-60 leading-relaxed text-sm font-sans italic">
              {t({ 
                mn: "Уламжлалт засал ном, зурхай, зөвлөгөөг орчин үеийн технологийн тусламжтайгаар танд хүргэнэ.",
                en: "Connecting you with spiritual guidance and traditional rituals through modern technology."
              })}
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-label text-gold/60 mb-10">
              {t({ mn: "Цэс", en: "Navigation" })}
            </h4>
            <ul className="space-y-5">
              {[
                { mn: "Нүүр", en: "Home", href: "/" },
                { mn: "Үзмэрчид", en: "Masters", href: "/monks" },
                { mn: "Үйлчилгээ", en: "Rituals", href: "/services" },
                { mn: "Блог", en: "Journal", href: "/blog" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm font-black uppercase tracking-widest text-white/40 hover:text-gold transition-colors block">
                    {t(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-label text-gold/60 mb-10">
              {t({ mn: "Тусламж", en: "Protocol" })}
            </h4>
             <ul className="space-y-5">
               {[
                { mn: "Бидний тухай", en: "Ancestry", href: "/about" },
                { mn: "Хэрэглэх заавар", en: "Manual", href: "#" },
                { mn: "Үйлчилгээний нөхцөл", en: "Codex", href: "#" },
                { mn: "Нууцлалын бодлого", en: "Sanctity", href: "#" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm font-black uppercase tracking-widest text-white/40 hover:text-gold transition-colors block">
                    {t(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h4 className="text-label text-gold/60 mb-10">
              {t({ mn: "Холбоо барих", en: "Ascent" })}
            </h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="p-2 rounded-xl bg-white/5 text-gold group-hover:bg-gold/10 transition-colors">
                  <MapPin size={18} />
                </div>
                <span className="text-secondary opacity-60 text-sm">Ulaanbaatar, Mongolia</span>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="p-2 rounded-xl bg-white/5 text-gold group-hover:bg-gold/10 transition-colors">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-secondary opacity-60 text-sm">+976 9953 7748</span>
                  <span className="text-secondary opacity-60 text-sm">+976 9561 4004</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-10">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/5 hover:border-gold/30 hover:text-gold hover:bg-gold/5 transition-all duration-500">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            © {year} Gevabal Sanctuary. All rights reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">Pure Intention</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/40">Ancient Wisdom</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
