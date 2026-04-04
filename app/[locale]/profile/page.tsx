"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    Sun, Clock, ScrollText, Plus, Trash2, X, History, Video,
    Loader2, Save, Ban, CheckCircle, Edit, ImageIcon, Upload, MessageCircle, ShieldCheck, UserCircle,
    LogOut,
    Calendar,
    TrendingUp,
    Phone,
    LogIn,
    Heart,
    Sprout
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import LiveRitualRoom from "../../components/LiveRitualRoom";
import ChatWindow from "../../components/ChatWindow";
import BookingDetailModal from "../admin/BookingDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// --- TYPES ---
interface ServiceItem {
    id: string;
    name: { mn: string; en: string };
    price: number;
    duration: string;
    status?: 'pending' | 'approved' | 'rejected' | 'active';
}

interface BlockedSlot {
    id: string;
    date: string;
    time: string;
}

interface UserProfile {
    _id: string;
    role: "client" | "monk";
    monkStatus?: "pending" | "approved" | "rejected";
    name?: { mn: string; en: string };
    title?: { mn: string; en: string };
    services?: ServiceItem[];
    schedule?: { day: string; start: string; end: string; active: boolean; slots?: string[] }[];
    blockedSlots?: BlockedSlot[];
    earnings?: number;
    image?: string;
    avatar?: string;
    bio?: { mn: string; en: string };
    specialties?: string[];
    education?: { mn: string; en: string };
    philosophy?: { mn: string; en: string };
    yearsOfExperience?: number;
    video?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    zodiacYear?: string;
    isSpecial?: boolean;
}

interface Booking {
    _id: string;
    monkId: string;
    clientId?: string;
    clientName: string;
    serviceName: any;
    date: string;
    time: string;
    status: string;
    callStatus?: string;
}

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_MN = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
const ALL_24_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { language } = useLanguage();
    const { signOut } = useClerk();
    const router = useRouter();
    const langKey = language === 'mn' ? 'mn' : 'en';

    // --- TRANSLATION DICTIONARY ---
    const TEXT = {
        en: {
            guestTitle: "Start Your Journey",
            guestDesc: "Create a profile to book rituals, track your spiritual progress, and connect deeply with mentors.",
            signInBtn: "Sign In / Register",
            clientRole: "Seeker",
            earnings: "Total Earnings",
            bookBtn: "Book New Ritual",
            availability: "Availability Manager",
            updateBtn: "Update System",
            step1: "Step 1: Weekly Availability",
            step1Desc: "Toggle hours you are USUALLY available each week (00:00 - 24:00)",
            step2: "Step 2: Manage Exceptions",
            step2Desc: "Pick a date to mark specific hours as",
            busy: "Busy",
            unblockDay: "Unblock Day",
            blockDay: "Block Day",
            noHours: "No working hours set for this day.",
            checkAbove: "Check your Weekly Schedule above.",
            ritualsClient: "Client Rituals",
            ritualsMy: "My Rituals",
            join: "Join",
            noRituals: "No scheduled rituals.",
            services: "Services",
            active: "Active",
            pending: "Pending",
            deleteSvc: "Delete Service",
            wisdomTitle: "Daily Wisdom",
            wisdomQuote: "Wisdom comes from within. Do not seek it without.",
            modalBookTitle: "Book a Ritual",
            selectGuide: "Select Guide",
            selectDate: "Select Date",
            unavailable: "Unavailable on this day.",
            selectService: "Select Service",
            confirmBook: "Confirm Booking",
            modalSvcTitle: "New Service",
            cancel: "Cancel",
            submitReview: "Submit for Review",
            alertSaved: "Availability updated successfully!",
            alertSent: "Request sent!",
            alertDelete: "Delete this service?",
            editProfile: "Edit Profile",
            saveProfile: "Save Profile",
            modalProfileTitle: "Edit Profile",
            labelNameMN: "Name (MN)",
            labelNameEN: "Name (EN)",
            labelTitleMN: "Title (MN)",
            labelTitleEN: "Title (EN)",
            labelBioMN: "Bio (MN)",
            labelBioEN: "Bio (EN)",
            labelExp: "Years of Experience",
            labelSpecialties: "Specialties (comma separated)",
            labelImage: "Profile Image",
            labelPhone: "Phone Number",
            uploading: "Uploading...",
            enterRoom: "Enter Ritual Room",
            startsIn: "Starts in",
            roomOpen: "Room Open",
            roomClosed: "Room Closed",
            startVideo: "Start Video Call",
            signOut: "Sign Out",
            signingOut: "Signing Out...",
            chat: "Chat",
            acceptedBookings: "Accepted Bookings"
        },
        mn: {
            guestTitle: "Аяллын эхлэл",
            guestDesc: "Профайл нээснээр засал захиалах, сүнслэг аяллын түүхээ харах, багш нартай шууд холбогдох боломжтой болно.",
            signInBtn: "Нэвтрэх / Бүртгүүлэх",
            clientRole: "Эрхэм сүсэгтэн",
            earnings: "Нийт орлого",
            bookBtn: "Засал захиалах",
            availability: "Цагийн хуваарь",
            updateBtn: "Хадгалах",
            step1: "Алхам 1: 7 хоногийн тогтмол цаг",
            step1Desc: "Долоо хоног бүр тогтмол ажиллах цагаа сонгоно уу (00:00 - 24:00)",
            step2: "Алхам 2: Тусгай өдөр тохируулах",
            step2Desc: "Тодорхой өдрийн цагийг хаах бол өдрөө сонгоно уу",
            busy: "Завгүй",
            unblockDay: "Өдрийг нээх",
            blockDay: "Өдрийг хаах",
            noHours: "Энэ өдөр цагийн хуваарь байхгүй байна.",
            checkAbove: "Дээрх 7 хоногийн хуваарийг шалгана уу.",
            ritualsClient: "Сүсэгтний засал",
            ritualsMy: "Миний засал",
            join: "Нэгдэх",
            noRituals: "Захиалга алга байна.",
            services: "Үйлчилгээ",
            active: "Идэвхтэй",
            pending: "Хүлээгдэж буй",
            deleteSvc: "Устгах",
            wisdomTitle: "Өдрийн сургаал",
            wisdomQuote: "Гэгээрэл дотроос ирдэг. Гаднаас бүү хай.",
            modalBookTitle: "Засал захиалах",
            selectGuide: "Лам сонгох",
            selectDate: "Өдөр сонгох",
            unavailable: "Энэ өдөр боломжгүй.",
            selectService: "Үйлчилгээ сонгох",
            confirmBook: "Баталгаажуулах",
            modalSvcTitle: "Шинэ үйлчилгээ",
            cancel: "Болих",
            submitReview: "Илгээх",
            alertSaved: "Амжилттай хадгалагдлаа!",
            alertSent: "Хүсэлт илгээгдлээ!",
            alertDelete: "Та энэ үйлчилгээг устгахдаа итгэлтэй байна уу?",
            editProfile: "Профайл засах",
            saveProfile: "Хадгалах",
            modalProfileTitle: "Профайл засах",
            labelNameMN: "Нэр (Монгол)",
            labelNameEN: "Нэр (Англи)",
            labelTitleMN: "Цол (Монгол)",
            labelTitleEN: "Цол (Англи)",
            labelBioMN: "Намтар (Монгол)",
            labelBioEN: "Намтар (Англи)",
            labelExp: "Ажилласан жил",
            labelSpecialties: "Мэргэшсэн чиглэл (таслалаар тусгаарлах)",
            labelImage: "Профайл зураг",
            labelPhone: "Утасны дугаар",
            uploading: "Хуулж байна...",
            enterRoom: "Өрөөнд орох",
            startsIn: "Эхлэхэд",
            roomOpen: "Өрөө нээлттэй",
            roomClosed: "Хаагдсан",
            startVideo: "Видео дуудлага эхлүүлэх",
            signOut: "Гарах",
            signingOut: "Гарч байна...",
            chat: "Чат"
        }
    }[langKey];

    // --- DATA STATE ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activeBookingTab, setActiveBookingTab] = useState<'upcoming' | 'history'>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allMonks, setAllMonks] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);

    // --- VIDEO CALL STATE ---
    const [activeRoomToken, setActiveRoomToken] = useState<string | null>(null);
    const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
    const [chatProfileUser, setChatProfileUser] = useState<any>(null);
    const [chatClientInfo, setChatClientInfo] = useState<any>(null);
    const [activeBookingForRoom, setActiveBookingForRoom] = useState<Booking | null>(null);
    const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
    const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);

    // --- MODALS ---
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    // --- FORMS ---
    const [serviceForm, setServiceForm] = useState({ nameEn: "", nameMn: "", price: 0, duration: "30 min" });
    const [editForm, setEditForm] = useState<any>({});
    const [uploadingImage, setUploadingImage] = useState(false);

    // --- SCHEDULE STATE ---
    const [schedule, setSchedule] = useState<{ day: string; start: string; end: string; active: boolean; slots?: string[] }[]>(
        DAYS_EN.map(d => ({ day: d, start: "09:00", end: "17:00", active: true, slots: ALL_24_SLOTS }))
    );
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [selectedBlockDate, setSelectedBlockDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    // --- ROLE CHECK ---
    const isMonk = profile?.role === 'monk';

    // --- VIDEO CALL HANDLER ---
    const joinVideoCall = React.useCallback(async (booking: Booking) => {
        setJoiningRoomId(booking._id);
        try {
            if (profile?.role === 'monk') {
                setBookings(prev => prev.map(b =>
                    b._id === booking._id ? { ...b, callStatus: 'active' } : b
                ));
                await fetch(`/api/bookings/${booking._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callStatus: 'active' })
                });
            }
            const username = user?.fullName || user?.firstName || user?.phone || "Anonymous";
            const encodedName = encodeURIComponent(username);
            const res = await fetch(`/api/livekit?room=${booking._id}&username=${encodedName}`);
            if (!res.ok) throw new Error("Failed to get room token");
            const data = await res.json();
            setActiveRoomToken(data.token);
            setActiveRoomName(booking._id);
            setActiveBookingForRoom(booking);
        } catch (e) {
            console.error("Join Video Error:", e);
        } finally {
            setJoiningRoomId(null);
        }
    }, [profile, user]);

    // --- POLL DATA ---
    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                setLoading(true);
                const userId = user.id;
                let profileData = null;

                if (user.role === 'monk') {
                    const monksRes = await fetch(`/api/monks/${userId}`);
                    if (monksRes.ok) profileData = await monksRes.json();
                } else {
                    const userRes = await fetch(`/api/users/${userId}`, { cache: 'no-store' });
                    if (userRes.ok) profileData = await userRes.json();
                }

                if (profileData) {
                    setProfile(profileData);
                    let currentBookings: Booking[] = [];
                    if (profileData.role === 'monk') {
                        if (profileData.schedule) setSchedule(profileData.schedule);
                        if (profileData.blockedSlots) setBlockedSlots(profileData.blockedSlots);
                        const bRes = await fetch(`/api/bookings?monkId=${profileData._id}`);
                        if (bRes.ok) currentBookings = await bRes.json();
                    } else {
                        const bRes = await fetch(`/api/bookings?userId=${profileData._id}`);
                        if (bRes.ok) currentBookings = await bRes.json();
                        const allMonksRes = await fetch('/api/monks');
                        if (allMonksRes.ok) setAllMonks(await allMonksRes.json());
                    }
                    setBookings(currentBookings);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (!authLoading && user) {
            fetchData();
            const pollInterval = setInterval(fetchData, 8000);
            return () => clearInterval(pollInterval);
        }
    }, [authLoading, user]);

    // --- CALCULATED DATA ---
    const { upcomingBookings, historyBookings, acceptedCount, totalEarnings } = useMemo(() => {
        const upcoming: Booking[] = [];
        const history: Booking[] = [];
        let accCount = 0;

        bookings.forEach(b => {
            const isFinalized = ['completed', 'cancelled', 'rejected'].includes(b.status);
            const shouldBeInUpcoming = !isFinalized && (b.status === 'confirmed' || b.status === 'pending');
            if (['confirmed', 'completed'].includes(b.status)) accCount++;
            if (shouldBeInUpcoming) upcoming.push(b);
            else history.push(b);
        });

        upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        const rate = profile?.isSpecial ? 88800 : 40000;
        return { upcomingBookings: upcoming, historyBookings: history, acceptedCount: accCount, totalEarnings: accCount * rate };
    }, [bookings, profile]);

    const checkRitualAvailability = (booking: Booking) => {
        if (booking.callStatus === 'active') return { isOpen: true, message: TEXT.roomOpen };
        const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
        const now = new Date();
        const openTime = new Date(bookingDateTime.getTime() - 48 * 60 * 60 * 1000);
        if (now >= openTime) return { isOpen: true, message: TEXT.roomOpen };
        return { isOpen: false, message: `${TEXT.startsIn}` };
    };

    const saveScheduleSettings = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            await fetch(`/api/monks/${profile._id}/schedule`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule, blockedSlots })
            });
            alert(TEXT.alertSaved);
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try { await logout(); } catch (e) { window.location.href = "/sign-in"; }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
            const fileData = await res.json();
            setEditForm((prev: any) => ({ ...prev, avatar: fileData.secure_url }));
        } catch (e) { console.error(e); } finally { setUploadingImage(false); }
    };

    const saveProfileChanges = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const endpoint = profile.role === 'monk' ? `/api/monks/${profile._id}` : `/api/users/${user?.id}`;
            const res = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
            if (res.ok) { setProfile({ ...profile, ...editForm }); setIsEditProfileModalOpen(false); }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    // --- RENDER GUEST VIEW ---
    if (!authLoading && !user) {
        return (
            <main className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden" 
                  style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 100px)" }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(217,119,6,0.06)_0%,_transparent_60%)] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-modal border border-white text-center relative z-10"
                >
                    <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <UserCircle size={48} className="text-gold" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center border-4 border-white"
                        >
                            <Plus size={12} className="text-white" />
                        </motion.div>
                    </div>

                    <h1 className="text-h1 font-serif text-ink mb-4">{TEXT.guestTitle}</h1>
                    <p className="text-body text-earth/60 mb-10 leading-relaxed">{TEXT.guestDesc}</p>

                    <div className="grid grid-cols-1 gap-4 mb-10 text-left">
                        <div className="flex items-center gap-4 p-4 bg-stone/30 rounded-2xl border border-border/50">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gold">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase text-ink tracking-widest">{language === 'mn' ? "Засал захиалах" : "Book Rituals"}</h4>
                                <p className="text-[10px] text-earth/50">{language === 'mn' ? "Багш нартай цаг товлох" : "Schedule session with gurus"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-stone/30 rounded-2xl border border-border/50 text-left">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gold">
                                <History size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase text-ink tracking-widest">{language === 'mn' ? "Түүх харах" : "Track Progress"}</h4>
                                <p className="text-[10px] text-earth/50">{language === 'mn' ? "Өөрийн сүнслэг аяллыг хянах" : "Keep history of your journey"}</p>
                            </div>
                        </div>
                    </div>

                    <LocalizedLink href="/sign-in">
                        <button className="cta-button w-full h-16 shadow-gold group">
                            <LogIn size={20} className="mr-2" />
                            <span className="text-xs uppercase tracking-widest">{TEXT.signInBtn}</span>
                        </button>
                    </LocalizedLink>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 opacity-10 animate-float">
                   <Sprout size={100} className="text-gold" />
                </div>
                <div className="absolute bottom-40 right-10 opacity-10 animate-float-delayed">
                   <Heart size={80} className="text-gold" />
                </div>
            </main>
        );
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <Loader2 className="animate-spin text-gold" size={40} />
            </div>
        );
    }

    // --- REUSE DASHBOARD UI FOR LOGGED IN STATE ---
    if (activeRoomToken && activeRoomName) {
        return <LiveRitualRoom
            token={activeRoomToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
            roomName={activeRoomName}
            bookingId={activeRoomName}
            isMonk={isMonk}
            onLeave={() => window.location.reload()}
        />;
    }

    return (
        <main className="min-h-[100svh] bg-cream relative overflow-hidden" 
              style={{
                paddingTop: "calc(var(--header-height-mobile) + env(safe-area-inset-top))",
                paddingBottom: "max(env(safe-area-inset-bottom, 0px), 100px)",
                paddingLeft: "env(safe-area-inset-left, 0px)",
                paddingRight: "env(safe-area-inset-right, 0px)"
            }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(217,119,6,0.03)_0%,_transparent_50%)] pointer-events-none" />

            {/* HERO SECTION */}
            <section className="container mx-auto mb-10 relative z-10 px-4">
                <div className="bg-hero-bg rounded-[2.5rem] p-8 md:p-12 text-white shadow-modal flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')]" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left w-full lg:w-auto">
                        <div className="relative group">
                            <div className="relative">
                                {user?.authType === 'clerk' ? (
                                    <div className="scale-[1.8] origin-center"><UserButton /></div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gold/10 text-gold flex items-center justify-center font-black overflow-hidden border-2 border-gold/20 shadow-lg">
                                        {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <span className="text-2xl">{user?.firstName?.[0]}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-h1 md:text-4xl font-serif font-black text-white mb-2">
                                {profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "Seeker"}
                            </h1>
                            <p className="text-label text-gold/80 tracking-[0.3em]">{isMonk ? profile?.title?.[langKey] : TEXT.clientRole}</p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-4 items-center justify-center lg:justify-end">
                        <button onClick={() => { setEditForm(profile || {}); setIsEditProfileModalOpen(true); }} className="px-6 py-3.5 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all flex items-center gap-2">
                            <Edit size={16} /> {TEXT.editProfile}
                        </button>
                        <button onClick={handleSignOut} disabled={isSigningOut} className="px-6 py-3.5 rounded-full bg-red-500/10 text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white border border-red-500/20 backdrop-blur-md transition-all flex items-center gap-2">
                            {isSigningOut ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
                            {TEXT.signOut}
                        </button>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT GRID */}
            <section className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 px-4">
                <div className="lg:col-span-2 space-y-8">
                    {/* STATS (Monks only) */}
                    {isMonk && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="monastery-card p-8 flex items-center gap-6 bg-white">
                                <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold"><TrendingUp size={30} /></div>
                                <div><p className="text-label text-earth/60 mb-2">{TEXT.earnings}</p><h3 className="text-price text-2xl text-ink font-black">{totalEarnings.toLocaleString()}₮</h3></div>
                            </div>
                            <div className="monastery-card p-8 flex items-center gap-6 bg-white">
                                <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold"><CheckCircle size={30} /></div>
                                <div><p className="text-label text-earth/60 mb-2">{TEXT.acceptedBookings}</p><h3 className="text-h2 text-2xl text-ink font-black">{acceptedCount}</h3></div>
                            </div>
                        </div>
                    )}

                    {/* BOOKINGS LIST */}
                    <div className="monastery-card p-6 md:p-10 bg-white/90 backdrop-blur-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-border pb-6">
                            <h2 className="text-display flex items-center gap-4"><History className="text-gold" /> {isMonk ? TEXT.ritualsClient : TEXT.ritualsMy}</h2>
                            <div className="flex bg-stone/30 p-1.5 rounded-2xl border border-border/50">
                                <button onClick={() => setActiveBookingTab('upcoming')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-design ${activeBookingTab === 'upcoming' ? 'bg-gold text-white shadow-gold' : 'text-earth/60 hover:text-earth'}`}>Upcoming</button>
                                <button onClick={() => setActiveBookingTab('history')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-design ${activeBookingTab === 'history' ? 'bg-gold text-white shadow-gold' : 'text-earth/60 hover:text-earth'}`}>History</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {(activeBookingTab === 'upcoming' ? upcomingBookings : historyBookings).length > 0 ? (
                                (activeBookingTab === 'upcoming' ? upcomingBookings : historyBookings).map(b => (
                                    <div key={b._id} className="p-5 rounded-[2rem] border border-border flex flex-col md:flex-row md:justify-between md:items-center bg-stone/10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-gold uppercase">{b.serviceName?.mn || b.serviceName?.en}</span>
                                                <span className="text-[9px] text-earth/40 text-black uppercase tracking-widest opacity-50">{b.date} • {b.time}</span>
                                            </div>
                                            <h4 className="text-h2 text-ink">{isMonk ? b.clientName : (allMonks.find(m => m._id === b.monkId)?.name?.[langKey] || "Monk")}</h4>
                                        </div>
                                        {b.status === 'confirmed' && (
                                            <button onClick={() => joinVideoCall(b)} className="px-6 py-3 bg-gold text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-gold"><Video size={14} /> {TEXT.enterRoom}</button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-30"><p className="text-body font-serif">{TEXT.noRituals}</p></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="space-y-6">
                    <div className="monastery-card p-10 bg-hero-bg text-white border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')]" />
                        <Sun className="w-12 h-12 text-gold mb-6 animate-pulse" />
                        <h3 className="text-h2 text-white/90 mb-4 tracking-wide">{TEXT.wisdomTitle}</h3>
                        <p className="text-body italic text-white/60 leading-relaxed font-serif">"{TEXT.wisdomQuote}"</p>
                    </div>
                </div>
            </section>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
                {isEditProfileModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-modal border border-border">
                            <div className="flex justify-between items-center mb-8"><h3 className="text-display text-ink">{TEXT.modalProfileTitle}</h3><button onClick={() => setIsEditProfileModalOpen(false)}><X size={28} /></button></div>
                            <div className="space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-modal relative group">
                                        <img src={editForm.avatar || profile?.avatar || user?.avatar} className="w-full h-full object-cover" />
                                        <label className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"><input type="file" className="hidden" onChange={handleImageUpload} /><Upload className="text-white" /></label>
                                    </div>
                                    {uploadingImage && <Loader2 className="animate-spin text-gold" />}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-label text-earth/60 ml-4">{TEXT.labelPhone}</label>
                                    <input className="w-full px-6 py-4 rounded-2xl border border-border bg-stone/5 outline-none focus:border-gold" value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                </div>
                                <button onClick={saveProfileChanges} disabled={isSaving} className="cta-button w-full h-16 shadow-gold">{isSaving ? <Loader2 className="animate-spin" /> : TEXT.saveProfile}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CHAT MODAL WRAPPER */}
            <AnimatePresence>
                {activeChatBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-xl h-[80vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-h2">{TEXT.chat}</h3>
                                <button onClick={() => setActiveChatBooking(null)}><X size={24} /></button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ChatWindow bookingId={activeChatBooking._id} currentUserId={user?.id || ""} currentUserName={profile?.name?.[langKey] || user?.fullName || "User"} isMonk={isMonk} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

// Helper to make the transition easier
const LocalizedLink = ({ href, children, ...props }: any) => {
    const { language } = useLanguage();
    const path = `/${language}${href}`;
    return <Link href={path} {...props}>{children}</Link>;
};
