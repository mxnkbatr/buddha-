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
    <section className="py-32 bg-cream relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-display mb-6 text-ink"
            >
              {t({ mn: "Сэтгэгдэл", en: "Community Stories" })}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-secondary max-w-lg text-lg"
            >
              {t({ 
                mn: "Манай багш нартай холбогдсон хүмүүсийн бодит түүх, сэтгэгдлүүд.", 
                en: "Real stories from people who found clarity and peace through our sanctuary." 
              })}
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {COMMENTS.map((c, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="monastery-card p-12 flex flex-col h-full bg-white group hover:border-gold/30 transition-all duration-700"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-3xl overflow-hidden border border-border group-hover:border-gold/20 transition-colors shadow-card">
                  <Image src={c.avatar} alt={c.name} width={64} height={64} className="object-cover" />
                </div>
                <div>
                  <h4 className="text-h2 text-ink mb-1">{c.name}</h4>
                  <span className="text-label text-gold opacity-80">{c.role}</span>
                </div>
              </div>
              
              <div className="flex-1 relative">
                 <Quote className="text-gold/10 absolute -top-4 -left-4" size={48} />
                 <p className="text-body italic text-earth/90 leading-relaxed font-serif relative z-10 text-lg">
                   "{c.text}"
                 </p>
              </div>

              <div className="mt-12 pt-8 border-t border-border/50 flex justify-between items-center">
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} className="text-gold fill-gold" />)}
                </div>
                <span className="text-label text-earth/40">Verified</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
