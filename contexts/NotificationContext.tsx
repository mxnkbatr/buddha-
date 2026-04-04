"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import type { Notification as DBNotification, Booking } from "@/database/types";
import { fetchWithFallback } from "@/lib/fetchWithFallback";
import { CACHE_KEYS } from "@/app/capacitor/storage/offlineStorage";

interface NotificationContextType {
  notifications: DBNotification[];
  unreadCount: number;
  markAsRead: (id?: string, all?: boolean) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  refreshNotifications: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const trackedBookings = useRef<Set<string>>(new Set());

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchWithFallback<{ notifications: DBNotification[] }>(
        "/api/user/notifications",
        CACHE_KEYS.NOTIFICATIONS,
        60 // 1 minute TTL for notifications
      );
      if (data?.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: DBNotification) => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id?: string, all?: boolean) => {
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, all }),
      });
      if (res.ok) {
        if (all) {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          setUnreadCount(0);
        } else if (id) {
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  // --- REMINDER LOGIC (T-5 and T-0) ---
  const checkUpcomingBookings = async () => {
    if (!user?.id) return;
    try {
      // Use fallback to avoid "Failed to fetch" on mobile network drops
      const bookings = await fetchWithFallback<Booking[]>(
        `/api/bookings?userId=${user.id}`,
        `${CACHE_KEYS.BOOKINGS}_${user.id}`,
        300 // 5 minutes TTL
      );
      
      if (!bookings || !Array.isArray(bookings)) return;
      
      const confirmed = bookings.filter(b => b.status === "confirmed");
      const now = new Date();
      
      confirmed.forEach(booking => {
        if (!booking.date || !booking.time) return;
        
        const [h, m] = booking.time.split(':').map(Number);
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(h, m, 0, 0);

        const diffSeconds = Math.floor((bookingDate.getTime() - now.getTime()) / 1000);
        const bookingIdStr = booking._id?.toString() || "";

        // T-5 Reminder (300 seconds)
        if (diffSeconds <= 300 && diffSeconds > 240 && !trackedBookings.current.has(`${bookingIdStr}-t5`)) {
          trackedBookings.current.add(`${bookingIdStr}-t5`);
          triggerReminder(booking, "t5");
        }

        // T-0 Start (0 seconds)
        if (diffSeconds <= 0 && diffSeconds > -60 && !trackedBookings.current.has(`${bookingIdStr}-t0`)) {
          trackedBookings.current.add(`${bookingIdStr}-t0`);
          triggerReminder(booking, "t0");
        }
      });
    } catch (err) {
      // Errors are handled by fetchWithFallback (swallowed if cache exists, or generic error)
      console.warn("Reminder check skipped due to network/cache issue:", err.message);
    }
  };

  const triggerReminder = (booking: Booking, type: "t5" | "t0") => {
    const title = type === "t5" 
      ? { mn: "Уулзалт эхлэхэд 5 минут үлдлээ", en: "Appointment starts in 5 minutes" }
      : { mn: "Уулзалт эхэллээ", en: "Appointment Starting Now" };
    
    const message = type === "t5"
      ? { mn: "Таны захиалсан засал 5 минутын дараа эхэлнэ. Бэлтгэлтэй байна уу.", en: "Your session starts in 5 minutes. Please be ready." }
      : { mn: "Уулзалт эхэллээ. Өрөөнд нэвтэрч ороорой.", en: "Your session is starting now. Please enter the room." };

    // 1. Add to local notifications
    const newNotif: DBNotification = {
      _id: `temp-${Date.now()}`,
      userId: user.id,
      title,
      message,
      type: "reminder",
      read: false,
      link: "/profile",
      createdAt: new Date()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);

    // 2. Browser alert if active
    if (Notification.permission === "granted") {
      new window.Notification(title.en, { body: message.en });
    } else {
      alert(title.mn);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      const reminderInterval = setInterval(checkUpcomingBookings, 30000); // Check reminders every 30s
      
      // Request notification permission
      if (typeof window !== 'undefined' && "Notification" in window) {
        window.Notification.requestPermission();
      }

      return () => {
        clearInterval(interval);
        clearInterval(reminderInterval);
      };
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refreshNotifications: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
