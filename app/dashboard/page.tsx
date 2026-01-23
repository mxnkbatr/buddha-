"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
    Sun, Clock, ScrollText, Plus, Trash2, X, History, Video,
    Loader2, Save, Ban, CheckCircle, Edit, ImageIcon, Upload, MessageCircle, ShieldCheck, UserCircle
} from "lucide-react";
import OverlayNavbar from "../components/Navbar";
import { useLanguage } from "../contexts/LanguageContext";
import LiveRitualRoom from "../components/LiveRitualRoom";
import ChatWindow from "../components/ChatWindow";
import { useAuth } from "../contexts/AuthContext";

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
    // Added fields for profile editing
    image?: string;
    avatar?: string; // for client
    bio?: { mn: string; en: string };
    specialties?: string[];
    education?: { mn: string; en: string };
    philosophy?: { mn: string; en: string };
    yearsOfExperience?: number;
    video?: string;
    phone?: string;
    firstName?: string;
}

interface Booking {
    _id: string;
    monkId: string;
    clientName: string;
    serviceName: any;
    date: string;
    time: string;
    status: string;
    callStatus?: string;
}

// English keys for DB/Logic, Mongolian for Display
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_MN = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { language } = useLanguage(); // assuming language is 'en' or 'mn'
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
            wisdomQuote: "Peace comes from within. Do not seek it without.",
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
            startVideo: "Start Video Call"
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
            wisdomQuote: "Амар амгалан дотроос ирдэг. Гаднаас бүү хай.",
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
            startVideo: "Видео дуудлага эхлүүлэх"
        }
    }[langKey];

    // --- DATA STATE ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allMonks, setAllMonks] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // --- VIDEO CALL STATE ---
    const [activeRoomToken, setActiveRoomToken] = useState<string | null>(null);
    const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
    const [activeBookingForRoom, setActiveBookingForRoom] = useState<Booking | null>(null);
    const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
    const [showJoinNotification, setShowJoinNotification] = useState(false);

    // --- MODALS ---
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    // --- FORMS ---
    const [serviceForm, setServiceForm] = useState({ nameEn: "", nameMn: "", price: 0, duration: "30 min" });
    const [bookingForm, setBookingForm] = useState({ monkId: "", serviceId: "", date: "", time: "" });

    // Profile Edit Form State
    const [editForm, setEditForm] = useState<any>({});
    const [uploadingImage, setUploadingImage] = useState(false);

    // --- SCHEDULE STATE (Monk Side) ---
    const [schedule, setSchedule] = useState<{ day: string; start: string; end: string; active: boolean }[]>(
        DAYS_EN.map(d => ({ day: d, start: "09:00", end: "17:00", active: true }))
    );
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

    // Block Time UI State
    const [selectedBlockDate, setSelectedBlockDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        if (user && user.authType === 'clerk') {
            // Sync user to DB (ensures phone number is saved and user exists)
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
                const monksRes = await fetch(`/api/monks/${userId}`);

                if (monksRes.ok) {
                    profileData = await monksRes.json();
                } else if (user.authType === 'custom') {
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
            const pollInterval = setInterval(fetchData, 8000); // 8 second polling
            return () => clearInterval(pollInterval);
        }
    }, [authLoading, user]);

    // --- LOGIC: GENERATE SLOTS FOR BLOCKING UI ---
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

    // --- HELPER: CHECK RITUAL AVAILABILITY ---
    const checkRitualAvailability = (booking: Booking) => {
        if (booking.callStatus === 'active') {
            return { isOpen: true, message: TEXT.roomOpen };
        }

        let timeStr = booking.time || "00:00";
        if (timeStr.includes(':')) {
            const [h, m] = timeStr.split(':').map(part => part.trim().padStart(2, '0'));
            timeStr = `${h}:${m}`;
        }

        const bookingDateTime = new Date(`${booking.date}T${timeStr}`);
        const now = new Date();
        const openTime = new Date(bookingDateTime.getTime() - 48 * 60 * 60 * 1000);
        const closeTime = new Date(bookingDateTime.getTime() + 30 * 60 * 1000);

        if (now >= openTime && now <= closeTime) {
            return { isOpen: true, message: TEXT.roomOpen };
        } else if (now < openTime) {
            const diffMs = openTime.getTime() - now.getTime();
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            return { isOpen: false, message: `${TEXT.startsIn} ${diffHrs}h ${diffMins}m` };
        } else {
            return { isOpen: false, message: TEXT.roomClosed };
        }
    };

    // --- ACTIONS ---

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

    const completeSession = async (bookingId: string) => {
        if (!confirm("Are you sure you want to complete this session? This will close the room and delete chat history.")) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/bookings/${bookingId}/complete`, { method: 'POST' });
            if (res.ok) {
                alert("Session completed successfully.");
                setActiveBookingForRoom(null);
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'completed' } : b));
            }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const toggleBlockSlot = (time: string) => {
        const exists = blockedSlots.find(b => b.date === selectedBlockDate && b.time === time);
        if (exists) {
            setBlockedSlots(blockedSlots.filter(b => b.id !== exists.id));
        } else {
            setBlockedSlots([...blockedSlots, { id: crypto.randomUUID(), date: selectedBlockDate, time }]);
        }
    };

    const toggleBlockWholeDay = () => {
        const allBlocked = dailySlotsForBlocking.every(time =>
            blockedSlots.some(b => b.date === selectedBlockDate && b.time === time)
        );
        if (allBlocked) {
            setBlockedSlots(blockedSlots.filter(b => b.date !== selectedBlockDate));
        } else {
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
                body: JSON.stringify({
                    ...bookingForm,
                    userName: profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "User",
                    userEmail: user?.email,
                    userId: profile?._id,
                    serviceId: bookingForm.serviceId
                })
            });
            if (res.ok) {
                alert(TEXT.alertSent);
                setIsBookingModalOpen(false);
                window.location.reload();
            } else {
                const err = await res.json();
                alert(err.message || "Booking failed");
            }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const submitService = async () => {
        if (!profile) return;
        setIsSaving(true);
        const newService: ServiceItem = {
            id: crypto.randomUUID(),
            name: { en: serviceForm.nameEn, mn: serviceForm.nameMn },
            price: Number(serviceForm.price),
            duration: serviceForm.duration,
            status: 'pending'
        };
        const updatedServices = [...(profile.services || []), newService];
        try {
            const res = await fetch(`/api/monks/${profile._id}/service`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ services: updatedServices })
            });
            if (res.ok) {
                setProfile({ ...profile, services: updatedServices });
                setIsServiceModalOpen(false);
            }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const deleteService = async (serviceId: string) => {
        if (!profile || !confirm(TEXT.alertDelete)) return;
        const updatedServices = (profile.services || []).filter(s => s.id !== serviceId);
        try {
            const res = await fetch(`/api/monks/${profile._id}/service`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ services: updatedServices })
            });
            if (res.ok) {
                setProfile({ ...profile, services: updatedServices });
            }
        } catch (e) { console.error(e); }
    };


    const joinVideoCall = async (booking: Booking) => {
        setJoiningRoomId(booking._id);
        try {
            if (isMonk) {
                await fetch(`/api/bookings/${booking._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callStatus: 'active' })
                });
            }

            const username = user?.fullName || user?.firstName || user?.phone || "Anonymous";
            const res = await fetch(`/api/livekit?room=${booking._id}&username=${username}`);
            const data = await res.json();
            setActiveRoomToken(data.token);
            setActiveRoomName(booking._id);
            setActiveBookingForRoom(booking);
        } catch (e) { console.error(e); } finally { setJoiningRoomId(null); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        const data = new FormData();
        data.append("file", file);
        if (uploadPreset) data.append("upload_preset", uploadPreset);

        try {
            if (!cloudName || !uploadPreset) throw new Error("Missing Cloudinary config");
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
            if (!res.ok) throw new Error("Image upload failed");
            const fileData = await res.json();

            setEditForm((prev: any) => ({ ...prev, image: fileData.secure_url, avatar: fileData.secure_url }));
        } catch (error: any) {
            console.error(error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const saveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const isActuallyMonk = profile.role === 'monk';
            const endpoint = isActuallyMonk ? `/api/monks/${profile._id}` : `/api/users/${user?.id}`;

            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                alert(TEXT.alertSaved);
                setProfile({ ...profile, ...editForm });
                setIsEditProfileModalOpen(false);
            } else {
                alert("Failed to update profile.");
            }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    if (!authLoading && !user) return null;
    const isMonk = profile?.role === 'monk';

    if (activeRoomToken && activeRoomName) {
        return <LiveRitualRoom
            token={activeRoomToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
            roomName={activeRoomName}
            bookingId={activeRoomName} 
            isMonk={isMonk}
            onLeave={async () => {
                if (isMonk && activeRoomName) {
                    await fetch(`/api/bookings/${activeRoomName}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ callStatus: 'ended' })
                    });
                }
                setActiveRoomToken(null);
                setActiveRoomName(null);
            }}
        />;
    }

    if (isMonk && profile?.monkStatus === 'pending') {
        return (
            <div className="min-h-screen bg-[#FFFBEB] flex items-center justify-center p-6 font-serif text-[#451a03]">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-[#D97706]/20 text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-[#D97706]">Application Pending</h1>
                    <p className="text-[#78350F]/70 mb-8 leading-relaxed">
                        Namaste, <strong>{profile.name?.[langKey]}</strong>. <br /><br />
                        Your application to join the Sangha is currently under review by the Nirvana Administration. You will receive an email once your profile is approved.
                    </p>
                    <a href="/" className="inline-block px-8 py-3 bg-[#D97706] text-white rounded-xl font-bold hover:bg-[#B45309] transition-colors">
                        Return Home
                    </a>
                </div>
            </div>
        );
    }

    if (isMonk && profile?.monkStatus === 'rejected') {
        return (
            <div className="min-h-screen bg-[#FFFBEB] flex items-center justify-center p-6 font-serif text-[#451a03]">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-red-200 text-center">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ban size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-red-600">Application Update</h1>
                    <p className="text-[#78350F]/70 mb-8 leading-relaxed">
                        Namaste, <strong>{profile.name?.[langKey]}</strong>. <br /><br />
                        Thank you for your interest. Unfortunately, we are unable to approve your application to join the Sangha at this time.
                    </p>
                    <a href="/" className="inline-block px-8 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-black transition-colors">
                        Return Home
                    </a>
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
                                        {user?.avatar ? (
                                            <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                                        ) : user?.firstName ? (
                                            user.firstName[0]
                                        ) : (
                                            user?.phone?.slice(-4) || <UserCircle size={16} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-serif font-bold">
                                    {profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "Seeker"}
                                </h1>
                                <p className="text-[#FDE68A]/80 uppercase tracking-widest mt-2">{isMonk ? profile?.title?.[langKey] : TEXT.clientRole}</p>
                                {isMonk && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-[#FDE68A]/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-[#FDE68A]/30">
                                        <span className="text-xs uppercase tracking-widest opacity-80">{TEXT.earnings}:</span>
                                        <span className="text-xl font-bold text-[#FDE68A]">{profile?.earnings?.toLocaleString() || 0}₮</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {user?.publicMetadata?.role === 'admin' && (
                                <a href="/admin" className="bg-stone-900 text-white px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black shadow-lg flex items-center gap-3 border border-white/10 transition-all">
                                    <ShieldCheck size={18} /> Admin Panel
                                </a>
                            )}

                            <button onClick={() => {
                                setEditForm(profile || {});
                                setIsEditProfileModalOpen(true);
                            }} className="bg-white/10 text-white px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/20 flex items-center gap-3 border border-white/20 backdrop-blur-sm transition-all">
                                <Edit size={18} /> {TEXT.editProfile}
                            </button>

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
                                    <button onClick={saveScheduleSettings} disabled={isSaving} className="flex items-center gap-2 bg-[#D97706] text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-[#B45309]">
                                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {TEXT.updateBtn}
                                    </button>
                                </div>

                                <div className="mb-10">
                                    <h3 className="font-bold text-xs uppercase text-stone-400 tracking-widest mb-4">{TEXT.step1}</h3>
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
                                                        <span className="font-bold text-[#451a03] min-w-[100px]">{DAYS_MN[idx]} ({day.slice(0, 3)})</span>
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

                                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                        <div>
                                            <h3 className="font-bold text-xs uppercase text-stone-400 tracking-widest mb-1">{TEXT.step2}</h3>
                                            <p className="text-xs text-stone-500">{TEXT.step2Desc} <span className="text-red-500 font-bold">{TEXT.busy}</span>.</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="date"
                                                className="p-3 rounded-xl border-2 border-[#D97706]/20 bg-white font-bold text-[#451a03] outline-none focus:border-[#D97706]"
                                                value={selectedBlockDate}
                                                onChange={(e) => setSelectedBlockDate(e.target.value)}
                                            />
                                            {dailySlotsForBlocking.length > 0 && (
                                                <button
                                                    onClick={toggleBlockWholeDay}
                                                    className={`px-4 py-3 rounded-xl text-xs font-bold uppercase transition-colors border ${dailySlotsForBlocking.every(time => blockedSlots.some(b => b.date === selectedBlockDate && b.time === time))
                                                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                        }`}
                                                >
                                                    {dailySlotsForBlocking.every(time => blockedSlots.some(b => b.date === selectedBlockDate && b.time === time)) ? TEXT.unblockDay : TEXT.blockDay}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {dailySlotsForBlocking.length > 0 ? (
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                            {dailySlotsForBlocking.map((time) => {
                                                const isBlocked = blockedSlots.some(b => b.date === selectedBlockDate && b.time === time);
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => toggleBlockSlot(time)}
                                                        className={`py-3 rounded-xl text-xs font-black transition-all border-2 relative
                                                ${isBlocked
                                                                ? 'bg-red-500 text-white border-red-500 shadow-md transform scale-95 opacity-90'
                                                                : 'bg-white text-[#451a03] border-stone-200 hover:border-[#D97706] hover:shadow-lg'
                                                            }`}
                                                    >
                                                        {time}
                                                        {isBlocked ? (
                                                            <Ban size={12} className="absolute top-1 right-1 opacity-50" />
                                                        ) : (
                                                            <CheckCircle size={12} className="absolute top-1 right-1 opacity-20 text-green-500" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 opacity-50 border-2 border-dashed border-stone-200 rounded-xl">
                                            <Ban className="mx-auto mb-2 w-8 h-8 text-stone-400" />
                                            <p className="text-sm font-bold">{TEXT.noHours}</p>
                                            <p className="text-xs">{TEXT.checkAbove}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
                            <h2 className="text-2xl font-serif font-bold text-[#451a03] mb-6 flex items-center gap-3"><History className="text-[#78350F]" /> {isMonk ? TEXT.ritualsClient : TEXT.ritualsMy}</h2>
                            <div className="space-y-4">
                                {bookings.length > 0 ? bookings.map((b) => {
                                    const availability = checkRitualAvailability(b);
                                    return (
                                        <div key={b._id} className="p-4 md:p-5 rounded-2xl border border-stone-100 flex flex-col md:flex-row md:justify-between md:items-center bg-stone-50/50 gap-4 transition-all hover:border-[#D97706]/20">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-[#451a03] text-sm md:text-base">{b.clientName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] md:text-xs text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-100">{b.date} • {b.time}</span>
                                                </div>
                                                <p className="text-[10px] md:text-xs text-[#D97706] font-bold mt-2 flex items-center gap-1">
                                                    <ScrollText size={10} /> {typeof b.serviceName === 'string' ? b.serviceName : b.serviceName?.[langKey]}
                                                </p>
                                            </div>
                                            <div className="flex items-center md:items-end gap-2 shrink-0">
                                                {b.status === 'confirmed' ? (
                                                    <>
                                                        {b.callStatus === 'active' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setActiveBookingForRoom(b);
                                                                    joinVideoCall(b); 
                                                                }}
                                                                className="w-full md:w-auto px-4 py-2.5 bg-green-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:bg-green-700 transition-transform active:scale-95"
                                                            >
                                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                                <Video size={14} /> Join Video Call
                                                            </button>
                                                        ) : availability.isOpen ? (
                                                            <button
                                                                onClick={() => setActiveBookingForRoom(b)}
                                                                className="w-full md:w-auto px-4 py-2.5 bg-[#D97706] text-white rounded-xl text-[10px] md:text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:bg-[#B45309] transition-transform active:scale-95"
                                                            >
                                                                <MessageCircle size={14} /> {TEXT.enterRoom}
                                                            </button>
                                                        ) : (
                                                            <div className="w-full md:w-auto flex items-center justify-end">
                                                                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase bg-stone-100 text-stone-400 border border-stone-200">
                                                                    {availability.message}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : b.status === 'completed' ? (
                                                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase bg-green-50 text-green-600 border border-green-200 flex items-center gap-1">
                                                        <CheckCircle size={12} /> Completed
                                                    </span>
                                                ) : (
                                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${b.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                                                        {b.status === 'pending' ? TEXT.pending : b.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : <p className="text-stone-400 italic text-center py-4">{TEXT.noRituals}</p>}
                            </div>
                        </div>

                        {isMonk && (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-serif font-bold text-[#451a03] flex items-center gap-3"><ScrollText className="text-[#D97706]" /> {TEXT.services}</h2>
                                    <button onClick={() => setIsServiceModalOpen(true)} className="bg-[#D97706] text-white p-2 rounded-full hover:bg-[#B45309]"><Plus size={20} /></button>
                                </div>
                                <div className="space-y-3">
                                    {profile?.services?.map((svc) => (
                                        <div key={svc.id} className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]/30 flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D97706] shadow-sm"><ScrollText size={18} /></div>
                                                <div>
                                                    <h4 className="font-bold text-[#451a03]">{svc.name[langKey]}</h4>
                                                    <p className="text-xs text-stone-500">{svc.price}₮ • {svc.duration}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${svc.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                    {svc.status === 'active' ? TEXT.active : TEXT.pending}
                                                </span>
                                                <button
                                                    onClick={() => deleteService(svc.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title={TEXT.deleteSvc}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#FEF3C7] border border-[#FDE68A] p-8 rounded-[2.5rem]">
                            <Sun className="w-16 h-16 text-[#F59E0B]/30 mb-4" />
                            <h3 className="text-xl font-bold text-[#78350F] mb-2">{TEXT.wisdomTitle}</h3>
                            <p className="italic text-[#78350F]/80 text-sm">"{TEXT.wisdomQuote}"</p>
                        </div>
                    </div>
                </section>

                <AnimatePresence>
                    {activeBookingForRoom && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] p-6 w-full max-w-lg shadow-2xl h-[80vh] flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold font-serif text-[#451a03] flex items-center gap-2">
                                            <Video className="text-[#D97706]" /> Ritual Room
                                        </h3>
                                        <p className="text-xs text-stone-500">{activeBookingForRoom.clientName} • {activeBookingForRoom.date}</p>
                                    </div>
                                    <button onClick={() => setActiveBookingForRoom(null)} className="p-2 hover:bg-stone-100 rounded-full"><X size={20} /></button>
                                </div>

                                <div className="mb-4 space-y-2">
                                    {(isMonk || activeBookingForRoom.callStatus === 'active') && (
                                        <button
                                            onClick={() => joinVideoCall(activeBookingForRoom)}
                                            disabled={joiningRoomId === activeBookingForRoom._id}
                                            className={`w-full py-4 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${activeBookingForRoom.callStatus === 'active' ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-[#05051a] hover:bg-black'}`}
                                        >
                                            {joiningRoomId === activeBookingForRoom._id ? <Loader2 className="animate-spin" /> : <Video size={20} />}
                                            {activeBookingForRoom.callStatus === 'active' ? 'Join Video Call' : TEXT.startVideo}
                                        </button>
                                    )}

                                    {isMonk && (
                                        <button
                                            onClick={() => completeSession(activeBookingForRoom._id)}
                                            disabled={isSaving}
                                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 border border-red-100 transition-all"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Complete Session
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-hidden rounded-xl border border-stone-200">
                                    <ChatWindow
                                        bookingId={activeBookingForRoom._id}
                                        currentUserId={profile?._id || user?.id || "anon"}
                                        currentUserName={profile?.name?.[langKey] || user?.fullName || user?.firstName || user?.phone || "Anonymous"}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isBookingModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold font-serif text-[#451a03]">{TEXT.modalBookTitle}</h3><button onClick={() => setIsBookingModalOpen(false)}><X size={24} /></button></div>
                                <div className="space-y-6">

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-stone-400 mb-2">{TEXT.selectGuide}</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {allMonks.map(m => (
                                                <button key={m._id} onClick={() => setBookingForm({ ...bookingForm, monkId: m._id, serviceId: "", time: "" })} className={`p-3 rounded-xl border text-left transition-all ${bookingForm.monkId === m._id ? 'bg-[#451a03] text-white' : 'bg-stone-50 border-stone-100'}`}><p className="font-bold text-sm">{m.name?.[langKey] || m.phone}</p></button>
                                            ))}
                                        </div>
                                    </div>

                                    {bookingForm.monkId && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-stone-400 mb-2">{TEXT.selectDate}</label>
                                            <input type="date" className="w-full p-3 border rounded-xl" value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value, time: "" })} />
                                        </div>
                                    )}

                                    {bookingForm.date && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {(() => {
                                                const selectedMonk = allMonks.find(m => m._id === bookingForm.monkId);
                                                const dayName = new Date(bookingForm.date).toLocaleDateString('en-US', { weekday: 'long' });
                                                const daySchedule = selectedMonk?.schedule?.find(s => s.day === dayName);
                                                if (!daySchedule || !daySchedule.active) return <p className="col-span-4 text-xs text-center text-red-400">{TEXT.unavailable}</p>;

                                                const slots = [];
                                                let [sH, sM] = daySchedule.start.split(':').map(Number);
                                                let [eH, eM] = daySchedule.end.split(':').map(Number);
                                                let curr = new Date(); curr.setHours(sH, sM, 0);
                                                const end = new Date(); end.setHours(eH, eM, 0);

                                                while (curr < end) {
                                                    const timeStr = curr.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                                    const isBlocked = selectedMonk?.blockedSlots?.some(b => b.date === bookingForm.date && b.time === timeStr);

                                                    slots.push(
                                                        <button
                                                            key={timeStr}
                                                            disabled={isBlocked}
                                                            onClick={() => setBookingForm({ ...bookingForm, time: timeStr })}
                                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${isBlocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : bookingForm.time === timeStr ? 'bg-[#05051a] text-white' : 'bg-white border-stone-200'}`}
                                                        >
                                                            {timeStr}
                                                        </button>
                                                    );
                                                    curr.setMinutes(curr.getMinutes() + 60);
                                                }
                                                return slots;
                                            })()}
                                        </div>
                                    )}

                                    {bookingForm.time && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-stone-400 mb-2">{TEXT.selectService}</label>
                                            <div className="space-y-2">
                                                {allMonks.find(m => m._id === bookingForm.monkId)?.services?.filter(s => s.status !== 'rejected').map(s => (
                                                    <button key={s.id} onClick={() => setBookingForm({ ...bookingForm, serviceId: s.id })} className={`w-full p-3 rounded-xl border flex justify-between items-center transition-all ${bookingForm.serviceId === s.id ? 'bg-[#FDE68A] border-[#D97706] text-[#451a03]' : 'bg-white border-stone-200'}`}><span className="font-bold text-sm">{s.name[langKey]}</span><span className="text-xs">{s.price}₮</span></button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={submitBooking} disabled={isSaving || !bookingForm.serviceId} className="w-full py-4 bg-[#D97706] text-white rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50">
                                        {isSaving ? <Loader2 className="animate-spin mx-auto" /> : TEXT.confirmBook}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isServiceModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 w-full max-w-md">
                                <h3 className="text-xl font-bold mb-4 text-[#451a03]">{TEXT.modalSvcTitle}</h3>
                                <div className="space-y-3 mb-6">
                                    <input className="w-full p-3 border rounded-xl" placeholder="Name (EN)" value={serviceForm.nameEn} onChange={e => setServiceForm({ ...serviceForm, nameEn: e.target.value })} />
                                    <input className="w-full p-3 border rounded-xl" placeholder="Нэр (MN)" value={serviceForm.nameMn} onChange={e => setServiceForm({ ...serviceForm, nameMn: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input type="number" className="w-full p-3 border rounded-xl" placeholder="Price" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} />
                                        <input className="w-full p-3 border rounded-xl" placeholder="Duration" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsServiceModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-stone-500">{TEXT.cancel}</button>
                                    <button onClick={submitService} className="flex-1 py-3 bg-[#D97706] text-white rounded-xl font-bold flex items-center justify-center gap-2">
                                        {isSaving ? <Loader2 className="animate-spin" /> : TEXT.submitReview}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isEditProfileModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl h-[85vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold font-serif text-[#451a03] flex items-center gap-2">
                                        <Edit size={24} className="text-[#D97706]" /> {TEXT.modalProfileTitle}
                                    </h3>
                                    <button onClick={() => setIsEditProfileModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X size={24} /></button>
                                </div>

                                <div className="space-y-6">

                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#FDE68A] shadow-lg group">
                                            <img
                                                src={editForm.image || editForm.avatar || user?.avatar}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                                {uploadingImage ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                            </label>
                                        </div>
                                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{TEXT.labelImage}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {isMonk ? (
                                            <>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelNameMN}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.name?.mn || ""} onChange={e => setEditForm({ ...editForm, name: { ...editForm.name, mn: e.target.value } })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelNameEN}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.name?.en || ""} onChange={e => setEditForm({ ...editForm, name: { ...editForm.name, en: e.target.value } })} />
                                                </div>
                                                <div className="col-span-1 md:col-span-2 space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelPhone}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-1 col-span-2">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{language === 'mn' ? TEXT.labelNameMN : TEXT.labelNameEN}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.firstName || editForm.name?.mn || editForm.name?.en || ""}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setEditForm({ ...editForm, firstName: val, name: { mn: val, en: val } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelPhone}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                                </div>
                                            </>
                                        )}

                                        {isMonk && (
                                            <>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelTitleMN}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.title?.mn || ""} onChange={e => setEditForm({ ...editForm, title: { ...editForm.title, mn: e.target.value } })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelTitleEN}</label>
                                                    <input className="w-full p-3 border rounded-xl" value={editForm.title?.en || ""} onChange={e => setEditForm({ ...editForm, title: { ...editForm.title, en: e.target.value } })} />
                                                </div>

                                                <div className="col-span-1 md:col-span-2 space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelBioMN}</label>
                                                    <textarea rows={3} className="w-full p-3 border rounded-xl" value={editForm.bio?.mn || ""} onChange={e => setEditForm({ ...editForm, bio: { ...editForm.bio, mn: e.target.value } })} />
                                                </div>
                                                <div className="col-span-1 md:col-span-2 space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelBioEN}</label>
                                                    <textarea rows={3} className="w-full p-3 border rounded-xl" value={editForm.bio?.en || ""} onChange={e => setEditForm({ ...editForm, bio: { ...editForm.bio, en: e.target.value } })} />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelExp}</label>
                                                    <input type="number" className="w-full p-3 border rounded-xl" value={editForm.yearsOfExperience || 0} onChange={e => setEditForm({ ...editForm, yearsOfExperience: Number(e.target.value) })} />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-[#D97706]">{TEXT.labelSpecialties}</label>
                                                    <input
                                                        className="w-full p-3 border rounded-xl"
                                                        value={editForm.specialties?.join(", ") || ""}
                                                        onChange={e => setEditForm({ ...editForm, specialties: e.target.value.split(",").map((s: string) => s.trim()) })}
                                                        placeholder={TEXT.labelSpecialties}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={saveProfile}
                                        disabled={isSaving || uploadingImage}
                                        className="w-full py-4 bg-[#D97706] text-white rounded-2xl font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#B45309] transition-all"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} {TEXT.saveProfile}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>
        </>
    );
}
