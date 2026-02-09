import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useCallback, useState, memo } from 'react';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../../lib/api';
import { useFavoritesStore } from '../../store/favorites';
import { MonkCardSkeleton } from '../../components/LoadingSkeleton';
import { useTranslation } from 'react-i18next';


interface Monk {
    _id: string;
    name: string;
    imageUrl?: string;
    specialization?: string;
    isAvailable?: boolean;
}

// Memoized monk card component for performance
const MonkCard = memo(({ monk, onPress }: { monk: Monk; onPress: () => void }) => {
    const { i18n } = useTranslation();
    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[i18n.language] || data.en || data.mn || '';
    };
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const isFav = isFavorite('monks', monk._id);

    const handleFavoriteToggle = (e: any) => {
        e.stopPropagation();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleFavorite('monks', monk._id);
    };

    return (
        <Pressable
            onPress={onPress}
            className="bg-white rounded-xl p-4 mb-3 mx-4 shadow-sm active:bg-stone-100"
            style={{ minHeight: 80 }}
        >
            <View className="flex-row items-center">
                <Image
                    source={{ uri: monk.imageUrl || 'https://via.placeholder.com/80' }}
                    style={{ width: 70, height: 70, borderRadius: 35 }}
                    contentFit="cover"
                    transition={200}
                />
                <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold text-stone-800">
                        {t_db(monk.name)}
                    </Text>
                    <Text className="text-stone-600" numberOfLines={1}>
                        {t_db(monk.specialization) || 'Spiritual Guidance'}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <View
                            className={`w-2 h-2 rounded-full mr-2 ${monk.isAvailable ? 'bg-green-500' : 'bg-stone-400'
                                }`}
                        />
                        <Text className="text-sm text-stone-500">
                            {monk.isAvailable ? 'Available' : 'Unavailable'}
                        </Text>
                    </View>
                </View>
                <Pressable
                    onPress={handleFavoriteToggle}
                    className="p-2 -mr-2"
                    style={{ minWidth: 44, minHeight: 44 }}
                >
                    <Heart
                        size={24}
                        color={isFav ? '#EF4444' : '#D6D3D1'}
                        fill={isFav ? '#EF4444' : 'transparent'}
                    />
                </Pressable>
            </View>
        </Pressable>
    );
});

MonkCard.displayName = 'MonkCard';

export default function MonksScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const { data: monks, isLoading, refetch } = useQuery({
        queryKey: ['monks'],
        queryFn: async () => {
            const res = await api.get('/monks');
            return res.data as Monk[];
        },
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const renderItem = useCallback(
        ({ item }: { item: Monk }) => (
            <MonkCard
                monk={item}
                onPress={() => router.push(`/monk/${item._id}`)}
            />
        ),
        [router]
    );

    const keyExtractor = useCallback((item: Monk) => item._id, []);

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            {/* Header */}
            <View className="px-6 py-4 border-b border-stone-200 bg-stone-50">
                <Text className="text-2xl font-bold text-stone-800">Monks</Text>
                <Text className="text-stone-600">Book spiritual guidance sessions</Text>
            </View>

            {/* Monks List */}
            <FlatList
                data={monks}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <>
                            <MonkCardSkeleton />
                            <MonkCardSkeleton />
                            <MonkCardSkeleton />
                            <MonkCardSkeleton />
                        </>
                    ) : (
                        <Text className="text-center text-stone-500 mt-10">
                            No monks available
                        </Text>
                    )
                }
                // Performance optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={8}
            />
        </SafeAreaView>
    );
}
