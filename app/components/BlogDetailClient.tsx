"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Bookmark, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatDate } from "@/app/lib/dateUtils";

interface BlogPost {
    _id: string;
    id: string;
    title: any;
    content: any;
    cover?: string;
    category?: string;
    date: string;
    authorName?: string;
}

const getLocalizedText = (field: any, lang: string) => {
    if (!field) return "";
    if (typeof field === 'string') return field;
    return field[lang] || field.mn || field.en || "";
};

export default function BlogDetailClient({ post, lang }: { post: any, lang: string }) {
    const { t } = useLanguage();

    if (!post) return null;

    const title = getLocalizedText(post.title, lang) || "No Title";
    const content = getLocalizedText(post.content, lang);
    const cover = post.cover || null;
    const date = post.date ? formatDate(post.date, lang) : "";
    const author = post.authorName || "Багш";
    const category = post.category || "Wisdom";

    return (
        <div className="min-h-[100svh] bg-white flex flex-col relative antialiased selection:bg-gold/20 selection:text-ink">
            {/* Seamless Native Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black-[0.03]"
                style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: 16 }}>
                <div className="flex items-center justify-between px-5">
                    <Link href={`/${lang}/blog`} className="w-10 h-10 rounded-full bg-stone/50 flex items-center justify-center shrink-0 active:scale-95 transition-all">
                        <ArrowLeft className="text-ink/80" size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full bg-stone/50 flex items-center justify-center shrink-0 active:scale-95 transition-all">
                            <Bookmark size={18} className="text-ink/60" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-stone/50 flex items-center justify-center shrink-0 active:scale-95 transition-all">
                            <Share2 size={18} className="text-ink/60" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 pt-[calc(env(safe-area-inset-top)+80px)] pb-32">
                <article className="max-w-2xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {/* Cover Image */}
                        {cover && (
                            <div className="px-5 mb-8">
                                <div className="relative aspect-[4/3] md:aspect-video rounded-[32px] overflow-hidden shadow-sm bg-stone/20">
                                    <img src={cover} alt={title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 border border-black/5 rounded-[32px] pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Article Header */}
                        <div className="px-6 mb-10">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                                    {category}
                                </span>
                                <span className="text-[12px] font-medium text-earth/60">{date}</span>
                            </div>
                            <h1 className="text-[28px] md:text-5xl font-serif font-black text-ink leading-[1.2] mb-6">
                                {title}
                            </h1>
                            <div className="flex items-center gap-4 py-6 border-y border-stone/40">
                                <div className="w-11 h-11 rounded-full bg-stone flex items-center justify-center text-lg font-black text-ink/40 uppercase">
                                    {author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-ink">{author}</p>
                                    <p className="text-[12px] text-earth/60">Gevabal Guide</p>
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="px-6 prose prose-stone max-w-none">
                            <div className="text-[17px] md:text-[20px] text-[#222222] font-serif leading-[1.8] tracking-[-0.01em]">
                                {content.split('\n').map((line: string, i: number) => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <p key={i} className="mb-8">
                                            {trimmed}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interactive End */}
                        <div className="px-6 mt-16 pt-10 border-t border-stone/50">
                            <div className="bg-[#fcfcfc] rounded-[32px] p-8 border border-stone/40 text-center shadow-sm">
                                <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-stone/30 flex items-center justify-center mx-auto mb-5 text-gold">
                                    <Navigation size={24} className="ml-0.5" />
                                </div>
                                <h3 className="text-xl font-serif font-black text-ink mb-3 tracking-tight">Сургаалыг түгээх</h3>
                                <p className="text-[15px] text-earth/80 mb-8 leading-relaxed">Оюун санааны гэрэл гэгээг бусдадаа хуваалцаарай.</p>
                                <button className="w-full py-4 bg-ink text-white rounded-2xl text-[15px] font-bold shadow-md hover:bg-black hover:-translate-y-0.5 active:scale-95 transition-all">
                                    Найзуудтайгаа хуваалцах
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </article>
            </main>

            {/* Bottom Spacer */}
            <div style={{ height: "env(safe-area-inset-bottom)" }} className="bg-white" />
        </div>
    );
}
