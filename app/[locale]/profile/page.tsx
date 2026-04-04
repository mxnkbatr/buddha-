"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Video, Loader2, Edit, Upload, LogOut, LogIn,
  TrendingUp, CheckCircle, History, MessageCircle,
  X, Save, Phone, UserCircle, Plus, Sun
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import LiveRitualRoom from "../../components/LiveRitualRoom";
import ChatWindow from "../../components/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// --- TYPES ---
interface UserProfile {
  _id: string; role: "client" | "monk"; monkStatus?: string;
  name?: { mn: string; en: string }; title?: { mn: string; en: string };
  services?: any[]; schedule?: any[]; blockedSlots?: any[];
  earnings?: number; image?: string; avatar?: string;
  bio?: { mn: string; en: string }; specialties?: string[];
  yearsOfExperience?: number; phone?: string;
  firstName?: string; lastName?: string; isSpecial?: boolean;
}
interface Booking {
  _id: string; monkId: string; clientId?: string; clientName: string;
  serviceName: any; date: string; time: string; status: string; callStatus?: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { language: lang, t } = useLanguage();
  const router = useRouter();
  const lk = lang === "mn" ? "mn" : "en";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allMonks, setAllMonks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeRoomToken, setActiveRoomToken] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const isMonk = profile?.role === "monk";

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoading(true);
        const userId = user.id;
        let profileData = null;
        if (user.role === "monk") {
          const r = await fetch(`/api/monks/${userId}`);
          if (r.ok) profileData = await r.json();
        } else {
          const r = await fetch(`/api/users/${userId}`, { cache: "no-store" });
          if (r.ok) profileData = await r.json();
        }
        if (!profileData && user.authType === "custom") profileData = user;
        if (profileData) {
          setProfile(profileData);
          const isM = profileData.role === "monk";
          const bRes = await fetch(`/api/bookings?${isM ? "monkId" : "userId"}=${profileData._id}`);
          if (bRes.ok) setBookings(await bRes.json());
          if (!isM) {
            const mRes = await fetch("/api/monks");
            if (mRes.ok) setAllMonks(await mRes.json());
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    if (!authLoading && user) {
      fetchData();
      const poll = setInterval(fetchData, 8000);
      return () => clearInterval(poll);
    }
  }, [authLoading, user]);

  const { upcomingBookings, historyBookings, acceptedCount, totalEarnings } = useMemo(() => {
    const upcoming: Booking[] = [], history: Booking[] = [];
    let acc = 0;
    bookings.forEach(b => {
      const fin = ["completed", "cancelled", "rejected"].includes(b.status);
      const up = !fin && ["confirmed", "pending"].includes(b.status);
      if (["confirmed", "completed"].includes(b.status)) acc++;
      if (up) upcoming.push(b); else history.push(b);
    });
    upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    return { upcomingBookings: upcoming, historyBookings: history, acceptedCount: acc, totalEarnings: acc * (profile?.isSpecial ? 88800 : 40000) };
  }, [bookings, profile]);

  const joinVideo = async (booking: Booking) => {
    setJoiningId(booking._id);
    try {
      if (isMonk) {
        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, callStatus: "active" } : b));
        await fetch(`/api/bookings/${booking._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callStatus: "active" }) });
      }
      const name = encodeURIComponent(user?.fullName || user?.firstName || "User");
      const r = await fetch(`/api/livekit?room=${booking._id}&username=${name}`);
      if (!r.ok) throw new Error("Token failed");
      const data = await r.json();
      setActiveRoomToken(data.token);
      setActiveRoomName(booking._id);
    } catch (e) { console.error(e); }
    finally { setJoiningId(null); }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try { await logout(); } catch { window.location.href = "/sign-in"; }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    try {
      const r = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
      const d = await r.json();
      setEditForm((p: any) => ({ ...p, avatar: d.secure_url, image: d.secure_url }));
    } catch (e) { console.error(e); }
    finally { setUploadingImage(false); }
  };

  const saveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const ep = isMonk ? `/api/monks/${profile._id}` : `/api/users/${user?.id}`;
      const r = await fetch(ep, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (r.ok) { setProfile({ ...profile, ...editForm }); setIsEditOpen(false); }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  // --- RENDER: Video Room ---
  if (activeRoomToken && activeRoomName) {
    return <LiveRitualRoom
      token={activeRoomToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
      roomName={activeRoomName} bookingId={activeRoomName} isMonk={isMonk}
      onLeave={async () => {
        if (isMonk) await fetch(`/api/bookings/${activeRoomName}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callStatus: "ended" }) });
        setActiveRoomToken(null); setActiveRoomName(null); window.location.reload();
      }}
    />;
  }

  // --- RENDER: Guest ---
  if (!authLoading && !user) {
    return (
      <main className="min-h-[100svh] bg-cream flex flex-col items-center justify-center px-6 page-safe-top page-safe-bottom">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-[22px] bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <UserCircle size={40} className="text-gold" />
          </div>
          <h1 className="text-[24px] font-black text-ink mb-3">
            {t({ mn: "Аяллын эхлэл", en: "Start Your Journey" })}
          </h1>
          <p className="text-[14px] text-earth leading-relaxed mb-8">
            {t({ mn: "Профайл нээснээр засал захиалах, багш нартай шууд холбогдох боломжтой болно.", en: "Sign in to book rituals and connect with mentors." })}
          </p>
          <Link href={`/${lang}/sign-in`}>
            <button className="btn-primary btn-primary-full flex items-center justify-center gap-2">
              <LogIn size={18} />
              {t({ mn: "Нэвтрэх / Бүртгүүлэх", en: "Sign In / Register" })}
            </button>
          </Link>
        </div>
      </main>
    );
  }

  // --- RENDER: Loading ---
  if (authLoading || loading) {
    return (
      <div className="min-h-[100svh] bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // --- RENDER: Monk Pending ---
  if (isMonk && profile?.monkStatus === "pending") {
    return (
      <div className="min-h-[100svh] bg-cream flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-gold" size={36} />
          <h2 className="text-[20px] font-black text-ink mb-2">Хүсэлт хүлээгдэж байна</h2>
          <p className="text-[14px] text-earth">Таны хүсэлт хянагдаж байна. Баталгаажсаны дараа имэйл ирнэ.</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.name?.[lk] || user?.fullName || user?.firstName || user?.phone || "Хэрэглэгч";
  const displayTitle = isMonk ? (profile?.title?.[lk] || "Багш") : (lang === "mn" ? "Эрхэм сүсэгтэн" : "Seeker");

  return (
    <main className="min-h-[100svh] bg-cream page-safe-top page-safe-bottom">

      {/* ── HERO PROFILE CARD ── */}
      <section className="px-4 mb-6">
        <div className="bg-[#1A1713] rounded-[28px] p-6 relative overflow-hidden">
          {/* Subtle mandala */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
            {[100, 160, 220].map((r, i) => <div key={i} className="absolute rounded-full border border-white" style={{ width: r, height: r }} />)}
          </div>

          <div className="relative z-10 flex items-center gap-4 mb-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.authType === "clerk" ? (
                <div className="scale-[1.6] origin-top-left ml-3 mt-1"><UserButton /></div>
              ) : (
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gold/20 border-2 border-gold/30">
                  {(profile?.avatar || profile?.image || user?.avatar) ? (
                    <img src={profile?.avatar || profile?.image || user?.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold text-xl font-black">
                      {displayName?.[0]}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-black text-white truncate">{displayName}</h2>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold/70 mt-0.5">{displayTitle}</p>
            </div>
          </div>

          {/* Stats (monk only) */}
          {isMonk && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/6 rounded-2xl p-3 text-center">
                <p className="text-[20px] font-black text-white">{totalEarnings.toLocaleString()}₮</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-0.5">{lang === "mn" ? "Нийт орлого" : "Total Earnings"}</p>
              </div>
              <div className="bg-white/6 rounded-2xl p-3 text-center">
                <p className="text-[20px] font-black text-white">{acceptedCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/40 mt-0.5">{lang === "mn" ? "Захиалга" : "Bookings"}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { setEditForm(profile || {}); setIsEditOpen(true); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white rounded-2xl py-2.5 text-[11px] font-bold border border-white/10 active:scale-95 transition-transform"
            >
              <Edit size={14} />
              {lang === "mn" ? "Засах" : "Edit"}
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 text-red-400 rounded-2xl py-2.5 text-[11px] font-bold border border-red-500/20 active:scale-95 transition-transform"
            >
              {isSigningOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              {lang === "mn" ? "Гарах" : "Sign Out"}
            </button>
          </div>
        </div>
      </section>

      {/* ── BOOKINGS ── */}
      <section className="px-4 mb-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["upcoming", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pill-tab ${tab === t ? "active" : "inactive"}`}>
              {t === "upcoming" ? (lang === "mn" ? "Ирэх" : "Upcoming") : (lang === "mn" ? "Түүх" : "History")}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {(tab === "upcoming" ? upcomingBookings : historyBookings).length === 0 ? (
            <div className="text-center py-12 opacity-40">
              <History size={32} className="mx-auto mb-3 text-earth" />
              <p className="text-[14px] text-earth">{lang === "mn" ? "Захиалга байхгүй" : "No bookings yet"}</p>
            </div>
          ) : (tab === "upcoming" ? upcomingBookings : historyBookings).map(b => (
            <div key={b._id} className="card-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold mb-1">
                    {b.serviceName?.[lk] || b.serviceName?.mn || "Үйлчилгээ"}
                  </p>
                  <p className="text-[15px] font-black text-ink truncate">
                    {isMonk ? b.clientName : (allMonks.find(m => m._id === b.monkId)?.name?.[lk] || "Багш")}
                  </p>
                  <p className="text-[11px] text-earth mt-1">{b.date} · {b.time}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`booking-chip ${
                    b.status === "confirmed" ? "status-confirmed" :
                    b.status === "pending" ? "status-pending" :
                    b.status === "completed" ? "status-completed" : "status-cancelled"
                  }`}>{b.status}</span>
                  {b.status === "confirmed" && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setActiveChatBooking(b)}
                        className="w-8 h-8 rounded-xl bg-stone flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <MessageCircle size={15} className="text-earth" />
                      </button>
                      <button
                        onClick={() => joinVideo(b)}
                        disabled={joiningId === b._id}
                        className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
                      >
                        {joiningId === b._id ? <Loader2 size={14} className="text-white animate-spin" /> : <Video size={14} className="text-white" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DAILY WISDOM ── */}
      <section className="px-4 mb-6">
        <div className="bg-[#1A1713] rounded-[24px] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />
          <Sun size={24} className="text-gold mb-3" />
          <h3 className="text-[13px] font-black text-white/80 mb-2 uppercase tracking-wider">
            {lang === "mn" ? "Өдрийн сургаал" : "Daily Wisdom"}
          </h3>
          <p className="text-[13px] text-white/50 italic leading-relaxed">
            "{lang === "mn" ? "Гэгээрэл дотроос ирдэг. Гаднаас бүү хай." : "Wisdom comes from within. Do not seek it without."}"
          </p>
        </div>
      </section>

      {/* ── EDIT PROFILE MODAL ── */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="w-full max-w-lg bg-white rounded-t-[28px] p-6"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)" }}
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[18px] font-black text-ink">
                  {lang === "mn" ? "Профайл засах" : "Edit Profile"}
                </h3>
                <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-stone flex items-center justify-center">
                  <X size={16} className="text-earth" />
                </button>
              </div>

              {/* Avatar upload */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone">
                    <img src={editForm.avatar || profile?.avatar || profile?.image || ""} className="w-full h-full object-cover" />
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <Upload size={11} className="text-white" />
                  </label>
                </div>
                {uploadingImage && <span className="text-[12px] text-earth">Хуулж байна...</span>}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="input-label">{lang === "mn" ? "Утасны дугаар" : "Phone Number"}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth" />
                  <input
                    className="input pl-10"
                    value={editForm.phone || ""}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+976 9900 0000"
                  />
                </div>
              </div>

              <button onClick={saveProfile} disabled={isSaving} className="btn-primary btn-primary-full flex items-center justify-center gap-2">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {lang === "mn" ? "Хадгалах" : "Save Profile"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CHAT MODAL ── */}
      <AnimatePresence>
        {activeChatBooking && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="w-full max-w-lg bg-white rounded-t-[28px] flex flex-col"
              style={{ height: "80svh", paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)" }}
            >
              <div className="flex items-center justify-between p-5 border-b border-stone/50">
                <h3 className="text-[16px] font-black text-ink">
                  {lang === "mn" ? "Чат" : "Chat"}
                </h3>
                <button onClick={() => setActiveChatBooking(null)} className="w-8 h-8 rounded-full bg-stone flex items-center justify-center">
                  <X size={16} className="text-earth" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  bookingId={activeChatBooking._id}
                  currentUserId={user?.id || ""}
                  currentUserName={profile?.name?.[lk] || user?.fullName || "User"}
                  isMonk={isMonk}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
