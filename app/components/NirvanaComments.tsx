"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const COMMENTS = [
  {
    name: "Munkhbaatar D.",
    role: "User",
    text: "Хүүхдүүд маань энэ сайтыг зааж өгөөд, багштай холбож өгсөн. Дүрс нь маш тод, дуу нь цэвэрхэн.",
    avatar: "https://i.pravatar.cc/150?u=1"
  },
  {
    name: "Sarnai B.",
    role: "User",
    text: "Заавал хийд явж дугаарлахгүйгээр, гэрээсээ бүх үйлчилгээгээ аваад, төлбөрөө төлчихдөг нь цаг маш их хэмнэсэн.",
    avatar: "https://i.pravatar.cc/150?u=2"
  },
  {
    name: "Bold E.",
    role: "User",
    text: "Үзмэрч маань маш тодорхой, ойлгомжтой тайлбарлаж өгсөн. Вэбсайт нь хэрэглэхэд маш хялбар юм байна.",
    avatar: "https://i.pravatar.cc/150?u=3"
  }
];

export default function NirvanaComments() {
  const { t } = useLanguage();

  return (
    <section className="app-section !bg-white">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        <div className="app-section-header">
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-ink mb-2 tracking-tight"
            >
              {t({ mn: "Сэтгэгдэл", en: "Community Stories" })}
            </motion.h2>
            <p className="text-earth/60 text-sm max-w-md">
              {t({ 
                mn: "Манай багш нартай холбогдсон хүмүүсийн бодит түүх, сэтгэгдлүүд.", 
                en: "Real stories from people who found clarity and peace through our sanctuary." 
              })}
            </p>
        </div>

        <div className="app-carousel hide-scrollbar md:grid md:grid-cols-3 md:gap-8 md:px-6">
          {COMMENTS.map((c, i) => (
            <motion.div 
              key={i} 
              whileTap={{ scale: 0.98 }}
              className="app-card-premium p-10 flex flex-col h-full !bg-cream/30 border-none shadow-none"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                  <Image src={c.avatar} alt={c.name} width={80} height={80} className="object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-ink leading-tight">{c.name}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold opacity-80">{c.role}</span>
                </div>
              </div>
              
              <div className="flex-1 relative text-center">
                 <Quote className="text-gold/10 absolute -top-4 left-1/2 -translate-x-1/2" size={40} />
                 <p className="text-base italic text-earth leading-relaxed font-serif relative z-10">
                   "{c.text}"
                 </p>
              </div>

              <div className="mt-8 pt-6 border-t border-earth/5 flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => <Star key={star} size={12} className="text-gold fill-gold" />)}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-earth/30">Verified User</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
