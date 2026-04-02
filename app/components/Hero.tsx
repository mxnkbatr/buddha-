"use client";

import React from "react";
import Link from "next/link";
import OptimizedVideo from "./OptimizedVideo";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "@clerk/nextjs";

export default function Hero() {
  const { t } = useLanguage();
  const { isSignedIn } = useUser();

  const content = {
    highlight: t({ mn: "асуудлын", en: "solutions" }),
    btnPrimary: isSignedIn ? t({ mn: "Цаг захиалах", en: "Book Now" }) : t({ mn: "Нэвтрэх", en: "Sign In" }),
    btnPrimaryHref: isSignedIn ? "/monks" : "/sign-in",
    btnSecondary: t({ mn: "Танилцах", en: "Explore" }),
  };

  return (
    <section className="hero-section">
      {/* Background video */}
      <div className="hero-bg">
        <OptimizedVideo
          id="hero-video"
          src="https://res.cloudinary.com/dxoxdiuwr/video/upload/v1768133484/video_kakyvu.mp4"
          poster="https://res.cloudinary.com/dxoxdiuwr/video/upload/q_60,f_webp,c_fill,w_1280,h_720,so_0/video_kakyvu.webp"
          width={1920}
          height={1080}
          className="hero-video"
          useNative={true}
          isLCP={true}
        />
        {/* Overlay: доошоо gradient */}
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content">
        {/* Live badge */}
        <div className="hero-badge">
          <span className="live-dot" />
          <span>{t({ mn: "Live · 3 багш нар", en: "Live · 3 Mentors" })}</span>
        </div>

        <h1 className="text-hero-title">
          {t({ mn: "Бид таны ", en: "We help you find " })}
          <span className="text-saffron">{content.highlight}</span><br />
          {t({ mn: "шийдлийг олоход", en: "to your " })}<br />
          {t({ mn: "тусална", en: "problems" })}
        </h1>

        <p className="hero-subtitle">
          {t({ mn: "Туршлагатай багш нартай холбогдоорой", en: "Connect with experienced mentors" })}
        </p>

        <div className="hero-cta">
          <Link href={content.btnPrimaryHref}>
            <button className="btn-primary">{content.btnPrimary}</button>
          </Link>
          <Link href="/about">
            <button className="btn-ghost">{content.btnSecondary}</button>
          </Link>
        </div>
      </div>
    </section>
  );
}