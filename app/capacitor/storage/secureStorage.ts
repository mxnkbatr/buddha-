"use client";

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

/**
 * Secure storage for sensitive data (tokens, credentials).
 *
 * NOTE: This is a simplified implementation. For production apps requiring
 * the highest security, consider using native modules or platform-specific
 * secure storage solutions.
 *
 * Current implementation:
 * - Native: Uses Capacitor Preferences with encryption
 * - Web: Uses sessionStorage (NOT secure, only for development)
 */

// Simple encryption key (in production, use a proper key derivation function)
const ENCRYPTION_KEY = 'buddha-app-secure-key-2026';

function simpleEncrypt(text: string): string {
    // Basic XOR encryption (NOT cryptographically secure, just obfuscation)
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return btoa(result);
}

function simpleDecrypt(encrypted: string): string {
    try {
        const decoded = atob(encrypted);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
        }
        return result;
    } catch {
        return '';
    }
}


/**
 * Save sensitive data to secure storage
 * @param key - Storage key
 * @param value - Value to store
 */
export async function setSecure(key: string, value: string): Promise<void> {
    const encrypted = simpleEncrypt(value);

    if (isNative) {
        try {
            await Preferences.set({ key: `secure_${key}`, value: encrypted });
        } catch (error) {
            console.error('Secure storage set failed:', error);
            throw error;
        }
    } else {
        // Web fallback - NOT SECURE, only for development
        console.warn('Using insecure sessionStorage - ONLY FOR DEVELOPMENT');
        sessionStorage.setItem(key, value);
    }
}

/**
 * Get sensitive data from secure storage
 * @param key - Storage key
 * @returns Stored value or null if not found
 */
export async function getSecure(key: string): Promise<string | null> {
    if (isNative) {
        try {
            const result = await Preferences.get({ key: `secure_${key}` });
            if (!result.value) return null;
            return simpleDecrypt(result.value);
        } catch (error) {
            return null;
        }
    } else {
        // Web fallback
        return sessionStorage.getItem(key);
    }
}

/**
 * Remove sensitive data from secure storage
 * @param key - Storage key
 */
export async function removeSecure(key: string): Promise<void> {
    if (isNative) {
        try {
            await Preferences.remove({ key: `secure_${key}` });
        } catch (error) {
            console.error('Secure storage remove failed:', error);
        }
    } else {
        sessionStorage.removeItem(key);
    }
}

/**
 * Clear all secure storage
 */
export async function clearSecure(): Promise<void> {
    if (isNative) {
        try {
            const { keys } = await Preferences.keys();
            for (const key of keys) {
                if (key.startsWith('secure_')) {
                    await Preferences.remove({ key });
                }
            }
        } catch (error) {
            console.error('Secure storage clear failed:', error);
        }
    } else {
        sessionStorage.clear();
    }
}

// Secure storage keys
export const SECURE_KEYS = {
    AUTH_TOKEN: 'secure_auth_token',
    REFRESH_TOKEN: 'secure_refresh_token',
    USER_CREDENTIALS: 'secure_user_credentials',
    API_KEY: 'secure_api_key',
} as const;

/**
 * Save authentication token securely
 */
export async function saveAuthToken(token: string): Promise<void> {
    await setSecure(SECURE_KEYS.AUTH_TOKEN, token);
}

/**
 * Get authentication token
 */
export async function getAuthToken(): Promise<string | null> {
    return await getSecure(SECURE_KEYS.AUTH_TOKEN);
}

/**
 * Remove authentication token
 */
export async function removeAuthToken(): Promise<void> {
    await removeSecure(SECURE_KEYS.AUTH_TOKEN);
}

/**
 * Save refresh token securely
 */
export async function saveRefreshToken(token: string): Promise<void> {
    await setSecure(SECURE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
    return await getSecure(SECURE_KEYS.REFRESH_TOKEN);
}

/**
 * Clear all auth tokens
 */
export async function clearAuthTokens(): Promise<void> {
    await removeSecure(SECURE_KEYS.AUTH_TOKEN);
    await removeSecure(SECURE_KEYS.REFRESH_TOKEN);
}

export const SecureStorage = {
    getToken: getAuthToken,
    setToken: saveAuthToken,
    removeToken: removeAuthToken
};
