import { View, Text, FlatList, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { useCallback, useState, memo } from 'react';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';

import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '../../lib/api';
import { useFavoritesStore } from '../../store/favorites';
import { MonkCardSkeleton } from '../../components/LoadingSkeleton';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';

interface Monk {
    _id: string;
    name: { mn: string; en: string } | string;
    title?: { mn: string; en: string } | string;
    image?: string;
    imageUrl?: string;
    specialties?: string[];
    isAvailable?: boolean;
    isSpecial?: boolean;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const DivineMonkCard = memo(({ monk, index, lang, onPress }: { monk: Monk; index: number; lang: 'mn' | 'en'; onPress: () => void }) => {
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const isFav = isFavorite(monk._id);
    const { width } = useWindowDimensions();

    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[lang] || data.en || data.mn || '';
    };

    const handleFav = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleFavorite(monk._id);
    };

    const cardWidth = width > 600 ? (width - 72) / 2 : width - 48;
    const cardHeight = width > 600 ? 440 : 380;
    const imgUri = monk.image || monk.imageUrl || 'https://via.placeholder.com/400';

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ width: cardWidth, height: cardHeight }}>
            <View className="flex-1 rounded-[32px] overflow-hidden border border-[#D4AF37]/30 bg-white/5 shadow-2xl" style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20 }}>
                {/* Image */}
                <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.9 }} contentFit="cover" transition={400} />

                {/* Deep Shadow Overlays */}
                <View style={{ position: 'absolute', bottom: 0, width: '100%', height: '80%', backgroundColor: 'transparent' }} className="bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />

                {/* Price Badge - top right */}
                <View className="absolute top-4 right-4 bg-black/40 border border-[#D4AF37]/50 rounded-xl px-4 py-2 items-center backdrop-blur-md">
                    <Text className="text-[8px] font-bold uppercase tracking-[3px] text-[#D4AF37] opacity-90 mb-0.5">
                        {lang === 'mn' ? 'Үнэ' : 'Starting'}
                    </Text>
                    <Text className="text-base font-serif font-bold text-white shadow-sm">
                        {monk.isSpecial ? '88,800₮' : '50,000₮'}
                    </Text>
                </View>

                {/* Favorite Button - top left */}
                <TouchableOpacity onPress={handleFav} className="absolute top-4 left-4 w-12 h-12 rounded-full bg-black/40 border border-[#D4AF37]/30 items-center justify-center backdrop-blur-md">
                    <Heart size={20} color={isFav ? '#EF4444' : '#FFF'} fill={isFav ? '#EF4444' : 'transparent'} />
                </TouchableOpacity>

                {/* Arcana Tag - bottom left */}
                <View className="absolute top-20 left-4">
                    <View className="px-4 py-2 rounded-full border border-[#D4AF37]/40 bg-white/10 backdrop-blur-sm">
                        <Text className="text-[10px] font-bold uppercase tracking-[4px] text-white">
                            Arcana {ROMAN[index] || index + 1}
                        </Text>
                    </View>
                </View>

                {/* Bottom Content */}
                <View className="absolute bottom-0 left-0 right-0 items-center pb-6 px-4">
                    {/* Name */}
                    <Text className="text-3xl font-serif font-bold text-white text-center mb-2 shadow-sm" style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10 }}>
                        {t_db(monk.name)}
                    </Text>

                    {/* Divider */}
                    <View className="h-[2px] w-12 rounded-full bg-[#D4AF37] mb-3 opacity-80" />

                    {/* Title */}
                    <Text className="text-[10px] font-bold uppercase tracking-[4px] text-[#D4AF37] mb-6 opacity-90">
                        {t_db(monk.title) || (lang === 'mn' ? 'Мэргэн ухаанч' : 'Master of Fate')}
                    </Text>

                    {/* CTA Button */}
                    <View className="rounded-full overflow-hidden shadow-2xl flex-row items-center justify-center w-full max-w-[200px] py-4 bg-white/10 border border-[#D4AF37]/40 backdrop-blur-md" style={{ shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 }}>
                        <Text className="text-[11px] font-bold uppercase tracking-[4px] text-white mr-3">
                            {lang === 'mn' ? 'Захиалах' : 'Book Session'}
                        </Text>
                        <View className="w-8 h-8 rounded-full bg-[#D4AF37] items-center justify-center shadow-lg">
                            <ArrowRight size={14} color="#0F172A" strokeWidth={3} />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

DivineMonkCard.displayName = 'DivineMonkCard';

export default function MonksScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';
    const [refreshing, setRefreshing] = useState(false);
    const { width } = useWindowDimensions();
    const isLargeScreen = width > 600;

    const tr = (data: { mn: string; en: string }) => data[lang] || data.en;

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

    return (
        <ScreenWrapper className="bg-[#0F172A]">
            <SafeAreaView className="flex-1 bg-[#0F172A]" edges={['top']}>
                <FlatList
                    data={monks}
                    keyExtractor={(item) => item._id}
                    numColumns={isLargeScreen ? 2 : 1}
                    key={isLargeScreen ? 'grid' : 'list'}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120, gap: 24 }}
                    columnWrapperStyle={isLargeScreen ? { gap: 24 } : undefined}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
                    ListHeaderComponent={
                        <View className="items-center mb-10 pt-6">
                            {/* Badge */}
                            <View className="flex-row items-center gap-2 mb-6 bg-white/5 border border-[#D4AF37]/30 px-6 py-2.5 rounded-full">
                                <Sparkles size={14} color="#D4AF37" />
                                <Text className="text-[10px] font-bold tracking-[4px] uppercase text-[#D4AF37]">
                                    {tr({ mn: 'Мэргэн Ухаан', en: 'Divine Wisdom' })}
                                </Text>
                                <Sparkles size={14} color="#D4AF37" />
                            </View>

                            {/* Title */}
                            <Text className="text-5xl font-serif font-bold text-white text-center tracking-tight mb-3">
                                {tr({ mn: 'Үзмэрч', en: 'Exhibitor' })}
                            </Text>

                            {/* Subtitle */}
                            <Text className="text-xs text-slate-400 uppercase tracking-[4px] text-center mb-4">
                                {tr({ mn: 'Хувь тавилангийн хөтөч', en: 'Guidance through the threads of fate' })}
                            </Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.delay(index * 100).duration(600).springify()} style={{ alignItems: 'center' }}>
                            <DivineMonkCard
                                monk={item}
                                index={index}
                                lang={lang}
                                onPress={() => router.push(`/monk/${item._id}`)}
                            />
                        </Animated.View>
                    )}
                    ListEmptyComponent={
                        isLoading ? (
                            <>
                                <MonkCardSkeleton />
                                <MonkCardSkeleton />
                                <MonkCardSkeleton />
                            </>
                        ) : (
                            <Text className="text-center text-slate-500 mt-10 italic font-serif">
                                {tr({ mn: 'Багш нар олдсонгүй.', en: 'No monks available.' })}
                            </Text>
                        )
                    }
                    removeClippedSubviews
                    maxToRenderPerBatch={6}
                    windowSize={5}
                    initialNumToRender={4}
                />
            </SafeAreaView>
        </ScreenWrapper>
    );
}
