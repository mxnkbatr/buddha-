"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "@clerk/nextjs";

export default function Hero() {
  const { t } = useLanguage();
  const { isSignedIn } = useUser();

  const content = {
    highlight: t({ mn: "асуудлын", en: "solutions" }),
    btnPrimary: isSignedIn ? t({ mn: "Цаг захиалах", en: "Book Now" }) : t({ mn: "Нэвтрэх", en: "Sign In" }),
    btnPrimaryHref: isSignedIn ? "/monks" : "/sign-in",
  };

  return (
    <section className="hero-section">
      {/* Content */}
      <div className="hero-content">
        <div className="luminous-banner">
          {/* Right Side: Buddha Overlay */}
          <div className="luminous-buddha-wrap">
            <img 
              src="https://res.cloudinary.com/dxoxdiuwr/video/upload/q_auto:best,f_auto,e_contrast:40,e_vibrance:50,c_fill,w_1200,h_600,so_0/video_kakyvu.webp"


              alt="Buddha"
              className="luminous-buddha-img"
            />
          </div>

          {/* Left Side: Content Area */}
          <div className="luminous-content">
            {/* Status Badge */}
            <div className="luminous-status">
              <span className="live-dot" />
              <span>{t({ mn: "Live - 3 багш нар", en: "Live - 3 Mentors" })}</span>
            </div>

            <h1 className="luminous-title">
              {t({ 
                mn: "Бид таны асуудлын шийдлийг олоход тусална", 
                en: "We help you find solutions to your spiritual questions" 
              })}
            </h1>

            <p className="text-[12px] opacity-70 font-medium text-[#1A0800]">
              {t({ mn: "Туршлагатай багш нартай холболдоорой", en: "Connect with experienced mentors" })}
            </p>

            <div className="mt-2">
              <Link href={content.btnPrimaryHref}>
                <button className="luminous-btn-sm">НЭВТРЭХ</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}