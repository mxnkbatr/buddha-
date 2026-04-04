"use client";

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Offline storage layer using Capacitor Preferences.
 * Falls back to localStorage on web.
 * 
 * Use for caching data that should persist across app launches.
 * NOT for sensitive data (use secureStorage.ts instead).
 */

export interface CacheOptions {
    /** Time-to-live in seconds */
    ttl?: number;
}

interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl?: number;
}

/**
 * Save data to offline storage
 */
export async function setItem<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cachedData: CachedData<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: options?.ttl,
    };

    const jsonValue = JSON.stringify(cachedData);

    if (isNative) {
        await Preferences.set({ key, value: jsonValue });
    } else {
        localStorage.setItem(key, jsonValue);
    }
}

/**
 * Get data from offline storage
 * Returns null if not found or expired
 */
export async function getItem<T>(key: string): Promise<T | null> {
    let jsonValue: string | null;

    if (isNative) {
        const result = await Preferences.get({ key });
        jsonValue = result.value;
    } else {
        jsonValue = localStorage.getItem(key);
    }

    if (!jsonValue) return null;

    try {
        const cachedData: CachedData<T> = JSON.parse(jsonValue);

        // Check if expired
        if (cachedData.ttl) {
            const age = (Date.now() - cachedData.timestamp) / 1000; // seconds
            if (age > cachedData.ttl) {
                await removeItem(key);
                return null;
            }
        }

        return cachedData.data;
    } catch (error) {
        console.error('Failed to parse cached data:', error);
        return null;
    }
}

/**
 * Remove item from offline storage
 */
export async function removeItem(key: string): Promise<void> {
    if (isNative) {
        await Preferences.remove({ key });
    } else {
        localStorage.removeItem(key);
    }
}

/**
 * Clear all offline storage
 */
export async function clearAll(): Promise<void> {
    if (isNative) {
        await Preferences.clear();
    } else {
        localStorage.clear();
    }
}

/**
 * Get all keys
 */
export async function getAllKeys(): Promise<string[]> {
    if (isNative) {
        const result = await Preferences.keys();
        return result.keys;
    } else {
        return Object.keys(localStorage);
    }
}

// Specific cache keys for the app
export const CACHE_KEYS = {
    MONKS_LIST: 'cache_monks_list',
    TOURS_LIST: 'cache_tours_list',
    USER_PROFILE: 'cache_user_profile',
    BOOKINGS: 'cache_bookings',
    SETTINGS: 'cache_settings',
    NOTIFICATIONS: 'cache_notifications',
} as const;

/**
 * Cache monks data
 */
export async function cacheMonks(monks: any[]): Promise<void> {
    await setItem(CACHE_KEYS.MONKS_LIST, monks, { ttl: 900 }); // 15 minutes
}

/**
 * Get cached monks data
 */
export async function getCachedMonks(): Promise<any[] | null> {
    return await getItem<any[]>(CACHE_KEYS.MONKS_LIST);
}

/**
 * Cache tours data
 */
export async function cacheTours(tours: any[]): Promise<void> {
    await setItem(CACHE_KEYS.TOURS_LIST, tours, { ttl: 1800 }); // 30 minutes
}

/**
 * Get cached tours data
 */
export async function getCachedTours(): Promise<any[] | null> {
    return await getItem<any[]>(CACHE_KEYS.TOURS_LIST);
}

/**
 * Cache user bookings
 */
export async function cacheBookings(bookings: any[]): Promise<void> {
    await setItem(CACHE_KEYS.BOOKINGS, bookings, { ttl: 300 }); // 5 minutes
}

/**
 * Get cached bookings
 */
export async function getCachedBookings(): Promise<any[] | null> {
    return await getItem<any[]>(CACHE_KEYS.BOOKINGS);
}
