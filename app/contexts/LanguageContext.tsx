// contexts/LanguageContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "mn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T>(translations: { mn: T; en: T }) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLocale }: { children: ReactNode; initialLocale?: Language }) => {
  const language: Language = "mn";
  const setLanguage = (lang: Language) => {}; // No-op to prevent language switching

  const t = <T,>(translations: { mn: T; en: T; }): T => {
    return translations.mn || translations.en; // Force Mongolian, fallback to EN if missing
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};