"use client";

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type Platform = 'ios' | 'android' | 'web';

export interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface PlatformInfo {
    platform: Platform;
    isNative: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isWeb: boolean;
    safeArea: SafeAreaInsets;
}

/**
 * Hook to detect the current platform and provide platform-specific values.
 * Essential for creating native-feeling UI that respects platform conventions.
 * 
 * @returns PlatformInfo object with platform detection and safe area insets
 * 
 * @example
 * ```tsx
 * const { platform, isNative, safeArea } = usePlatform();
 * 
 * return (
 *   <div style={{ paddingTop: safeArea.top }}>
 *     {isIOS ? <IOSComponent /> : <AndroidComponent />}
 *   </div>
 * );
 * ```
 */
export function usePlatform(): PlatformInfo {
    const [platform, setPlatform] = useState<Platform>('web');
    const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });

    useEffect(() => {
        const detectedPlatform = Capacitor.getPlatform() as Platform;
        setPlatform(detectedPlatform);

        // Set safe area insets based on platform
        // iOS has notch/Dynamic Island, Android has status bar
        const insets: SafeAreaInsets = {
            top: detectedPlatform === 'ios' ? 44 : detectedPlatform === 'android' ? 24 : 0,
            bottom: detectedPlatform === 'ios' ? 34 : 0, // iOS home indicator
            left: 0,
            right: 0,
        };

        // On native, try to get actual safe area values
        if (detectedPlatform !== 'web') {
            try {
                // Try to read CSS env() variables for safe area
                const style = getComputedStyle(document.documentElement);
                const topSafe = style.getPropertyValue('--sat') || style.getPropertyValue('env(safe-area-inset-top)');
                const bottomSafe = style.getPropertyValue('--sab') || style.getPropertyValue('env(safe-area-inset-bottom)');

                if (topSafe) insets.top = parseInt(topSafe) || insets.top;
                if (bottomSafe) insets.bottom = parseInt(bottomSafe) || insets.bottom;
            } catch (e) {
                // Fallback to defaults
                console.warn('Could not read safe area insets, using defaults');
            }
        }

        setSafeArea(insets);
    }, []);

    return {
        platform,
        isNative: platform !== 'web',
        isIOS: platform === 'ios',
        isAndroid: platform === 'android',
        isWeb: platform === 'web',
        safeArea,
    };
}

/**
 * Get platform-specific value
 * @param ios - Value for iOS
 * @param android - Value for Android
 * @param web - Value for web (optional, defaults to android value)
 */
export function platformSelect<T>(ios: T, android: T, web?: T): T {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return ios;
    if (platform === 'android') return android;
    return web !== undefined ? web : android;
}
