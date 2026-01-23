"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    BookOpen,
    Sparkles,
    Search,
    Zap,
    Filter,
    X,
    ArrowRight,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

// --- TYPES ---
type BlogCategory = 'all' | 'wisdom' | 'news' | 'meditation';

interface BlogPost {
    id: string;
    title: { en: string; mn: string };
    content: { en: string; mn: string };
    cover?: string;
    category?: string;
    date: string;
    authorName?: string;
}

const TRANSLATIONS = {
    badge: { mn: "Блог & Мэдээ", en: "Blog & Wisdom" },
    titleMain: { mn: "Өдөр тутмын", en: "Daily" },
    titleHighlight: { mn: "Ухаарал", en: "Wisdom" },
    titleEnd: { mn: ".", en: "." },
    searchPlaceholder: { mn: "Хайх...", en: "Search posts..." },
    found: { mn: "Нийтлэл", en: "Posts Found" },
    noResults: { mn: "Нийтлэл олдсонгүй.", en: "No posts found." },
    readMore: { mn: "Унших", en: "Read More" },
    all: { mn: "Бүгд", en: "All" },
    wisdom: { mn: "Сургаал", en: "Wisdom" },
    news: { mn: "Мэдээ", en: "News" },
    meditation: { mn: "Бясалгал", en: "Meditation" }
};

const BlogCard = ({ post, lang, isDark }: { post: BlogPost, lang: 'en' | 'mn', isDark: boolean }) => {
    const Icon = Sparkles;
    const typeColor = "text-amber-500";
    const typeBg = "bg-amber-500/10";
    const hoverBorder = "hover:border-amber-500/40";
    const title = post.title?.[lang] || post.title?.mn || "No Title";
    const content = post.content?.[lang] || post.content?.mn || "";

    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`relative group rounded-[2.5rem] border p-8 transition-all duration-500 overflow-hidden h-full flex flex-col ${isDark ? `bg-[#001d30]/60 border-white/5 shadow-2xl ${hoverBorder}` : `bg-white border-slate-200 shadow-xl shadow-slate-200/40 ${hoverBorder}`}`}>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-3xl transition-colors ${typeBg}`}>
                        {post.cover ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image src={post.cover} alt="Author" fill className="object-cover" sizes="32px" />
                            </div>
                        ) : <Icon size={28} className={typeColor} />}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                        <Calendar size={12} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="mb-4">
                    <h3 className={`text-xl font-black mb-3 tracking-tight leading-tight line-clamp-2 ${isDark ? "text-white" : "text-[#001829]"}`}>{title}</h3>
                    {post.authorName && <p className={`text-xs font-bold leading-relaxed opacity-50 ${isDark ? "text-white" : "text-slate-900"}`}>By {post.authorName}</p>}
                </div>
                <p className={`text-sm opacity-60 leading-relaxed mb-6 line-clamp-3 ${isDark ? "text-white" : "text-slate-600"}`}>{content}</p>
                <div className="mt-auto pt-4">
                    <Link href={`/blog/${post.id}`} className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${isDark ? "border-white/10 text-white hover:bg-amber-600 hover:border-amber-600" : "border-slate-200 text-[#001829] hover:bg-[#001829] hover:text-white"}`}>
                        {TRANSLATIONS.readMore[lang]} <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
    const { language } = useLanguage();
    const lang = language === 'mn' ? 'mn' : 'en';
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<BlogCategory>('all');
    const isDark = false; // Default brand theme on server/initial mount

    const filteredPosts = useMemo(() => initialPosts.filter(post => {
        const title = (post.title?.[lang] || post.title?.mn || "").toLowerCase();
        const content = (post.content?.[lang] || post.content?.mn || "").toLowerCase();
        const q = search.toLowerCase();
        const matchesSearch = title.includes(q) || content.includes(q);
        const matchesFilter = filter === 'all' || (post.category && post.category.toLowerCase() === filter);
        return matchesSearch && matchesFilter;
    }), [initialPosts, search, filter, lang]);

    const filterTabs = [{ id: 'all', label: TRANSLATIONS.all[lang] }] as const;

    return (
        <div className={`min-h-[100dvh] transition-colors duration-700 pt-32 pb-20 px-6 font-sans ${isDark ? "bg-[#001829] text-white" : "bg-slate-50 text-slate-900"}`}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] ${isDark ? "bg-amber-500 opacity-[0.05]" : "bg-amber-200 opacity-[0.3]"}`} />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors mb-6 ${isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-white border-amber-100 text-amber-600 shadow-sm"}`}>
                        <Zap size={14} className="fill-current" />
                        <span className="font-black text-[10px] uppercase tracking-[0.2em]">{TRANSLATIONS.badge[lang]}</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] ${isDark ? "text-white" : "text-[#001829]"}`}>{TRANSLATIONS.titleMain[lang]} <span className="text-amber-500">{TRANSLATIONS.titleHighlight[lang]}</span>{TRANSLATIONS.titleEnd[lang]}</motion.h1>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto relative group">
                        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-white/20 group-focus-within:text-amber-500" : "text-slate-400 group-focus-within:text-amber-500"}`} size={20} />
                        <input type="text" placeholder={TRANSLATIONS.searchPlaceholder[lang]} value={search} onChange={(e) => setSearch(e.target.value)} className={`w-full py-6 pl-16 pr-6 rounded-[2rem] border text-sm font-bold focus:outline-none focus:ring-4 ${isDark ? "bg-white/5 border-white/10 text-white focus:border-amber-500" : "bg-white border-slate-200 text-[#001829] focus:border-amber-500 shadow-xl shadow-slate-200/50"}`} />
                        {search && <button onClick={() => setSearch("")} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={18} className="opacity-40" /></button>}
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-3 mt-12">
                        {filterTabs.map((tab) => (
                            <button key={tab.id} onClick={() => setFilter(tab.id as BlogCategory)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab.id ? "bg-amber-500 text-white shadow-xl" : isDark ? "bg-white/5 text-white/40" : "bg-white border border-slate-100 text-slate-400"}`}>{tab.label}</button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8 px-4">
                    <Filter size={14} className="opacity-40" />
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">{filteredPosts.length} {TRANSLATIONS.found[lang]}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => <BlogCard key={post.id} post={post} lang={lang} isDark={isDark} />)
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-32 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6"><BookOpen className="opacity-20" size={40} /></div>
                                <p className="opacity-30 italic font-medium">{TRANSLATIONS.noResults[lang]}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
