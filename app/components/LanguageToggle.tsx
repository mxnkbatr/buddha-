"use client";

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageToggle() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang = language === "mn" ? "en" : "mn";
    const segments = pathname.split('/');
    // Check if the path actually has the locale
    if (segments.length > 1 && (segments[1] === 'mn' || segments[1] === 'en')) {
      segments[1] = newLang;
      const newPath = segments.join('/');
      router.push(newPath);
    } else {
      // Fallback or if locale is missing from path (should be handled by middleware, but safe to check)
      router.push(`/${newLang}${pathname}`);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
      aria-label="Toggle Language"
    >
      <Globe size={18} />
      <span className="text-sm font-bold uppercase">{language}</span>
    </button>
  );
}