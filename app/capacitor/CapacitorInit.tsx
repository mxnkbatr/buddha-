"use client";

import { useEffect } from 'react';
import { usePlatform } from '@/app/capacitor/hooks/usePlatform';
import { initializeStatusBar } from '@/app/capacitor/plugins/statusBar';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Initialize Capacitor plugins and platform-specific behavior.
 * This component should be placed in the root layout.
 */
export default function CapacitorInit() {
    const { isNative } = usePlatform();

    useEffect(() => {
        if (!isNative) return;

        const initialize = async () => {
            // Initialize status bar
            await initializeStatusBar(false); // false = light theme

            // Hide splash screen after initialization
            await SplashScreen.hide();

            // Handle back button on Android
            App.addListener('backButton', ({ canGoBack }) => {
                if (!canGoBack) {
                    App.exitApp();
                } else {
                    window.history.back();
                }
            });

            // Handle app state changes
            App.addListener('appStateChange', ({ isActive }) => {
                console.log('App state changed. isActive:', isActive);
                // You can add logic here for when app goes to background/foreground
            });

            // Add CSS variables for safe area insets
            const addSafeAreaCSS = () => {
                const style = document.createElement('style');
                style.textContent = `
          :root {
            --sat: env(safe-area-inset-top, 0px);
            --sab: env(safe-area-inset-bottom, 0px);
            --sal: env(safe-area-inset-left, 0px);
            --sar: env(safe-area-inset-right, 0px);
          }
        `;
                document.head.appendChild(style);
            };

            addSafeAreaCSS();
        };

        initialize();

        // Cleanup
        return () => {
            if (isNative) {
                App.removeAllListeners();
            }
        };
    }, [isNative]);

    return null; // This component doesn't render anything
}
