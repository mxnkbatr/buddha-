"use client";

import { useEffect, useState } from "react";
import { WifiOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * Global component that detects and displays an offline status banner.
 * Uses window online/offline events for real-time feedback.
 */
export default function OfflineBanner() {
    const { t } = useLanguage();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] overflow-hidden pointer-events-none"
                    style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
                >
                    <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-2 shadow-2xl backdrop-blur-xl">
                        <WifiOff size={16} className="animate-pulse" />
                        <span className="text-[12px] font-black tracking-wide uppercase">
                            {t({ 
                                mn: "📶 Сүлжээгүй горим — Кэш ашиглаж байна", 
                                en: "📶 Offline Mode — Using Cached Data" 
                            })}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
