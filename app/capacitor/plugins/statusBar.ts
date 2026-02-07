"use client";

import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/**
 * Status bar configuration for native apps.
 * Ensures proper styling for iOS and Android status bars.
 */

const isNative = Capacitor.isNativePlatform();

/**
 * Initialize status bar with app theme
 */
export async function initializeStatusBar(isDark: boolean = false): Promise<void> {
    if (!isNative) return;

    try {
        // Set status bar style based on theme
        await StatusBar.setStyle({
            style: isDark ? Style.Dark : Style.Light,
        });

        // iOS: Make status bar content dark/light
        // Android: Set background color
        if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({
                color: isDark ? '#000000' : '#ffffff',
            });
        }

        // Show status bar (some apps hide it)
        await StatusBar.show();
    } catch (error) {
        console.warn('Status bar configuration failed:', error);
    }
}

/**
 * Set status bar to light style (dark content)
 * Use with light backgrounds
 */
export async function setStatusBarLight(): Promise<void> {
    if (!isNative) return;

    try {
        await StatusBar.setStyle({ style: Style.Light });

        if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
    } catch (error) {
        console.warn('Failed to set light status bar:', error);
    }
}

/**
 * Set status bar to dark style (light content)
 * Use with dark backgrounds
 */
export async function setStatusBarDark(): Promise<void> {
    if (!isNative) return;

    try {
        await StatusBar.setStyle({ style: Style.Dark });

        if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#000000' });
        }
    } catch (error) {
        console.warn('Failed to set dark status bar:', error);
    }
}

/**
 * Hide status bar (for immersive experiences)
 */
export async function hideStatusBar(): Promise<void> {
    if (!isNative) return;

    try {
        await StatusBar.hide();
    } catch (error) {
        console.warn('Failed to hide status bar:', error);
    }
}

/**
 * Show status bar
 */
export async function showStatusBar(): Promise<void> {
    if (!isNative) return;

    try {
        await StatusBar.show();
    } catch (error) {
        console.warn('Failed to show status bar:', error);
    }
}

/**
 * Set custom status bar color (Android only)
 * @param color - Hex color string (e.g., '#ff0000')
 */
export async function setStatusBarColor(color: string): Promise<void> {
    if (!isNative || Capacitor.getPlatform() !== 'android') return;

    try {
        await StatusBar.setBackgroundColor({ color });
    } catch (error) {
        console.warn('Failed to set status bar color:', error);
    }
}

/**
 * Toggle status bar overlay mode (iOS)
 * @param overlay - If true, content extends under status bar
 */
export async function setStatusBarOverlay(overlay: boolean): Promise<void> {
    if (!isNative) return;

    try {
        await StatusBar.setOverlaysWebView({ overlay });
    } catch (error) {
        console.warn('Failed to set status bar overlay:', error);
    }
}
