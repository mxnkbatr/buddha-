"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Sparkles,
    Heart,
    Search,
    Zap,
    Filter,
    X,
    Clock,
    ArrowRight,
    Loader2,
    Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import OverlayNavbar from "@/app/components/Navbar";
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

// --- TRANSLATIONS ---
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

// --- SUB-COMPONENT: BLOG CARD ---
const BlogCard = ({ post, lang, isDark }: { post: BlogPost, lang: 'en' | 'mn', isDark: boolean }) => {
    // Determine icon/color based on some logic or random if no specific category field
    // For now, default to wisdom style
    const Icon = Sparkles;
    const typeColor = "text-amber-500";
    const typeBg = "bg-amber-500/10";
    const hoverBorder = "hover:border-amber-500/40";

    const title = post.title?.[lang] || post.title?.mn || "No Title";
    const content = post.content?.[lang] || post.content?.mn || "";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative group rounded-[2.5rem] border p-8 transition-all duration-500 overflow-hidden h-full flex flex-col
        ${isDark
                    ? `bg-[#001d30]/60 border-white/5 shadow-2xl ${hoverBorder}`
                    : `bg-white border-slate-200 shadow-xl shadow-slate-200/40 ${hoverBorder}`}`}
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-3xl transition-colors ${typeBg}`}>
                        {post.cover ? (
                            <img src={post.cover} className="w-7 h-7 object-cover rounded-full" />
                        ) : (
                            <Icon size={28} className={typeColor} />
                        )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                        <Calendar size={12} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {new Date(post.date).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className={`text-xl font-black mb-3 tracking-tight leading-tight line-clamp-2 ${isDark ? "text-white" : "text-[#001829]"}`}>
                        {title}
                    </h3>
                    {post.authorName && (
                        <p className={`text-xs font-bold leading-relaxed opacity-50 ${isDark ? "text-white" : "text-slate-900"}`}>
                            By {post.authorName}
                        </p>
                    )}
                </div>

                <p className={`text-sm opacity-60 leading-relaxed mb-6 line-clamp-3 ${isDark ? "text-white" : "text-slate-600"}`}>
                    {content}
                </p>

                <div className="mt-auto pt-4">
                    <Link href={`/blog/${post.id}`} className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all
            ${isDark
                            ? "border-white/10 text-white hover:bg-amber-600 hover:border-amber-600"
                            : "border-slate-200 text-[#001829] hover:bg-[#001829] hover:text-white"}`}>
                        {TRANSLATIONS.readMore[lang]}
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE ---
export default function BlogPage() {
    const { language } = useLanguage();
    const lang = language === 'mn' ? 'mn' : 'en';
    const { theme } = useTheme();

    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<BlogCategory>('all');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Fix hydration mismatch by only rendering theme-dependent UI after mount
    useEffect(() => {
        setMounted(true);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blogs');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const isDark = theme === "dark" || !theme; // Default to dark if undefined? Or check system. Assuming dark for safety.

    const filteredPosts = posts.filter(post => {
        const title = post.title?.[lang] || post.title?.mn || "";
        const content = post.content?.[lang] || post.content?.mn || "";
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
            content.toLowerCase().includes(search.toLowerCase());
        // For now, since we don't have strict categories in DB yet, filter 'all' shows everything.
        // Ideally we add 'category' field to DB.
        const matchesFilter = filter === 'all' || (post.category && post.category.toLowerCase() === filter);
        return matchesSearch && matchesFilter;
    });

    const filterTabs = [
        { id: 'all', label: TRANSLATIONS.all[lang] },
        // { id: 'wisdom', label: TRANSLATIONS.wisdom[lang] },
        // { id: 'news', label: TRANSLATIONS.news[lang] }, 
    ] as const;

    return (
        <>
            <OverlayNavbar />
            <div className={`min-h-[100dvh] transition-colors duration-700 pt-32 pb-20 px-6 font-sans
      ${isDark ? "bg-[#001829] text-white" : "bg-slate-50 text-slate-900"}`}>

                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-700
          ${isDark ? "bg-amber-500 opacity-[0.05]" : "bg-amber-200 opacity-[0.3]"}`} />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors mb-6
              ${isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-white border-amber-100 text-amber-600 shadow-sm"}`}
                        >
                            <Zap size={14} className="fill-current" />
                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">
                                {TRANSLATIONS.badge[lang]}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]
              ${isDark ? "text-white" : "text-[#001829]"}`}
                        >
                            {TRANSLATIONS.titleMain[lang]} <span className="text-amber-500">{TRANSLATIONS.titleHighlight[lang]}</span>{TRANSLATIONS.titleEnd[lang]}
                        </motion.h1>

                        {/* SEARCH BAR */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto relative group"
                        >
                            <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors
              ${isDark ? "text-white/20 group-focus-within:text-amber-500" : "text-slate-400 group-focus-within:text-amber-500"}`} size={20} />
                            <input
                                type="text"
                                placeholder={TRANSLATIONS.searchPlaceholder[lang]}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full py-6 pl-16 pr-6 rounded-[2rem] border text-sm font-bold transition-all focus:outline-none focus:ring-4
                ${isDark
                                        ? "bg-white/5 border-white/10 text-white focus:border-amber-500 focus:ring-amber-500/10 placeholder:text-white/20"
                                        : "bg-white border-slate-200 text-[#001829] focus:border-amber-500 focus:ring-amber-100 placeholder:text-slate-400 shadow-xl shadow-slate-200/50"}`}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full transition-colors">
                                    <X size={18} className="opacity-40" />
                                </button>
                            )}
                        </motion.div>

                        {/* FILTER TABS */}
                        <div className="flex flex-wrap justify-center gap-3 mt-12">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as BlogCategory)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filter === tab.id
                                            ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20 scale-105"
                                            : isDark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RESULTS SUMMARY */}
                    <div className="flex items-center gap-4 mb-8 px-4">
                        <Filter size={14} className="opacity-40" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">
                            {filteredPosts.length} {TRANSLATIONS.found[lang]}
                        </span>
                        {loading && <span className="text-xs font-bold text-amber-500 animate-pulse ml-2">Syncing...</span>}
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="col-span-full py-20 flex justify-center">
                                    <Loader2 className="animate-spin text-amber-500" size={32} />
                                </div>
                            ) : filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <BlogCard
                                        key={post.id}
                                        post={post}
                                        lang={lang}
                                        isDark={isDark}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-32 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                        <BookOpen className="opacity-20" size={40} />
                                    </div>
                                    <p className="opacity-30 italic font-medium">{TRANSLATIONS.noResults[lang]}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </>
    );
}
