"use client";

import { useEffect } from 'react';
import { usePlatform } from '@/app/capacitor/hooks/usePlatform';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Initialize Capacitor plugins and platform-specific behavior.
 * This component should be placed in the root layout.
 */
export default function CapacitorInit() {
    const { isNative } = usePlatform();

    useEffect(() => {
        if (!isNative) return;

        const initialize = async () => {
            try {
                // StatusBar: style LIGHT, overlaysWebView: true, backgroundColor transparent
                await StatusBar.setOverlaysWebView({ overlay: true });
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#00000000' });
            } catch (e) {
                console.warn('StatusBar initialization failed:', e);
            }

            // Note: Native SplashScreen hiding is now managed by SplashScreen.tsx 
            // internally. We removed it here to coordinate with the Web splash.

            // Handle back button on Android
            App.addListener('backButton', ({ canGoBack }) => {
                if (!canGoBack) {
                    App.exitApp();
                } else {
                    window.history.back();
                }
            });

            // Handle app state changes (token refresh when foregrounded)
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    console.log('App is foregrounded - triggering token refresh logic');
                    // Add actual token refresh logic here via AuthContext if needed
                }
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
