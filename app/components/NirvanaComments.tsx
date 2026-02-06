"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const COMMENTS = [
  {
    name: "Munkhbaatar D.",
    role: "User",
    text: "Хүүхдүүд маань энэ сайтыг зааж өгөөд, багштай холбож өгсөн. Дүрс нь маш тод, дуу нь цэвэрхэн. Их буянтай ажил байна.",
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">
              {t({ mn: "Сэтгэгдэл", en: "Community Stories" })}
            </h2>
            <p className="text-text-muted">
              {t({ mn: "Манай үйлчилгээг авсан хүмүүсийн сэтгэгдэл", en: "Hear from people who found guidance" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMENTS.map((c, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-border flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100">
                  <Image src={c.avatar} alt={c.name} width={48} height={48} className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main">{c.name}</h4>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{c.role}</span>
                </div>
              </div>
              
              <div className="flex-1">
                 <Quote className="text-primary/20 mb-2" size={24} />
                 <p className="text-text-muted italic leading-relaxed">
                   "{c.text}"
                 </p>
              </div>

              <div className="mt-6 flex gap-1">
                {[1,2,3,4,5].map(star => <Star key={star} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
