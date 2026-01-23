"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  Flower,
  Sun,
  Orbit,
  Star,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Comment } from "@/database/types";

// --- TYPES ---
interface CelestialAtmosphereProps {
  isDark: boolean;
}

interface ArcanaCardProps {
  comment: Comment;
  index: number;
  isDark: boolean;
}

// --- ZODIAC GALAXY ATMOSPHERE ---
const CelestialAtmosphere = React.memo(({ isDark }: CelestialAtmosphereProps) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? "bg-[#05051a] opacity-100" : "bg-[#FDFBF7] opacity-100"
      }`} />

    {isDark && (
      <>
        <div className="absolute -top-20 -left-20 w-full h-full rounded-full blur-[140px] bg-[#C72075]/20 animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-full h-full rounded-full blur-[140px] bg-[#2E1B49]/20" />
      </>
    )}

    <motion.div
      animate={{ rotate: isDark ? -360 : 360 }}
      transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-40%] left-[-25%] w-[150vw] h-[150vw] opacity-[0.08]"
      style={{
        background: isDark
          ? "conic-gradient(from 0deg, transparent 0%, #50F2CE 15%, transparent 40%, #C72075 60%, transparent 80%)"
          : "conic-gradient(from 0deg, transparent 0%, #fbbf24 10%, transparent 50%)"
      }}
    />
  </div>
));
CelestialAtmosphere.displayName = "CelestialAtmosphere";

// --- STATIC DATA ---
const STATIC_COMMENTS: Comment[] = [
  {
    _id: "c1",
    authorName: "Munkhbaatar D.",
    authorRole: "Elder Pilgrim",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    text: "Хүүхдүүд маань энэ сайтыг зааж өгөөд, багштай холбож өгсөн. Ном уншиж байхад дүрс нь маш тод, дуу нь цэвэрхэн сонсогдож байна лээ. Их буянтай ажил байна, амжилт хүсье.",
    karma: 108,
    element: "earth",
    createdAt: new Date()
  },
  {
    _id: "c2",
    authorName: "Sarnai B.",
    authorRole: "Modern Seeker",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    text: "Монголд ийм платформ байгуулагдсанд үнэхээр их баяртай байна. Заавал хийд явж дугаарлахгүйгээр, гэрээсээ бүх үйлчилгээгээ аваад, төлбөрөө төлчихдөг цаг завыг маань маш их хэмнэсэн.",
    karma: 88,
    element: "wind",
    createdAt: new Date()
  },
  {
    _id: "c3",
    authorName: "Bold E.",
    authorRole: "Fate Walker",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    text: "Хөзрийн мэргэ үзүүлж, ирээдүйд гаргах шийдвэртээ тусламж авлаа. Үзмэрч маань маш тодорхой, ойлгомжтой тайлбарлаж өгсөн. Вэбсайт нь хэрэглэхэд маш хялбар юм байна.",
    karma: 45,
    element: "fire",
    createdAt: new Date()
  },
  {
    _id: "c4",
    authorName: "Tsetseg O.",
    authorRole: "Soul Healer",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    text: "Сэтгэл санаа үймрээд, хэнд хандахаа мэдэхгүй байхдаа багштай холбогдож ярилцсан. Маш их эргэлзээг минь тайлж, дотоод сэтгэлийн амар амгаланг өгсөн. Нууцлал тал дээр маш найдвартай санагдсан.",
    karma: 200,
    element: "water",
    createdAt: new Date()
  }
];

export default function CelestialRiverComments() {
  const { t, language } = useLanguage(); // Fixed: Added language here
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [comments, setComments] = useState<Comment[]>(STATIC_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0, { stiffness: 40, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 40, damping: 20 });

  const isDark = false;
  const glowColor = isDark ? 'rgba(199, 32, 117, 0.3)' : 'rgba(251, 191, 36, 0.3)';
  const glowTemplate = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 70%)`;

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className={`min-h-[500px] ${isDark ? "bg-[#05051a]" : "bg-[#FDFBF7]"}`} />;

  const handleMouseMove = ({ clientX, clientY, currentTarget }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    const displayName = user ? (user.firstName || user.name?.mn || user.name?.en || user.phone || "You") : "Pilgrim";

    const newEntry: Comment = {
      _id: Date.now().toString(),
      authorName: displayName,
      authorRole: isDark ? "Celestial Voyager" : "Pilgrim",
      avatar: user?.avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
      text: newComment,
      karma: 0,
      element: "light",
      createdAt: new Date()
    };

    setTimeout(() => {
      setComments([newEntry, ...comments]);
      setNewComment("");
      setIsSubmitting(false);
    }, 800);
  };

  const ui = {
    header: isDark ? t({ mn: "Одот Мөрөн", en: "Nebula Stream" }) : t({ mn: "Сэтгэгдэл", en: "Reflections" }),
    sub: isDark ? t({ mn: "Зурхайн цуглуулга", en: "The Collective Zodiac" }) : t({ mn: "Хэрэглэгчдийн сэтгэгдэл", en: "Community Voices" }),
    btn: isDark ? t({ mn: "Оддын тамга", en: "Seal Star" }) : t({ mn: "Илгээх", en: "Send Thought" })
  };

  return (
    <section className="relative w-full py-40 overflow-hidden font-ethereal transition-colors duration-1000">
      <CelestialAtmosphere isDark={isDark} />

      <div className="relative z-10 container mx-auto px-4 lg:px-12 flex flex-col h-full">

        <div className="text-center mb-24 relative">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="inline-block mb-6">
            <div className={`p-4 rounded-full border shadow-2xl transition-all duration-700 ${isDark ? "bg-[#0C164F]/60 border-cyan-400/50 text-cyan-300" : "bg-white border-amber-200 text-amber-500"
              }`}>
              {isDark ? <Orbit size={32} className="animate-pulse" /> : <Sun size={32} className="animate-spin-slow" />}
            </div>
          </motion.div>

          <h2 className={`text-6xl md:text-8xl font-serif tracking-tight transition-colors drop-shadow-xl ${isDark ? "text-white" : "text-[#451a03]"}`}>
            {ui.header}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className={`h-px w-20 bg-linear-to-r from-transparent via-current to-transparent ${isDark ? 'text-cyan-500' : 'text-amber-500'}`} />
            <p className={`text-[10px] font-black tracking-[0.6em] uppercase opacity-70 ${isDark ? "text-cyan-100" : "text-amber-800"}`}>{ui.sub}</p>
            <div className={`h-px w-20 bg-linear-to-r from-transparent via-current to-transparent ${isDark ? 'text-cyan-500' : 'text-amber-500'}`} />
          </div>
        </div>

        <div className="relative max-w-2xl w-full mx-auto mb-32 z-20" onMouseMove={handleMouseMove}>
          <motion.div className="absolute -inset-20 opacity-40 blur-3xl z-0 pointer-events-none" style={{ background: glowTemplate }} />

          <form onSubmit={handleSubmit} className={`relative md:backdrop-blur-lg border-2 rounded-2xl p-2 flex items-center gap-4 transition-all duration-700 shadow-2xl ${isDark ? "bg-[#0C164F]/60 border-cyan-400/30" : "bg-white/95 border-amber-200/50"
            }`}>
            <div className="pl-6">
              {isDark ? <Sparkles className="text-[#C72075]" size={24} /> : <Flower className="text-amber-400" size={24} />}
            </div>
            <input
              type="text" 
              disabled={!user} 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={!user ? t({ mn: "Нэвтэрч сэтгэгдэл үлдээнэ үү", en: "Please login to comment" }) : (isDark ? "Write your star sign..." : "Сэтгэгдэл бичих...")}
              className={`flex-1 bg-transparent border-none outline-none font-serif text-lg h-16 ${isDark ? "text-white placeholder-cyan-400/20" : "text-[#451a03] placeholder-amber-900/20"}`}
            />
            <motion.button disabled={!user || isSubmitting} whileHover={{ scale: user ? 1.05 : 1 }} whileTap={{ scale: user ? 0.95 : 1 }} className={`px-10 py-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 transition-all ${!user ? "bg-stone-200 text-stone-400 cursor-not-allowed" : isDark ? "bg-gradient-to-r from-[#C72075] to-[#7B337D] text-white shadow-[#C72075]/30" : "bg-amber-500 text-white hover:bg-amber-600"
              }`}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Star size={16} />} <span>{ui.btn}</span>
            </motion.button>
          </form>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 px-4 md:px-[20vw] py-10 hide-scrollbar scroll-smooth snap-x pb-20"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {comments.map((comment, index) => (
              <ArcanaCard key={String(comment._id)} comment={comment} index={index} isDark={isDark} />
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

// --- SUB-COMPONENT: 3D NEBULA CARD ---

function ArcanaCard({ comment, index, isDark }: ArcanaCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { stiffness: 60, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { stiffness: 60, damping: 20 });

  function handleCardMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
      onMouseMove={handleCardMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative shrink-0 snap-center perspective-1000 group cursor-default"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`w-[300px] md:w-[360px] h-[500px] rounded-[2rem] border-2 p-8 flex flex-col transition-all duration-700 shadow-2xl relative safari-gpu ${isDark
          ? "bg-[#0C164F]/90 border-cyan-400/30 text-cyan-50 shadow-[0_0_50px_rgba(80,242,206,0.05)]"
          : "bg-white/95 border-amber-100 text-[#451a03] shadow-[0_20px_40px_-10px_rgba(245,158,11,0.1)]"
          }`}
      >
        <div className={`absolute inset-3 border rounded-[1.5rem] transition-colors opacity-10 pointer-events-none ${isDark ? "border-cyan-400" : "border-amber-500"}`} />

        <div className="relative z-10 flex flex-col items-center text-center mb-8 pt-2">
          <span className={`text-[8px] font-black tracking-[0.8em] uppercase mb-6 opacity-50 transition-colors ${isDark ? 'text-cyan-300' : 'text-amber-800'}`}>
            {isDark ? "NEBULA ARCANA" : "REVIEW"} {index + 1}
          </span>

          <div className="relative mb-4">
            <div className={`relative w-16 h-16 rounded-full border-2 p-1 overflow-hidden transition-all duration-1000 ${isDark ? "border-[#C72075]/50 shadow-[0_0_15px_rgba(199,32,117,0.3)]" : "border-amber-200"}`}>
              <Image src={comment.avatar || "/logo.png"} fill sizes="64px" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={`${comment.authorName}'s avatar`} />
            </div>
            <Sparkles className={`absolute -top-2 -right-2 ${isDark ? 'text-cyan-300' : 'text-amber-400'} animate-pulse`} size={16} />
          </div>

          <h4 className="font-serif text-xl font-bold tracking-wide mb-1 drop-shadow-sm">{comment.authorName}</h4>
          <p className={`text-[9px] font-bold tracking-[0.3em] uppercase ${isDark ? "text-cyan-400" : "text-amber-600"}`}>
            {comment.authorRole}
          </p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-start items-center px-2 overflow-hidden">
          <p className="text-sm md:text-base font-medium leading-relaxed italic text-center opacity-80 font-serif">
            &quot;{comment.text}&quot;
          </p>
        </div>

        <div className="relative z-10 pt-6 flex justify-between items-center opacity-40">
          <div className="h-px flex-1 bg-current mr-4" />
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest">
            <Star size={12} fill="currentColor" /> {comment.karma}
          </div>
          <div className="h-px flex-1 bg-current ml-4" />
        </div>

        <div className={`absolute inset-0 bg-linear-to-tr from-transparent ${isDark ? 'via-cyan-400/5' : 'via-amber-400/10'} to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] pointer-events-none rounded-[2rem]`} />
      </motion.div>
    </motion.div>
  );
}