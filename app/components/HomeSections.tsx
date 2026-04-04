"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../lib/dateUtils";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

const MOCK_BLOGS = [
  {
    id: "b1",
    title: { mn: "Ухаарлын эрчим: Дотоод амар тайвны нууц", en: "Power of Awareness: The Secret of Inner Peace" },
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    date: "2026-03-28",
    author: { mn: "Лам Тэнзин", en: "Lama Tenzin" },
  },
  {
    id: "b2",
    title: { mn: "Бясалгалаар стрессийг даван туулах арга", en: "Overcoming Stress Through Meditation" },
    cover: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80",
    date: "2026-03-22",
    author: { mn: "Болд гэлэн", en: "Gelen Bold" },
  },
  {
    id: "b3",
    title: { mn: "Тарог судлал: Амьдралын зам", en: "Tarot Studies: The Path of Life" },
    cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
    date: "2026-03-15",
    author: { mn: "Сарнай эгч", en: "Sis Sarnai" },
  },
];



// ─── COMPONENT ─────────────────────────────────────────────────────────────

export default function HomeSections({ locale, blogs, monks = [] }: { locale: string; blogs?: any[], monks?: any[] }) {
  const { t, language: lang } = useLanguage();
  const validLang = (["mn", "en"].includes(lang) ? lang : "mn") as "mn" | "en";

  const displayBlogs = blogs && blogs.length > 0 ? blogs.slice(0, 5) : MOCK_BLOGS;
  const displayMonks = monks.filter((m) => !m.name?.mn?.includes("Буянцог")).slice(0, 5);

  return (
    <div className="home-sections-wrapper">
      {/* ── SECTION 2: FEATURED BLOG ──────────────────────────────────── */}
      <section className="hs-section">
        <div className="hs-section-header">
          <h2 className="hs-section-title">
            {t({ mn: "Шинэ мэдээ", en: "Latest News" })}
          </h2>
          <Link
            href={`/${locale}/blog`}
            className="hs-see-all"
          >
            {t({ mn: "Бүгдийг харах", en: "See all" })}
          </Link>
        </div>

        <div className="hs-blog-scroll">
          {displayBlogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/${locale}/blog/${blog.id}`}
              className="hs-blog-card"
            >
              <div className="hs-blog-img-wrap">
                <img
                  src={blog.cover || "/default-avatar.png"}
                  alt={blog.title?.[validLang] || blog.title?.mn || "Blog"}
                  className="hs-blog-img"
                />
              </div>
              <div className="hs-blog-info">
                <p className="hs-blog-meta">
                  {blog.author ? (typeof blog.author === 'string' ? blog.author : blog.author[validLang] || "Багш") : blog.authorName || "Багш"} · {formatDate(blog.date, validLang)}
                </p>
                <h3 className="hs-blog-title">{blog.title?.[validLang] || blog.title?.mn || "Мэдээ"}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: TOP PRACTITIONERS ─────────────────────────────── */}
      <section className="hs-section">
        <div className="hs-section-header">
          <h2 className="hs-section-title">
            {t({ mn: "Шилдэг үзмэрчид", en: "Top Practitioners" })}
          </h2>
        </div>

        <div className="hs-practitioners-list">
          {displayMonks.map((p) => {
            const monkId = p._id || p.id;
            const monkName = p.name?.[validLang] || p.name?.mn || "";
            const isOnline = p.isAvailable;
            const monkExp = p.yearsOfExperience ? `${p.yearsOfExperience} жил` : "10 жил";
            const specialty = (p.specialties && p.specialties[0]) ? p.specialties[0] : (validLang === 'en' ? "Spiritual Guide" : "Засалч");
            const price = (p.services && p.services[0]?.price) ? p.services[0].price.toLocaleString() : "50,000";
            const rating = p.rating || "4.8";
            const reviews = p.reviews || 65;

            return (
            <Link key={monkId} href={`/${locale}/monks/${monkId}`} className="hs-practitioner-card">
              {/* AuraOrb Avatar */}
              <div className="hs-aura-orb">
                <div className={`hs-aura-ring ${isOnline ? "online" : ""}`} />
                <img
                  src={p.image || "/default-monk.jpg"}
                  alt={monkName}
                  className="hs-practitioner-avatar"
                />
                {isOnline && <span className="hs-online-dot" />}
              </div>

              {/* Info */}
              <div className="hs-practitioner-info">
                <h3 className="hs-practitioner-name">{monkName}</h3>
                <p className="hs-practitioner-speciality">{specialty} · {monkExp}</p>
                <div className="hs-practitioner-rating">
                  <span className="hs-star">★</span>
                  <span className="hs-rating-num">{rating}</span>
                  <span className="hs-review-count">({reviews})</span>
                </div>
              </div>

              {/* Right: Price + CTA */}
              <div className="hs-practitioner-right">
                <p className="hs-practitioner-price">₮{price}<span>/цаг</span></p>
                <button className="luminous-btn-sm hs-book-btn pointer-events-none">
                  {t({ mn: "Захиалах", en: "Book" })}
                </button>
              </div>
            </Link>
          )})}
        </div>
      </section>
    </div>
  );
}
