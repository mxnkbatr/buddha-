import { getItem, setItem } from "@/app/capacitor/storage/offlineStorage";

/**
 * Enhanced fetch utility that handles offline caching and fallbacks.
 * 
 * 1. Tries to fetch fresh data from the network.
 * 2. If successful, updates the persistent cache with defined TTL.
 * 3. If the network fails, attempts to retrieve the latest valid data from cache.
 * 4. Returns the found data or throws an error if neither are available.
 */
export async function fetchWithFallback<T>(
    url: string,
    cacheKey: string,
    ttl: number = 300, // Default 5 minutes
    options: RequestInit = {}
): Promise<T> {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Background cache update
        await setItem(cacheKey, data, { ttl });
        
        return data;
    } catch (networkError) {
        console.warn(`[Network Fallback] Fetch failed for ${url}, checking cache:`, networkError);
        
        const cachedContent = await getItem<T>(cacheKey);
        
        if (cachedContent !== null) {
            return cachedContent;
        }

        // Translation fallback (Hardcoded here for simplicity, or we could pass t)
        const isMn = typeof window !== 'undefined' && window.location.pathname.includes('/mn');
        const errorMessage = isMn 
            ? "Сүлжээгүй байна. Дахин оролдоно уу."
            : "No internet connection and no cached data found.";
            
        throw new Error(errorMessage);
    }
}
