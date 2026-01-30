"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    Sun, Clock, ScrollText, Plus, Trash2, X, History, Video,
    Loader2, Save, Ban, CheckCircle, Edit, ImageIcon, Upload, MessageCircle, ShieldCheck, UserCircle,
    LogOut,
    Calendar
} from "lucide-react";
import OverlayNavbar from "../../components/Navbar";
import { useLanguage } from "../../contexts/LanguageContext";
import LiveRitualRoom from "../../components/LiveRitualRoom";
import ChatWindow from "../../components/ChatWindow";
import BookingDetailModal from "../admin/BookingDetailModal";
import { useAuth } from "@/contexts/AuthContext";

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
    schedule?: { day: string; start: string; end: string; active: boolean }[];
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

export default function DashboardPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { language } = useLanguage();
    const { signOut } = useClerk();
    const router = useRouter();
    const langKey = language === 'mn' ? 'mn' : 'en';

    // --- TRANSLATION DICTIONARY ---
    const TEXT = {
        en: {
            clientRole: "Seeker",
            earnings: "Total Earnings",
            bookBtn: "Book New Ritual",
            availability: "Availability Manager",
            updateBtn: "Update System",
            step1: "Step 1: Set Weekly Hours",
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
            chat: "Chat"
        },
        mn: {
            clientRole: "Эрхэм сүсэгтэн",
            earnings: "Нийт орлого",
            bookBtn: "Засал захиалах",
            availability: "Цагийн хуваарь",
            updateBtn: "Хадгалах",
            step1: "Алхам 1: 7 хоногийн цаг тохируулах",
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
    const [bookingForm, setBookingForm] = useState({ monkId: "", serviceId: "", date: "", time: "" });
    const [editForm, setEditForm] = useState<any>({});
    const [uploadingImage, setUploadingImage] = useState(false);

    // --- SCHEDULE STATE ---
    const [schedule, setSchedule] = useState<{ day: string; start: string; end: string; active: boolean }[]>(
        DAYS_EN.map(d => ({ day: d, start: "09:00", end: "17:00", active: true }))
    );
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [selectedBlockDate, setSelectedBlockDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    // --- ROLE CHECK (Moved up for scope access) ---
    const isMonk = profile?.role === 'monk';

    // --- SIGN OUT HANDLER ---
    const handleSignOut = async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Sign out failed", error);
            window.location.href = "/sign-in";
        }
    };

    // --- FETCH DATA ---
    useEffect(() => {
        if (user && user.authType === 'clerk') {
            fetch('/api/sync-user', { method: 'POST' }).catch(err => console.error("User sync failed", err));
        }
    }, [user]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                setLoading(true);
                const userId = user.id;
                let profileData = null;

                if (user.role === 'monk') {
                    const monksRes = await fetch(`/api/monks/${userId}`);
                    if (monksRes.ok) {
                        profileData = await monksRes.json();
                    }
                } else {
                    const userRes = await fetch(`/api/users/${userId}`, { cache: 'no-store' });
                    if (userRes.ok) {
                        profileData = await userRes.json();
                    }
                }

                if (!profileData && user.authType === 'custom') {
                    profileData = user;
                }

                if (profileData) {
                    setProfile(profileData);
                    if (profileData.role === 'monk') {
                        if (profileData.schedule) setSchedule(profileData.schedule);
                        if (profileData.blockedSlots) setBlockedSlots(profileData.blockedSlots);
                        const bRes = await fetch(`/api/bookings?monkId=${profileData._id}`);
                        if (bRes.ok) setBookings(await bRes.json());
                    } else {
                        if (!profileData.firstName || !profileData.lastName || !profileData.dateOfBirth) {
                            router.push("/complete-profile");
                            return;
                        }

                        const bRes = await fetch(`/api/bookings?userId=${profileData._id}`);
                        if (bRes.ok) setBookings(await bRes.json());
                        const allMonksRes = await fetch('/api/monks');
                        if (allMonksRes.ok) setAllMonks(await allMonksRes.json());
                    }
                } else {
                    const tempClientProfile: UserProfile = {
                        _id: userId,
                        role: "client",
                        name: { mn: user.firstName || "Хэрэглэгч", en: user.firstName || "User" },
                        phone: user.phone || "",
                        firstName: user.firstName,
                        lastName: user.lastName,
                    };
                    setProfile(tempClientProfile);
                    const allMonksRes = await fetch('/api/monks');
                    if (allMonksRes.ok) setAllMonks(await allMonksRes.json());
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

    // --- SEPARATE BOOKINGS ---
    const { upcomingBookings, historyBookings } = useMemo(() => {
        const now = new Date();
        const upcoming: Booking[] = [];
        const history: Booking[] = [];

        bookings.forEach(b => {
            let timeStr = b.time || "00:00";
            if (timeStr.includes(':')) {
                const [h, m] = timeStr.split(':').map(part => part.trim().padStart(2, '0'));
                timeStr = `${h}:${m}`;
            }
            const dateOnly = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            const bookingDate = new Date(`${dateOnly}T${timeStr}`);
            const isCompleted = ['completed', 'cancelled', 'rejected'].includes(b.status);
            const isPast = bookingDate < new Date(now.getTime() - 2 * 60 * 60 * 1000);

            if (!isCompleted && !isPast) {
                upcoming.push(b);
            } else {
                history.push(b);
            }
        });

        upcoming.sort((a, b) => {
            const dateA = a.date.includes('T') ? a.date.split('T')[0] : a.date;
            const dateB = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            return new Date(`${dateA}T${a.time}`).getTime() - new Date(`${dateB}T${b.time}`).getTime();
        });
        history.sort((a, b) => {
            const dateA = a.date.includes('T') ? a.date.split('T')[0] : a.date;
            const dateB = b.date.includes('T') ? b.date.split('T')[0] : b.date;
            return new Date(`${dateA}T${a.time}`).getTime() - new Date(`${dateB}T${b.time}`).getTime();
        });

        return { upcomingBookings: upcoming, historyBookings: history };
    }, [bookings]);

    const dailySlotsForBlocking = useMemo(() => {
        if (!selectedBlockDate) return [];
        const dateObj = new Date(selectedBlockDate);
        const dayName = DAYS_EN[dateObj.getDay()];
        const dayConfig = schedule.find(s => s.day === dayName);
        if (!dayConfig || !dayConfig.active) return [];

        const slots: string[] = [];
        const [startH, startM] = dayConfig.start.split(':').map(Number);
        const [endH, endM] = dayConfig.end.split(':').map(Number);
        const current = new Date(dateObj);
        current.setHours(startH, startM, 0, 0);
        const end = new Date(dateObj);
        end.setHours(endH, endM, 0, 0);

        while (current < end) {
            slots.push(current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
            current.setMinutes(current.getMinutes() + 60);
        }
        return slots;
    }, [selectedBlockDate, schedule]);

    const checkRitualAvailability = (booking: Booking) => {
        if (booking.callStatus === 'active') return { isOpen: true, message: TEXT.roomOpen };
        let timeStr = booking.time || "00:00";
        if (timeStr.includes(':')) {
            const [h, m] = timeStr.split(':').map(part => part.trim().padStart(2, '0'));
            timeStr = `${h}:${m}`;
        }
        const bookingDateTime = new Date(`${booking.date}T${timeStr}`);
        const now = new Date();
        const openTime = new Date(bookingDateTime.getTime() - 48 * 60 * 60 * 1000);
        const closeTime = new Date(bookingDateTime.getTime() + 30 * 60 * 1000);

        if (now >= openTime && now <= closeTime) return { isOpen: true, message: TEXT.roomOpen };
        if (now < openTime) {
            const diffMs = openTime.getTime() - now.getTime();
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            return { isOpen: false, message: `${TEXT.startsIn} ${diffHrs}h ${diffMins}m` };
        }
        return { isOpen: false, message: TEXT.roomClosed };
    };

    const saveScheduleSettings = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/monks/${profile._id}/schedule`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule, blockedSlots })
            });
            if (res.ok) alert(TEXT.alertSaved);
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const toggleBlockSlot = (time: string) => {
        const exists = blockedSlots.find(b => b.date === selectedBlockDate && b.time === time);
        if (exists) setBlockedSlots(blockedSlots.filter(b => b.id !== exists.id));
        else setBlockedSlots([...blockedSlots, { id: crypto.randomUUID(), date: selectedBlockDate, time }]);
    };

    const toggleBlockWholeDay = () => {
        const allBlocked = dailySlotsForBlocking.every(time => blockedSlots.some(b => b.date === selectedBlockDate && b.time === time));
        if (allBlocked) setBlockedSlots(blockedSlots.filter(b => b.date !== selectedBlockDate));
        else {
            const newBlocks = dailySlotsForBlocking
                .filter(time => !blockedSlots.some(b => b.date === selectedBlockDate && b.time === time))
                .map(time => ({ id: crypto.randomUUID(), date: selectedBlockDate, time }));
            setBlockedSlots([...blockedSlots, ...newBlocks]);
        }
    };

    const submitBooking = async () => {
        if (!bookingForm.monkId || !bookingForm.date || !bookingForm.time) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bookingForm, userName: profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "User", userEmail: user?.email, userId: profile?._id, serviceId: bookingForm.serviceId })
            });
            if (res.ok) { alert(TEXT.alertSent); setIsBookingModalOpen(false); window.location.reload(); }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const submitService = async () => {
        if (!profile) return;
        setIsSaving(true);
        const newService: ServiceItem = { id: crypto.randomUUID(), name: { en: serviceForm.nameEn, mn: serviceForm.nameMn }, price: Number(serviceForm.price), duration: serviceForm.duration, status: 'pending' };
        const updatedServices = [...(profile.services || []), newService];
        try {
            const res = await fetch(`/api/monks/${profile._id}/service`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ services: updatedServices }) });
            if (res.ok) { setProfile({ ...profile, services: updatedServices }); setIsServiceModalOpen(false); }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const deleteService = async (serviceId: string) => {
        if (!profile || !confirm(TEXT.alertDelete)) return;
        const updatedServices = (profile.services || []).filter(s => s.id !== serviceId);
        try {
            const res = await fetch(`/api/monks/${profile._id}/service`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ services: updatedServices }) });
            if (res.ok) setProfile({ ...profile, services: updatedServices });
        } catch (e) { console.error(e); }
    };

    // --- VIDEO CALL HANDLER (FIXED) ---
    const joinVideoCall = async (booking: Booking) => {
        setJoiningRoomId(booking._id);
        try {
            // 1. Optimistic Update (If Monk, mark as active immediately)
            if (isMonk) {
                // Update local state so UI reflects 'active' instantly
                setBookings(prev => prev.map(b =>
                    b._id === booking._id ? { ...b, callStatus: 'active' } : b
                ));

                // Send update to server in background
                await fetch(`/api/bookings/${booking._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callStatus: 'active' })
                });
            }

            // 2. Prepare Username & Fetch Token
            const username = user?.fullName || user?.firstName || user?.phone || "Anonymous";
            const encodedName = encodeURIComponent(username);

            const res = await fetch(`/api/livekit?room=${booking._id}&username=${encodedName}`);

            if (!res.ok) throw new Error("Failed to get room token");

            const data = await res.json();

            // 3. Enter Room
            setActiveRoomToken(data.token);
            setActiveRoomName(booking._id);
            setActiveBookingForRoom(booking);
        } catch (e) {
            console.error("Join Video Error:", e);
            alert("Could not join the video room. Please check your connection.");
        } finally {
            setJoiningRoomId(null);
        }
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
            setEditForm((prev: any) => ({ ...prev, image: fileData.secure_url, avatar: fileData.secure_url }));
        } catch (error) { console.error(error); } finally { setUploadingImage(false); }
    };

    const saveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const endpoint = profile.role === 'monk' ? `/api/monks/${profile._id}` : `/api/users/${user?.id}`;
            const res = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
            if (res.ok) { alert(TEXT.alertSaved); setProfile({ ...profile, ...editForm }); setIsEditProfileModalOpen(false); }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    if (!authLoading && !user) return null;

    if (activeRoomToken && activeRoomName) {
        return <LiveRitualRoom
            token={activeRoomToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
            roomName={activeRoomName}
            bookingId={activeRoomName}
            isMonk={isMonk}
            onLeave={async () => {
                if (isMonk && activeRoomName) {
                    await fetch(`/api/bookings/${activeRoomName}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callStatus: 'ended' }) });
                }
                setActiveRoomToken(null);
                setActiveRoomName(null);
                // Reload to refresh status
                window.location.reload();
            }}
        />;
    }

    if (isMonk && profile?.monkStatus === 'pending') {
        return (
            <div className="min-h-screen bg-[#FFFBEB] flex items-center justify-center p-6 font-serif text-[#451a03]">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-[#D97706]/20 text-center">
                    <Loader2 className="animate-spin mx-auto mb-6 text-amber-600" size={40} />
                    <h1 className="text-3xl font-bold mb-4 text-[#D97706]">Application Pending</h1>
                    <p className="text-[#78350F]/70 mb-8">Your application is under review. You will receive an email once approved.</p>
                    <a href="/" className="inline-block px-8 py-3 bg-[#D97706] text-white rounded-xl font-bold">Return Home</a>
                </div>
            </div>
        );
    }

    return (
        <>
            <OverlayNavbar />
            <main className="min-h-screen bg-[#FFFBEB] pt-32 pb-20 font-sans px-6">

                {/* HERO SECTION */}
                <section className="container mx-auto mb-12">
                    <div className="bg-[#451a03] rounded-[3rem] p-8 md:p-12 text-[#FFFBEB] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <div className="scale-[2] origin-center relative">
                                {user?.authType === 'clerk' ? (
                                    <UserButton />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold overflow-hidden border-2 border-[#FDE68A]">
                                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.firstName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-serif font-bold">
                                    {profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "Seeker"}
                                </h1>
                                <p className="text-[#FDE68A]/80 uppercase tracking-widest mt-2">{isMonk ? profile?.title?.[langKey] : TEXT.clientRole}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center justify-center">
                            {user?.role === 'admin' && (
                                <a href="/admin" className="bg-stone-900 text-white px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black border border-white/10 transition-all flex items-center gap-2">
                                    <ShieldCheck size={18} /> Admin
                                </a>
                            )}

                            <button onClick={() => { setEditForm(profile || {}); setIsEditProfileModalOpen(true); }} className="bg-white/10 text-white px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/20 flex items-center gap-3 border border-white/20 backdrop-blur-sm transition-all">
                                <Edit size={18} /> {TEXT.editProfile}
                            </button>

                            {/* SIGN OUT BUTTON */}
                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className="bg-red-500/10 text-red-400 px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-500 hover:text-white flex items-center gap-3 border border-red-500/20 transition-all disabled:opacity-50"
                            >
                                {isSigningOut ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <LogOut size={18} />
                                )}
                                {isSigningOut ? TEXT.signingOut : TEXT.signOut}
                            </button>

                            {isMonk && (
                                <a href="/monk/content" className="bg-[#D97706]/10 text-[#D97706] px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#D97706] hover:text-white border border-[#D97706]/20 transition-all flex items-center gap-2">
                                    <ScrollText size={18} /> Manage Content
                                </a>
                            )}

                            {!isMonk && (
                                <button onClick={() => setIsBookingModalOpen(true)} className="bg-[#D97706] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#B45309] shadow-lg flex items-center gap-3">
                                    <Plus size={18} /> {TEXT.bookBtn}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {isMonk && (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-serif font-bold text-[#451a03] flex items-center gap-3"><Clock className="text-[#D97706]" /> {TEXT.availability}</h2>
                                    <button onClick={saveScheduleSettings} disabled={isSaving} className="flex items-center gap-2 bg-[#D97706] text-white px-4 py-2 rounded-full font-bold text-xs">
                                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {TEXT.updateBtn}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {DAYS_EN.map((day, idx) => {
                                        const config = schedule.find(s => s.day === day) || { day, start: "09:00", end: "17:00", active: false };
                                        return (
                                            <div key={day} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all ${config.active ? 'bg-white border-[#D97706]/20' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.active}
                                                        onChange={(e) => {
                                                            const newSchedule = [...schedule];
                                                            const dayIdx = newSchedule.findIndex(s => s.day === day);
                                                            if (dayIdx > -1) {
                                                                newSchedule[dayIdx].active = e.target.checked;
                                                            } else {
                                                                newSchedule.push({ day, start: "09:00", end: "17:00", active: e.target.checked });
                                                            }
                                                            setSchedule(newSchedule);
                                                        }}
                                                        className="w-5 h-5 accent-[#D97706]"
                                                    />
                                                    <span className="font-bold text-[#451a03] min-w-25">{DAYS_MN[idx]} ({day.slice(0, 3)})</span>
                                                </div>

                                                {config.active && (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={config.start}
                                                            onChange={(e) => {
                                                                const newSchedule = [...schedule];
                                                                const dayIdx = newSchedule.findIndex(s => s.day === day);
                                                                newSchedule[dayIdx].start = e.target.value;
                                                                setSchedule(newSchedule);
                                                            }}
                                                            className="p-2 rounded-lg border border-stone-200 text-xs font-bold"
                                                        />
                                                        <span className="text-stone-400 font-bold">-</span>
                                                        <input
                                                            type="time"
                                                            value={config.end}
                                                            onChange={(e) => {
                                                                const newSchedule = [...schedule];
                                                                const dayIdx = newSchedule.findIndex(s => s.day === day);
                                                                newSchedule[dayIdx].end = e.target.value;
                                                                setSchedule(newSchedule);
                                                            }}
                                                            className="p-2 rounded-lg border border-stone-200 text-xs font-bold"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-serif font-bold text-[#451a03] flex items-center gap-3">
                                    <History className="text-[#78350F]" /> {isMonk ? TEXT.ritualsClient : TEXT.ritualsMy}
                                </h2>
                                <div className="flex bg-stone-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setActiveBookingTab('upcoming')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeBookingTab === 'upcoming' ? 'bg-white shadow text-[#451a03]' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        Upcoming
                                    </button>
                                    <button
                                        onClick={() => setActiveBookingTab('history')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeBookingTab === 'history' ? 'bg-white shadow text-[#451a03]' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {activeBookingTab === 'upcoming' ? (
                                    upcomingBookings.length > 0 ? upcomingBookings.map((b) => {
                                        const availability = checkRitualAvailability(b);
                                        const isJoiningThis = joiningRoomId === b._id;

                                        return (
                                            <div key={b._id} className="p-4 md:p-5 rounded-2xl border border-stone-100 flex flex-col md:flex-row md:justify-between md:items-center bg-stone-50/50 gap-4 transition-all hover:border-[#D97706]/20">
                                                <div
                                                    className={`flex-1 ${!isMonk ? "cursor-pointer" : ""}`}
                                                    onClick={() => {
                                                        if (!isMonk) {
                                                            router.push(`/${language}/monks/${b.monkId}`);
                                                        }
                                                    }}
                                                >
                                                    <h4 className={`font-bold text-[#451a03] text-sm md:text-base ${!isMonk ? "hover:text-[#D97706] transition-colors" : ""}`}>
                                                        {isMonk ? b.clientName : (allMonks.find(m => m._id === b.monkId)?.name?.[langKey] || b.serviceName?.en || "Monk")}
                                                    </h4>
                                                    {isMonk && <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block mb-1">{b.serviceName?.en || "Service"}</span>}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] md:text-xs text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-100">{b.date} • {b.time}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center md:items-end gap-2 shrink-0">
                                                    {b.status === 'confirmed' ? (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    setActiveChatBooking(b);
                                                                    if (isMonk && b.clientId) {
                                                                        try {
                                                                            const res = await fetch(`/api/users/${b.clientId}`);
                                                                            if (res.ok) {
                                                                                const userData = await res.json();
                                                                                setChatClientInfo(userData);
                                                                            }
                                                                        } catch (e) {
                                                                            console.error("Failed to fetch client info", e);
                                                                        }
                                                                    }
                                                                }}
                                                                className="w-full md:w-auto px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-[10px] md:text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-stone-200 transition-transform active:scale-95"
                                                            >
                                                                <MessageCircle size={14} /> {TEXT.chat}
                                                            </button>

                                                            {/* START OF VIDEO BUTTON LOGIC */}
                                                            {b.callStatus === 'active' ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveBookingForRoom(b);
                                                                        joinVideoCall(b);
                                                                    }}
                                                                    disabled={isJoiningThis}
                                                                    className="w-full md:w-auto px-4 py-2.5 bg-green-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:bg-green-700 transition-transform active:scale-95 disabled:opacity-70"
                                                                >
                                                                    {isJoiningThis ? <Loader2 className="animate-spin" size={14} /> : <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                                                    <Video size={14} /> Join Video Call
                                                                </button>
                                                            ) : availability.isOpen ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveBookingForRoom(b);
                                                                        joinVideoCall(b); // CALLS FUNCTION NOW
                                                                    }}
                                                                    disabled={isJoiningThis}
                                                                    className="w-full md:w-auto px-4 py-2.5 bg-[#D97706] text-white rounded-xl text-[10px] md:text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:bg-[#B45309] transition-transform active:scale-95 disabled:opacity-70"
                                                                >
                                                                    {isJoiningThis ? <Loader2 className="animate-spin" size={14} /> : <Video size={14} />}
                                                                    {TEXT.enterRoom}
                                                                </button>
                                                            ) : (
                                                                <div className="w-full md:w-auto flex items-center justify-end">
                                                                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase bg-stone-100 text-stone-400 border border-stone-200">
                                                                        {availability.message}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {/* END OF VIDEO BUTTON LOGIC */}
                                                        </>
                                                    ) : <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${b.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                                                        {b.status === 'pending' ? TEXT.pending : b.status}
                                                    </span>}
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-stone-400 italic text-center py-6">No upcoming rituals.</p>
                                ) : (
                                    historyBookings.length > 0 ? historyBookings.map((b) => (
                                        <div key={b._id} className="p-4 md:p-5 rounded-2xl border border-stone-100 flex flex-col md:flex-row md:justify-between md:items-center bg-stone-50/20 gap-4 opacity-70 hover:opacity-100 transition-all">
                                            <div
                                                className={`flex-1 ${!isMonk ? "cursor-pointer" : ""}`}
                                                onClick={() => {
                                                    if (!isMonk) {
                                                        router.push(`/${language}/monks/${b.monkId}`);
                                                    }
                                                }}
                                            >
                                                <h4 className={`font-bold text-[#451a03] text-sm md:text-base line-through opacity-60 ${!isMonk ? "hover:text-[#D97706] transition-colors" : ""}`}>
                                                    {isMonk ? b.clientName : (allMonks.find(m => m._id === b.monkId)?.name?.[langKey] || "Monk")}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] md:text-xs text-stone-400 bg-transparent px-0 py-0">{b.date} • {b.time}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${b.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' :
                                                    b.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        'bg-stone-100 text-stone-500 border-stone-200'
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        </div>
                                    )) : <p className="text-stone-400 italic text-center py-6">No history yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#FEF3C7] border border-[#FDE68A] p-8 rounded-[2.5rem]">
                            <Sun className="w-16 h-16 text-[#F59E0B]/30 mb-4" />
                            <h3 className="text-xl font-bold text-[#78350F] mb-2">{TEXT.wisdomTitle}</h3>
                            <p className="italic text-[#78350F]/80 text-sm">"{TEXT.wisdomQuote}"</p>
                        </div>
                    </div>
                </section>

                {/* CHAT MODAL */}
                <AnimatePresence>
                    {activeChatBooking && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl w-full max-w-lg h-150 shadow-2xl overflow-hidden flex flex-col">
                                <div className="p-4 border-b flex justify-between items-center bg-stone-50">
                                    <h3 className="font-bold text-stone-800">{TEXT.chat}</h3>
                                    <button onClick={() => { setActiveChatBooking(null); setChatClientInfo(null); }} className="p-2 hover:bg-stone-200 rounded-full"><X size={20} /></button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <ChatWindow
                                        bookingId={activeChatBooking._id}
                                        currentUserId={user?.id || ""}
                                        currentUserName={profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "User"}
                                        clientInfo={chatClientInfo}
                                        isMonk={isMonk}
                                        onProfileClick={async (senderId) => {
                                            if (!isMonk && user?.role !== 'admin') return;
                                            try {
                                                const res = await fetch(`/api/users/${senderId}`);
                                                if (res.ok) {
                                                    const userData = await res.json();
                                                    setChatProfileUser(userData);
                                                }
                                            } catch (e) {
                                                console.error("Failed to fetch user", e);
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODALS */}
                <AnimatePresence>
                    {isEditProfileModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-4xl p-8 w-full max-w-2xl h-[85vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold font-serif text-[#451a03]">{TEXT.modalProfileTitle}</h3>
                                    <button onClick={() => setIsEditProfileModalOpen(false)}><X size={24} /></button>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#FDE68A]">
                                            <img src={editForm.image || editForm.avatar || user?.avatar} className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
                                                <input type="file" className="hidden" onChange={handleImageUpload} />
                                                <Upload className="text-white" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input className="p-3 border rounded-xl" placeholder="Phone" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                    </div>
                                    <button onClick={saveProfile} className="w-full py-4 bg-[#D97706] text-white rounded-2xl font-bold uppercase">
                                        {isSaving ? <Loader2 className="animate-spin mx-auto" /> : TEXT.saveProfile}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <BookingDetailModal
                        isOpen={!!chatProfileUser}
                        booking={activeChatBooking}
                        user={chatProfileUser}
                        onClose={() => setChatProfileUser(null)}
                        onAction={() => { }}
                    />
                </AnimatePresence>

            </main>
        </>
    );
}