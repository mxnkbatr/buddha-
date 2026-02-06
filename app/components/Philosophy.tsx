"use client";

import React from "react";
import Link from "next/link";
import { Users, Video, BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function PhilosophySection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: { mn: "Мэргэжлийн Багш нар", en: "Expert Masters" },
      desc: { mn: "Олон жилийн туршлагатай, шашны гүн ухаанд мэргэшсэн багш нар.", en: "Experienced masters specialized in spiritual philosophy." }
    },
    {
      icon: <Video className="w-8 h-8 text-primary" />,
      title: { mn: "Онлайн Засал", en: "Live Rituals" },
      desc: { mn: "Гэрээсээ гаралгүйгээр засал номоо уншуулж, шууд холбогдох боломж.", en: "Attend rituals and connect live from the comfort of your home." }
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: { mn: "Өв Соёл", en: "Ancient Wisdom" },
      desc: { mn: "Монголчуудын уламжлалт өв соёл, сургаалыг орчин үеийн хэлбэрээр.", en: "Traditional Mongolian heritage and teachings in a modern format." }
    }
  ];

  return (
    <section className="py-24 bg-surface-alt">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-6">
            {t({ mn: "Бидний Үнэт Зүйл", en: "Our Values" })}
          </h2>
          <p className="max-w-2xl mx-auto text-text-muted text-lg">
            {t({ 
              mn: "Технологийн дэвшлийг ашиглан оюун санааны амар амгаланг түгээх.", 
              en: "Spreading spiritual peace through technological innovation." 
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((f, i) => (
            <div key={i} className="bg-surface p-8 rounded-[2rem] border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">{t(f.title)}</h3>
              <p className="text-text-muted leading-relaxed">
                {t(f.desc)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">
              {t({ mn: "Амар амгаланг мэдэр", en: "Find Your Inner Peace" })}
            </h2>
            <Link href="/monks">
              <button className="bg-white text-primary px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors inline-flex items-center gap-2">
                {t({ mn: "Цаг захиалах", en: "Book a Session" })} <ArrowRight size={18} />
              </button>
            </Link>
          </div>
          {/* Subtle circle bg */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
