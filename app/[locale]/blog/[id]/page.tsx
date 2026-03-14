import React from "react";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Sparkles, BookOpen, Feather } from "lucide-react";

// Force dynamic rendering since we are fetching data based on params that change
export const dynamic = 'force-dynamic';

async function getBlogPost(id: string) {
    try {
        const { db } = await connectToDatabase();
        let query: any = { id: id };
        let post = await db.collection("blogs").findOne(query);

        if (post) return post;

        if (ObjectId.isValid(id)) {
            return await db.collection("blogs").findOne({ _id: new ObjectId(id) });
        }

        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export default async function BlogDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const post = await getBlogPost(id);

    // --- 404 STATE (Divine Light Style) ---
    if (!post) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] text-slate-800 font-sans relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] bg-amber-200/30" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-rose-100/40" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
                </div>
                <div className="text-center relative z-10 px-6">
                    <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-100">
                        <BookOpen className="text-amber-500" size={40} />
                    </div>
                    <h1 className="text-6xl font-black mb-4 tracking-tighter text-slate-900">404</h1>
                    <p className="text-slate-500 text-lg mb-8 font-serif italic">The wisdom you seek lies elsewhere.</p>
                    <Link href="/blog" className="px-8 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-500/20">
                        <ArrowLeft size={18} /> Return to Light
                    </Link>
                </div>
            </div>
        )
    }

    // Serialize for rendering
    const titleMn = post.title?.mn || "No Title";
    const titleEn = post.title?.en || "No Title";
    const contentMn = post.content?.mn || "";
    const contentEn = post.content?.en || "";
    const cover = post.cover || null;
    const date = post.date ? new Date(post.date).toLocaleDateString() : "";
    const author = post.authorName || "Anonymous";

    return (
        <div className="min-h-screen bg-[#fdfbf7] text-slate-800 font-sans relative overflow-hidden selection:bg-amber-200 selection:text-amber-900">

            {/* BACKGROUND EFFECTS (Divine/Light) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Top glow */}
                <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] bg-gradient-to-b from-amber-100/60 to-transparent" />
                {/* Side accents */}
                <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] bg-blue-100/40 mix-blend-multiply" />
                <div className="absolute top-80 left-[-10%] w-[600px] h-[600px] rounded-full blur-[130px] bg-rose-100/40 mix-blend-multiply" />
                {/* Grain Texture */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
            </div>

            <main className="pt-32 pb-20 relative z-10">
                <article className="max-w-4xl mx-auto px-6">

                    {/* BACK LINK */}
                    <div className="mb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 border border-white/60 shadow-sm backdrop-blur-md text-xs font-black uppercase tracking-[0.2em] text-amber-600 hover:text-amber-700 hover:bg-white hover:shadow-md transition-all">
                            <ArrowLeft size={14} /> Back
                        </Link>
                    </div>

                    {/* HEADER */}
                    <header className="text-center mb-16">
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                            <span className="flex items-center gap-2 bg-white/70 border border-amber-100 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                                <Calendar size={14} className="text-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{date}</span>
                            </span>
                            <span className="flex items-center gap-2 bg-white/70 border border-amber-100 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                                <User size={14} className="text-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{author}</span>
                            </span>
                        </div>

                        {/* Title with Golden Gradient Text */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 drop-shadow-sm pb-2">
                            {titleMn}
                        </h1>
                        <h2 className="text-xl md:text-2xl font-medium text-slate-500/80 max-w-2xl mx-auto tracking-wide font-serif italic">
                            {titleEn}
                        </h2>
                    </header>

                    {/* HERO IMAGE */}
                    {cover && (
                        <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-amber-900/10 mb-16 border-4 border-white relative group">
                            {/* Subtle light sheen overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
                            <img
                                src={cover}
                                alt={titleEn}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s]"
                            />
                        </div>
                    )}

                    {/* CONTENT CONTAINER - Glassmorphism Light */}
                    <div className="bg-white/60 border border-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">

                        {/* Decorative background accent inside card */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

                        {/* Mongolian Content */}
                        <div className="relative space-y-8 text-xl md:text-2xl text-slate-700 font-medium leading-loose">
                            {contentMn.split('\n').map((line: string, i: number) => line.trim() && (
                                <p key={`mn-${i}`} className="first-letter:text-6xl first-letter:font-black first-letter:text-amber-500/80 first-letter:mr-3 first-letter:mt-[-10px] first-letter:float-left">
                                    {line}
                                </p>
                            ))}
                        </div>

                        {/* English Translation Section */}
                        {contentEn && (
                            <div className="mt-20 pt-16 border-t border-amber-900/5 relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-amber-100 px-6 py-2 rounded-full shadow-lg shadow-amber-500/5">
                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                                        <Feather size={12} /> Translation
                                    </span>
                                </div>
                                <div className="space-y-8 text-lg md:text-xl text-slate-500 font-serif italic leading-loose">
                                    {contentEn.split('\n').map((line: string, i: number) => line.trim() && (
                                        <p key={`en-${i}`}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER ACTION */}
                    <div className="mt-20 text-center pb-10">
                        <Link href="/blog" className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-1">
                            <span className="tracking-wide">More Wisdom</span>
                            <ArrowLeft className="ml-2 w-5 h-5 rotate-180 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                </article>
            </main>
        </div>
    );
}