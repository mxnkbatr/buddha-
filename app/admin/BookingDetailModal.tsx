import React from 'react';
import { X, User, Calendar, Phone, Mail, Clock } from 'lucide-react';

interface BookingDetailModalProps {
    isOpen: boolean;
    booking: any;
    user: any; // The user object associated with the booking
    onClose: () => void;
    onAction: (id: string, action: 'confirmed' | 'rejected') => void;
}

export default function BookingDetailModal({ isOpen, booking, user, onClose, onAction }: BookingDetailModalProps) {
    if (!isOpen || !booking) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0C164F] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-stone-100 dark:border-white/10 flex justify-between items-center bg-stone-50 dark:bg-white/5">
                    <h3 className="text-xl font-bold font-serif">Захиалгын дэлгэрэнгүй</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* User Details Section */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3 block">Захиалагчийн мэдээлэл</h4>
                        <div className="bg-stone-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold opacity-60">
                                        {user ? (user.lastName && user.firstName ? `${user.lastName} ${user.firstName}` : user.name?.mn || user.name?.en || "Нэр тодорхойгүй") : booking.clientName}
                                    </p>
                                    <p className="text-xs opacity-40">
                                        Төрсөн огноо: {user?.dateOfBirth || "Бүртгэлгүй"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <div className="p-2 bg-white dark:bg-black/20 rounded-xl flex items-center gap-2">
                                    <Phone size={14} className="opacity-40" />
                                    <span className="text-xs font-bold">{user?.phone || booking.userPhone || "-"}</span>
                                </div>
                                <div className="p-2 bg-white dark:bg-black/20 rounded-xl flex items-center gap-2">
                                    <Mail size={14} className="opacity-40" />
                                    <span className="text-xs font-bold truncate">{user?.email || booking.clientEmail || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details Section */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3 block">Үйлчилгээний мэдээлэл</h4>
                        <div className="bg-stone-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h5 className="font-bold text-lg">{typeof booking.serviceName === 'object' ? (booking.serviceName.mn || booking.serviceName.en) : booking.serviceName}</h5>
                                    <p className="text-sm opacity-60">{booking.price?.toLocaleString()}₮</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-stone-100 text-stone-500'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium pt-2 border-t border-stone-200 dark:border-white/10">
                                <Clock size={16} className="text-amber-500" />
                                <span>{new Date(booking.date).toLocaleDateString()} • {booking.time}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-stone-100 dark:border-white/10 bg-stone-50 dark:bg-white/5 flex gap-3">
                    {booking.status === 'pending' ? (
                        <>
                            <button
                                onClick={() => { onAction(booking._id, 'confirmed'); onClose(); }}
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-sm uppercase hover:bg-green-600 transition-all"
                            >
                                Баталгаажуулах
                            </button>
                            <button
                                onClick={() => { onAction(booking._id, 'rejected'); onClose(); }}
                                className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm uppercase hover:bg-red-200 transition-all"
                            >
                                Цуцлах
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-white rounded-xl font-bold text-sm uppercase hover:opacity-80 transition-all"
                        >
                            Хаах
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
