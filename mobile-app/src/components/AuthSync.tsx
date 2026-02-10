import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';

export function AuthSync() {
    const { isSignedIn, getToken, userId } = useAuth();
    const { fetchProfile, clearUser } = useUserStore();
    const { isCustomAuth, hydrateToken, customToken } = useAuthStore();

    // Hydrate custom auth token on mount
    useEffect(() => {
        hydrateToken();
    }, []);

    // Handle Clerk auth sync
    useEffect(() => {
        const syncClerkAuth = async () => {
            // Skip if using custom auth
            if (isCustomAuth && customToken) {
                return;
            }

            if (isSignedIn && userId) {
                try {
                    // Get the token from Clerk
                    const token = await getToken();

                    if (token) {
                        // Save to SecureStore so api.ts can use it
                        await SecureStore.setItemAsync('clerk-db-jwt', token);

                        // Fetch the full profile from our backend
                        await fetchProfile();
                    }
                } catch (error) {
                    console.error('AuthSync Error:', error);
                }
            } else if (!isCustomAuth) {
                // Only clear if not using custom auth
                await SecureStore.deleteItemAsync('clerk-db-jwt');
                clearUser();
            }
        };

        syncClerkAuth();
    }, [isSignedIn, userId, getToken, isCustomAuth, customToken]);

    // Handle custom auth profile sync
    useEffect(() => {
        const syncCustomAuth = async () => {
            if (isCustomAuth && customToken) {
                try {
                    await fetchProfile();
                } catch (error) {
                    console.error('Custom AuthSync Error:', error);
                }
            }
        };

        syncCustomAuth();
    }, [isCustomAuth, customToken]);

    return null;
}
