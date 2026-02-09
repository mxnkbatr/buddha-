import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useState, useCallback, memo, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Heart, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../lib/api';
import { useFavoritesStore } from '../store/favorites';
import { useTranslation } from 'react-i18next';

interface Monk {
    _id: string;
    name: string;
    imageUrl?: string;
    specialization?: string;
}

interface Tour {
    _id: string;
    title: string;
    imageUrl?: string;
    description?: string;
    price?: number;
}

const FavoriteCard = memo(
    ({
        item,
        type,
        onPress,
        onRemove,
    }: {
        item: Monk | Tour;
        type: 'monks' | 'tours';
        onPress: () => void;
        onRemove: () => void;
    }) => {
        const { i18n } = useTranslation();
        const t_db = (data: any) => {
            if (!data) return '';
            if (typeof data === 'string') return data;
            return data[i18n.language] || data.en || data.mn || '';
        };

        return (
            <Pressable
                onPress={onPress}
                className="bg-white rounded-xl mb-3 mx-4 shadow-sm overflow-hidden active:bg-stone-50"
            >
                <View className="flex-row">
                    <Image
                        source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
                        style={{ width: 100, height: 100 }}
                        contentFit="cover"
                    />
                    <View className="flex-1 p-4">
                        <Text className="text-lg font-semibold text-stone-800" numberOfLines={1}>
                            {'name' in item ? t_db(item.name) : t_db(item.title)}
                        </Text>
                        <Text className="text-stone-600 text-sm mt-1" numberOfLines={2}>
                            {'specialization' in item
                                ? t_db(item.specialization) || 'Spiritual Guidance'
                                : t_db((item as Tour).description) || 'Explore the beauty of Mongolia'}
                        </Text>
                        {type === 'tours' && 'price' in item && item.price && (
                            <Text className="text-amber-600 font-semibold mt-2">
                                ${item.price}
                            </Text>
                        )}
                    </View>
                    <Pressable
                        onPress={onRemove}
                        className="p-3"
                        style={{ minWidth: 44, minHeight: 44 }}
                    >
                        <Heart size={24} color="#EF4444" fill="#EF4444" />
                    </Pressable>
                </View>
            </Pressable>
        );
    }
);

FavoriteCard.displayName = 'FavoriteCard';

type TabType = 'monks' | 'tours';

export default function FavoritesScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('monks');
    const { monks: favoriteMonkIds, tours: favoriteTourIds, removeFavorite } = useFavoritesStore();

    const { data: monks, refetch: refetchMonks } = useQuery({
        queryKey: ['monks'],
        queryFn: async () => {
            const res = await api.get('/monks');
            return res.data as Monk[];
        },
    });

    const { data: tours, refetch: refetchTours } = useQuery({
        queryKey: ['tours'],
        queryFn: async () => {
            const res = await api.get('/tours');
            return res.data as Tour[];
        },
    });

    const favoriteMonks = useMemo(() => {
        if (!monks) return [];
        return monks.filter((monk) => favoriteMonkIds.includes(monk._id));
    }, [monks, favoriteMonkIds]);

    const favoriteTours = useMemo(() => {
        if (!tours) return [];
        return tours.filter((tour) => favoriteTourIds.includes(tour._id));
    }, [tours, favoriteTourIds]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchMonks(), refetchTours()]);
        setRefreshing(false);
    }, [refetchMonks, refetchTours]);

    const handleRemove = useCallback(
        (type: TabType, id: string) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeFavorite(type, id);
        },
        [removeFavorite]
    );

    const renderItem = useCallback(
        ({ item }: { item: Monk | Tour }) => (
            <FavoriteCard
                item={item}
                type={activeTab}
                onPress={() => {
                    router.push(
                        activeTab === 'monks' ? `/monk/${item._id}` : `/tour/${item._id}`
                    );
                }}
                onRemove={() => handleRemove(activeTab, item._id)}
            />
        ),
        [activeTab, router, handleRemove]
    );

    const keyExtractor = useCallback((item: Monk | Tour) => item._id, []);

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <Stack.Screen options={{ headerTitle: 'Favorites' }} />

            {/* Tabs */}
            <View className="flex-row px-4 py-4 gap-2 bg-stone-50">
                <Pressable
                    onPress={() => setActiveTab('monks')}
                    className={`flex-1 py-3 rounded-xl ${activeTab === 'monks' ? 'bg-amber-600' : 'bg-white'
                        }`}
                    style={{ minHeight: 44 }}
                >
                    <Text
                        className={`text-center font-semibold ${activeTab === 'monks' ? 'text-white' : 'text-stone-700'
                            }`}
                    >
                        Monks ({favoriteMonks.length})
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('tours')}
                    className={`flex-1 py-3 rounded-xl ${activeTab === 'tours' ? 'bg-amber-600' : 'bg-white'
                        }`}
                    style={{ minHeight: 44 }}
                >
                    <Text
                        className={`text-center font-semibold ${activeTab === 'tours' ? 'text-white' : 'text-stone-700'
                            }`}
                    >
                        Tours ({favoriteTours.length})
                    </Text>
                </Pressable>
            </View>

            {/* Favorites List */}
            <FlatList
                data={activeTab === 'monks' ? favoriteMonks : favoriteTours}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ paddingVertical: 8 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20 px-6">
                        <View className="w-20 h-20 bg-stone-200 rounded-full items-center justify-center mb-4">
                            <Heart size={40} color="#78716C" />
                        </View>
                        <Text className="text-xl font-bold text-stone-800 mb-2">
                            No Favorites Yet
                        </Text>
                        <Text className="text-stone-600 text-center mb-6">
                            Start exploring and save your favorite {activeTab}
                        </Text>
                        <Pressable
                            onPress={() =>
                                router.push(activeTab === 'monks' ? '/(tabs)/monks' : '/(tabs)/tours')
                            }
                            className="bg-amber-600 rounded-xl py-3 px-6 active:bg-amber-700"
                            style={{ minHeight: 48 }}
                        >
                            <Text className="text-white font-semibold">
                                Explore {activeTab === 'monks' ? 'Monks' : 'Tours'}
                            </Text>
                        </Pressable>
                    </View>
                }
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </SafeAreaView>
    );
}
