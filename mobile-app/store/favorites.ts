import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
    monks: string[];
    tours: string[];
    addFavorite: (type: 'monks' | 'tours', id: string) => void;
    removeFavorite: (type: 'monks' | 'tours', id: string) => void;
    toggleFavorite: (type: 'monks' | 'tours', id: string) => void;
    isFavorite: (type: 'monks' | 'tours', id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            monks: [],
            tours: [],
            addFavorite: (type, id) =>
                set((state) => ({
                    [type]: [...new Set([...state[type], id])],
                })),
            removeFavorite: (type, id) =>
                set((state) => ({
                    [type]: state[type].filter((itemId) => itemId !== id),
                })),
            toggleFavorite: (type, id) => {
                const { isFavorite, addFavorite, removeFavorite } = get();
                if (isFavorite(type, id)) {
                    removeFavorite(type, id);
                } else {
                    addFavorite(type, id);
                }
            },
            isFavorite: (type, id) => get()[type].includes(id),
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
