"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Search, X, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate } from "../lib/dateUtils";

// --- TYPES ---
type BlogCategory = 'all' | 'wisdom' | 'news' | 'meditation';

interface BlogPost {
    id: string;
    title: any;
    content: any;
    cover?: string;
    category?: string;
    date: string;
    authorName?: string;
}

const TRANSLATIONS = {
    badge: { mn: "Унших", en: "Read" },
    titleMain: { mn: "Блог &", en: "Blog &" },
    titleHighlight: { mn: "Мэдээ", en: "News" },
    searchPlaceholder: { mn: "Хайх...", en: "Search posts..." },
    noResults: { mn: "Нийтлэл олдсонгүй.", en: "No posts found." },
    readMore: { mn: "Унших", en: "Read" },
    all: { mn: "Бүгд", en: "All" },
    wisdom: { mn: "Сургаал", en: "Wisdom" },
    news: { mn: "Мэдээ", en: "News" },
    meditation: { mn: "Бясалгал", en: "Meditation" },
    featured: { mn: "ОНЦЛОХ", en: "FEATURED" }
};

const getLocalizedText = (field: any, lang: string) => {
    if (!field) return "";
    if (typeof field === 'string') return field;
    return field[lang] || field.mn || field.en || "";
};

const BlogCard = ({ post, lang, idx }: { post: BlogPost, lang: 'en' | 'mn', idx: number }) => {
    const title = getLocalizedText(post.title, lang) || "No Title";
    const content = getLocalizedText(post.content, lang);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.05, ease: "easeOut" }}
            className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-stone/20 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
        >
            <Link href={`/${lang}/blog/${post.id}`} className="block flex-none relative aspect-[4/3] w-full overflow-hidden bg-stone/20">
                {post.cover ? (
                    <Image src={post.cover} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={40} className="text-earth/20" />
                    </div>
                )}
                <div className="absolute inset-0 border border-black/5 rounded-t-[24px] pointer-events-none" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm">
                        {post.category || "Wisdom"}
                    </span>
                </div>
            </Link>

            <Link href={`/${lang}/blog/${post.id}`} className="flex flex-col flex-1 p-5">
                <div className="mb-3 text-[11px] font-bold tracking-widest uppercase text-earth/60 flex items-center gap-2">
                    <span>{formatDate(post.date, lang)}</span>
                    <div className="w-1 h-1 rounded-full bg-earth/30" />
                    <span className="truncate">{post.authorName || "Багш"}</span>
                </div>
                <h3 className="text-[17px] font-serif font-black text-ink leading-snug mb-3 group-hover:text-gold transition-colors line-clamp-2">
                    {title}
                </h3>
                <p className="text-[14px] text-earth/80 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {content}
                </p>
                <div className="mt-auto flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-gold group-hover:text-gold/80 transition-colors">
                    {TRANSLATIONS.readMore[lang]}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
            </Link>
        </motion.div>
    );
};

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
    const { language, t } = useLanguage();
    const lang = language === 'mn' ? 'mn' : 'en';
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<BlogCategory>('all');

    const filteredPosts = useMemo(() => initialPosts.filter(post => {
        const title = getLocalizedText(post.title, lang).toLowerCase();
        const content = getLocalizedText(post.content, lang).toLowerCase();
        const q = search.toLowerCase();
        const matchesSearch = title.includes(q) || content.includes(q);
        const matchesFilter = filter === 'all' || (post.category && post.category.toLowerCase() === filter);
        return matchesSearch && matchesFilter;
    }), [initialPosts, search, filter, lang]);

    return (
        <div className="min-h-[100svh] bg-[#FAFAFA] relative flex flex-col pb-24">
            
            {/* Header */}
            <header className="px-6 pt-[calc(var(--header-height-mobile)+env(safe-area-inset-top)+20px)] pb-6 bg-[#FAFAFA] sticky top-0 z-20">
                <div className="mb-8">
                    <h1 className="text-[34px] font-serif font-black text-ink leading-tight tracking-tight">
                        {t(TRANSLATIONS.titleMain)} <span className="text-gold italic">{t(TRANSLATIONS.titleHighlight)}</span>
                    </h1>
                </div>

                {/* Filter and Search Container */}
                <div className="space-y-4">
                    {/* Horizontal Categories */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {(['all', 'wisdom', 'news', 'meditation'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`shrink-0 px-5 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${
                                    filter === cat 
                                    ? "bg-ink text-white shadow-md scale-100" 
                                    : "bg-white border border-stone/60 text-earth/80 hover:bg-stone/30 scale-95 origin-center"
                                }`}
                            >
                                {t(TRANSLATIONS[cat])}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-earth/50" size={18} />
                        <input 
                            type="text" 
                            placeholder={t(TRANSLATIONS.searchPlaceholder)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-stone/40 focus:border-gold/50 focus:ring-4 focus:ring-gold/10 rounded-2xl py-3.5 pl-12 pr-12 text-[15px] font-medium text-ink placeholder:text-earth/40 outline-none transition-all shadow-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-stone/50 hover:bg-stone rounded-full transition-colors">
                                <X size={14} className="text-ink/60" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Grid */}
            <main className="px-6 flex-1 mt-4">
                <AnimatePresence mode="wait">
                    {filteredPosts.length > 0 ? (
                        <motion.div 
                            key={`${filter}-${search}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {filteredPosts.map((post: BlogPost, idx: number) => (
                                <BlogCard key={post.id} post={post} lang={lang} idx={idx} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Sparkles size={40} className="text-earth/30 mb-4" />
                            <p className="text-earth font-serif italic text-lg">{t(TRANSLATIONS.noResults)}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
