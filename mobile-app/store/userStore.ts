import { create } from 'zustand';
import { User } from '../src/types/schema';
import { getUserProfile } from '../lib/api';
import authApi from '../lib/authApi';

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    setUser: (user: User | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await getUserProfile();
            set({ user, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch profile:', error);
            set({ error: error.message || 'Failed to fetch profile', isLoading: false });
        }
    },
    updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.updateProfile(data);
            // Refresh profile after update
            const user = await getUserProfile();
            set({ user, isLoading: false });
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            set({ error: error.message || 'Failed to update profile', isLoading: false });
            throw error;
        }
    },
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null, error: null }),
}));
