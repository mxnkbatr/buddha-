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
    <footer className="bg-surface border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Gevabal" width={48} height={48} className="rounded-full" />
              <div>
                <h3 className="font-serif font-bold text-xl text-text-main">Gevabal</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Sanctuary</span>
              </div>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              {t({ 
                mn: "Уламжлалт засал ном, зурхай, зөвлөгөөг орчин үеийн технологийн тусламжтайгаар танд хүргэнэ.",
                en: "Connecting you with spiritual guidance and traditional rituals through modern technology."
              })}
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-text-main">
              {t({ mn: "Цэс", en: "Menu" })}
            </h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><Link href="/" className="hover:text-primary transition-colors">{t({ mn: "Нүүр", en: "Home" })}</Link></li>
              <li><Link href="/monks" className="hover:text-primary transition-colors">{t({ mn: "Үзмэрчид", en: "Masters" })}</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">{t({ mn: "Үйлчилгээ", en: "Services" })}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">{t({ mn: "Блог", en: "Blog" })}</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-text-main">
              {t({ mn: "Тусламж", en: "Support" })}
            </h4>
             <ul className="space-y-4 text-sm text-text-muted">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t({ mn: "Бидний тухай", en: "About Us" })}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t({ mn: "Хэрэглэх заавар", en: "Guide" })}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t({ mn: "Үйлчилгээний нөхцөл", en: "Terms" })}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t({ mn: "Нууцлалын бодлого", en: "Privacy" })}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-text-main">
              {t({ mn: "Холбоо барих", en: "Contact" })}
            </h4>
            <div className="space-y-4 text-sm text-text-muted">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5" />
                <span>Ulaanbaatar, Mongolia</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-primary" />
                <span>+976 99537748</span>
                <span>+976 95614004</span>
              </div>
              
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Youtube size={18} /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
            © {year} Gevabal.
          </p>
        </div>

      </div>
    </footer>
  );
}
