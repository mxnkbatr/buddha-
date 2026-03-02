import { View, Text, FlatList, Pressable, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useCallback, memo, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Heart, ArrowLeft, HeartOff, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../lib/api';
import { useFavoritesStore } from '../store/favorites';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface Monk {
    _id: string;
    name: { mn: string; en: string };
    image?: string;
    title?: { mn: string; en: string };
    specialties?: string[];
}

const FavoriteMonkCard = memo(
    ({ monk, index, onPress, onRemove }: { monk: Monk; index: number; onPress: () => void; onRemove: () => void }) => {
        const { i18n } = useTranslation();
        const lang = i18n.language === 'mn' ? 'mn' : 'en';

        const name = typeof monk.name === 'string' ? monk.name : (monk.name?.[lang] || monk.name?.en || 'Monk');
        const title = monk.title ? (typeof monk.title === 'string' ? monk.title : (monk.title?.[lang] || monk.title?.en || '')) : '';

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).duration(500)}
                layout={Layout.springify()}
            >
                <Pressable
                    onPress={onPress}
                    className="bg-white/5 rounded-[24px] mb-4 mx-6 overflow-hidden border border-white/10 shadow-lg"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}
                >
                    <View className="flex-row items-center p-4">
                        <Image
                            source={{ uri: monk.image || 'https://via.placeholder.com/100' }}
                            style={{ width: 80, height: 80, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}
                            contentFit="cover"
                            transition={300}
                        />
                        <View className="flex-1 ml-4 justify-center">
                            <Text className="text-xl font-serif font-bold text-white mb-1 tracking-wide" numberOfLines={1}>
                                {name}
                            </Text>
                            {title ? (
                                <Text className="text-monk-primary text-xs uppercase tracking-[2px] font-bold mb-1.5" numberOfLines={1}>
                                    {title}
                                </Text>
                            ) : null}
                            {monk.specialties?.length ? (
                                <Text className="text-slate-400 text-xs tracking-wider" numberOfLines={1}>
                                    {monk.specialties.slice(0, 2).join(' • ')}
                                </Text>
                            ) : null}
                        </View>
                        <TouchableOpacity
                            onPress={onRemove}
                            className="w-12 h-12 rounded-full items-center justify-center bg-red-500/10 border border-red-500/20"
                            activeOpacity={0.7}
                        >
                            <Heart size={20} color="#EF4444" fill="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Animated.View>
        );
    }
);

FavoriteMonkCard.displayName = 'FavoriteMonkCard';

export default function FavoritesScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const { monks: favoriteMonkIds, removeFavorite } = useFavoritesStore();

    const { data: monks, refetch } = useQuery({
        queryKey: ['monks'],
        queryFn: async () => {
            const res = await api.get('/monks');
            return res.data as Monk[];
        },
    });

    const favoriteMonks = useMemo(() => {
        if (!monks) return [];
        return monks.filter((monk) => favoriteMonkIds.includes(monk._id));
    }, [monks, favoriteMonkIds]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const handleRemove = useCallback(
        (id: string) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removeFavorite(id);
        },
        [removeFavorite]
    );

    return (
        <View className="flex-1 bg-[#0F172A]">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <SafeAreaView edges={['top']} className="bg-[#0F172A] z-10 pb-4">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20"
                    >
                        <ArrowLeft size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-serif font-bold text-white ml-5 tracking-tight flex-1">
                        Sanctuary Stars
                    </Text>
                    <Sparkles size={24} color="#D4AF37" />
                </View>
            </SafeAreaView>

            <FlatList
                data={favoriteMonks}
                renderItem={({ item, index }) => (
                    <FavoriteMonkCard
                        monk={item}
                        index={index}
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push(`/monk/${item._id}`);
                        }}
                        onRemove={() => handleRemove(item._id)}
                    />
                )}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
                }
                ListEmptyComponent={
                    <Animated.View entering={FadeInDown.duration(600)} className="flex-1 items-center justify-center py-32 px-10">
                        <View className="w-24 h-24 bg-red-500/5 rounded-full items-center justify-center mb-6 border border-red-500/10">
                            <HeartOff size={40} color="#EF4444" opacity={0.6} strokeWidth={1.5} />
                        </View>
                        <Text className="text-2xl font-serif font-bold text-white mb-3 text-center tracking-tight">
                            Empty Sanctuary
                        </Text>
                        <Text className="text-slate-400 text-center mb-8 leading-6">
                            Wander the paths and find guides whose light resonates with your spirit.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/(tabs)');
                            }}
                            className="bg-monk-primary rounded-full py-4 px-10 shadow-lg border border-monk-primary/50"
                            style={{ shadowColor: '#D4AF37', shadowRadius: 20, shadowOpacity: 0.3 }}
                        >
                            <Text className="text-[#0F172A] font-bold text-xs tracking-widest uppercase">
                                Begin Your Journey
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                }
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </View>
    );
}
