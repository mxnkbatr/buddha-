"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
    elderMode: boolean;
    toggleElderMode: () => void;
    fontSize: 'normal' | 'large' | 'xlarge';
    setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
    highContrast: boolean;
    toggleHighContrast: () => void;
    reduceMotion: boolean;
    toggleReduceMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [elderMode, setElderMode] = useState(false);
    const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
    const [highContrast, setHighContrast] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    // Load preferences from localStorage
    useEffect(() => {
        const savedElderMode = localStorage.getItem('elderMode') === 'true';
        const savedFontSize = (localStorage.getItem('fontSize') || 'normal') as 'normal' | 'large' | 'xlarge';
        const savedHighContrast = localStorage.getItem('highContrast') === 'true';
        const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';

        setElderMode(savedElderMode);
        setFontSize(savedFontSize);
        setHighContrast(savedHighContrast);
        setReduceMotion(savedReduceMotion);

        // Apply classes to body
        updateBodyClasses(savedElderMode, savedFontSize, savedHighContrast, savedReduceMotion);
    }, []);

    const updateBodyClasses = (
        elder: boolean,
        size: string,
        contrast: boolean,
        motion: boolean
    ) => {
        if (typeof document === 'undefined') return;

        document.body.classList.toggle('elder-mode', elder);
        document.body.classList.toggle('font-large', size === 'large');
        document.body.classList.toggle('font-xlarge', size === 'xlarge');
        document.body.classList.toggle('high-contrast', contrast);
        document.body.classList.toggle('reduce-motion', motion);
    };

    const toggleElderMode = () => {
        const newValue = !elderMode;
        setElderMode(newValue);
        localStorage.setItem('elderMode', String(newValue));
        updateBodyClasses(newValue, fontSize, highContrast, reduceMotion);
    };

    const handleSetFontSize = (size: 'normal' | 'large' | 'xlarge') => {
        setFontSize(size);
        localStorage.setItem('fontSize', size);
        updateBodyClasses(elderMode, size, highContrast, reduceMotion);
    };

    const toggleHighContrast = () => {
        const newValue = !highContrast;
        setHighContrast(newValue);
        localStorage.setItem('highContrast', String(newValue));
        updateBodyClasses(elderMode, fontSize, newValue, reduceMotion);
    };

    const toggleReduceMotion = () => {
        const newValue = !reduceMotion;
        setReduceMotion(newValue);
        localStorage.setItem('reduceMotion', String(newValue));
        updateBodyClasses(elderMode, fontSize, highContrast, newValue);
    };

    return (
        <AccessibilityContext.Provider
            value={{
                elderMode,
                toggleElderMode,
                fontSize,
                setFontSize: handleSetFontSize,
                highContrast,
                toggleHighContrast,
                reduceMotion,
                toggleReduceMotion,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}
