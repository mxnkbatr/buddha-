import { ScrollView, RefreshControl, View, Text, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

// Import new components
import { Compass, BookOpen, Heart, Globe } from 'lucide-react-native';
import Header from '../../components/Header';
import HeroFeatureCard from '../../components/HeroFeatureCard';
import AISearchCard from '../../components/AISearchCard';
import GuideCarousel from '../../components/GuideCarousel';

export default function HomeScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);

    // Helper to get localized string from DB object {en: "...", mn: "..."}
    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[i18n.language] || data.en || data.mn || '';
    };

    const { data: monks, refetch: refetchMonks } = useQuery({
        queryKey: ['monks'],
        queryFn: async () => {
            const res = await api.get('/monks');
            return res.data;
        },
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetchMonks();
        setRefreshing(false);
    }, [refetchMonks]);

    return (
        <SafeAreaView className="flex-1 bg-stone-900" edges={['bottom']}>
            {/* Custom Header */}
            <Header />

            {/* Scrollable Content */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Hero Feature Card */}
                <HeroFeatureCard
                    imageUrl="https://images.unsplash.com/photo-1559595500-e15296bdbb4e?w=800"
                    title="Discover the Altai Mountains"
                    badge="Expedition 2025"
                    onPress={() => router.push('/tours')}
                />

                {/* AI Trail Planner */}
                <AISearchCard />

                {/* Quick Actions Grid */}
                <View className="px-6 py-6 pb-20">
                    <Text className="text-xl font-bold text-stone-100 mb-4">
                        Explore
                    </Text>

                    <View className="flex-row flex-wrap justify-between gap-y-4">
                        {/* Blog Action */}
                        <Pressable
                            onPress={() => router.push('/blog')}
                            className="w-[48%] bg-stone-800 p-4 rounded-xl border border-stone-700/50 active:bg-stone-700"
                        >
                            <BookOpen size={24} color="#F59E0B" className="mb-3" />
                            <Text className="text-stone-50 font-bold text-lg">Daily Wisdom</Text>
                            <Text className="text-stone-400 text-xs mt-1">Blog & News</Text>
                        </Pressable>

                        {/* Mission Action */}
                        <Pressable
                            onPress={() => router.push('/mission')}
                            className="w-[48%] bg-stone-800 p-4 rounded-xl border border-stone-700/50 active:bg-stone-700"
                        >
                            <Heart size={24} color="#F59E0B" className="mb-3" />
                            <Text className="text-stone-50 font-bold text-lg">Mission</Text>
                            <Text className="text-stone-400 text-xs mt-1">Our Purpose</Text>
                        </Pressable>

                        {/* About Action */}
                        <Pressable
                            onPress={() => router.push('/about')}
                            className="w-[48%] bg-stone-800 p-4 rounded-xl border border-stone-700/50 active:bg-stone-700"
                        >
                            <Globe size={24} color="#F59E0B" className="mb-3" />
                            <Text className="text-stone-50 font-bold text-lg">About Us</Text>
                            <Text className="text-stone-400 text-xs mt-1">Heritage & Future</Text>
                        </Pressable>

                        {/* Tours Action (existing) */}
                        <Pressable
                            onPress={() => router.push('/tours')}
                            className="w-[48%] bg-stone-800 p-4 rounded-xl border border-stone-700/50 active:bg-stone-700"
                        >
                            <Compass size={24} color="#F59E0B" className="mb-3" />
                            <Text className="text-stone-50 font-bold text-lg">Expeditions</Text>
                            <Text className="text-stone-400 text-xs mt-1">Tours & Travel</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
