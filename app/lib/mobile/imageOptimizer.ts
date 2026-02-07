/**
 * Mobile Image Optimization Utilities
 * Handles image loading, caching, and optimization for mobile apps
 */

import { Capacitor } from '@capacitor/core';

interface ImageCache {
    [url: string]: string; // Base64 or blob URL
}

class MobileImageOptimizer {
    private cache: ImageCache = {};
    private loading: Set<string> = new Set();
    private isNative = Capacitor.isNativePlatform();

    /**
     * Load and cache image for mobile
     * @param url Image URL
     * @param quality Quality for compression (0-1)
     */
    async loadImage(url: string, quality: number = 0.8): Promise<string> {
        // Return cached version if available
        if (this.cache[url]) {
            return this.cache[url];
        }

        // Prevent duplicate loading
        if (this.loading.has(url)) {
            return this.waitForLoad(url);
        }

        this.loading.add(url);

        try {
            if (this.isNative) {
                // For native apps, fetch and cache as blob
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                this.cache[url] = blobUrl;
                return blobUrl;
            } else {
                // For web, just return the URL (browser handles caching)
                this.cache[url] = url;
                return url;
            }
        } catch (error) {
            console.error('Image load failed:', url, error);
            return url; // Fallback to original URL
        } finally {
            this.loading.delete(url);
        }
    }

    /**
     * Wait for an image to finish loading
     */
    private async waitForLoad(url: string): Promise<string> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.cache[url]) {
                    clearInterval(checkInterval);
                    resolve(this.cache[url]);
                }
                if (!this.loading.has(url)) {
                    clearInterval(checkInterval);
                    resolve(url); // Return original if failed
                }
            }, 100);
        });
    }

    /**
     * Preload images for better UX
     */
    async preloadImages(urls: string[]): Promise<void> {
        const promises = urls.map(url => this.loadImage(url));
        await Promise.all(promises);
    }

    /**
     * Clear image cache (call on memory warning)
     */
    clearCache(): void {
        // Revoke blob URLs to free memory
        Object.values(this.cache).forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        this.cache = {};
    }

    /**
     * Get cache size estimate
     */
    getCacheSize(): number {
        return Object.keys(this.cache).length;
    }
}

// Singleton instance
export const imageOptimizer = new MobileImageOptimizer();

/**
 * React Hook for optimized image loading
 */
export function useOptimizedImage(url: string | undefined): string {
    const [optimizedUrl, setOptimizedUrl] = React.useState<string>(url || '');

    React.useEffect(() => {
        if (!url) return;

        imageOptimizer.loadImage(url).then(setOptimizedUrl);
    }, [url]);

    return optimizedUrl;
}

// For React imports
import React from 'react';
