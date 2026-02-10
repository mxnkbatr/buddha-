import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useState, useCallback, memo } from 'react';
import { Calendar, Clock, Star, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import api from '../../lib/api';

interface Service {
    id: string;
    name: { mn: string; en: string };
    price: number;
    duration: string;
}

interface Monk {
    _id: string;
    name: { mn: string; en: string };
    title: { mn: string; en: string };
    image: string;
    specialties: string[];
    isAvailable: boolean;
    yearsOfExperience: number;
    services: Service[];
}

const MonkCard = memo(({ monk, onPress, t_db }: { monk: Monk; onPress: () => void; t_db: (data: any) => string }) => (
    <Pressable
        onPress={onPress}
        className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden active:bg-stone-50 border border-stone-100"
    >
        <View className="flex-row">
            <Image
                source={{ uri: monk.image || 'https://via.placeholder.com/120' }}
                style={{ width: 120, height: 140 }}
                contentFit="cover"
            />
            <View className="flex-1 p-4 justify-between">
                <View>
                    <Text className="text-lg font-bold text-stone-800" numberOfLines={1}>
                        {t_db(monk.name)}
                    </Text>
                    <Text className="text-stone-600 text-sm" numberOfLines={1}>
                        {t_db(monk.title)}
                    </Text>
                    <View className="flex-row flex-wrap mt-2 gap-1">
                        {monk.specialties?.slice(0, 2).map((spec, i) => (
                            <View key={i} className="bg-amber-50 px-2 py-0.5 rounded-full">
                                <Text className="text-amber-700 text-xs">{spec}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center">
                        <Star size={14} color="#D97706" fill="#D97706" />
                        <Text className="ml-1 text-stone-700 text-sm font-medium">
                            {monk.yearsOfExperience}yr exp
                        </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${monk.isAvailable ? 'bg-green-100' : 'bg-stone-100'}`}>
                        <Text className={`text-xs font-medium ${monk.isAvailable ? 'text-green-700' : 'text-stone-500'}`}>
                            {monk.isAvailable ? 'Available' : 'Busy'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>

        {monk.services && monk.services.length > 0 && (
            <View className="border-t border-stone-100 px-4 py-3">
                <Text className="text-stone-500 text-xs uppercase mb-2">Services Available</Text>
                <View className="flex-row flex-wrap gap-2">
                    {monk.services.slice(0, 3).map((service) => (
                        <View key={service.id} className="flex-row items-center bg-stone-50 px-2 py-1 rounded-lg">
                            <Clock size={12} color="#78716C" />
                            <Text className="ml-1 text-stone-700 text-xs">{service.duration}</Text>
                            <Text className="ml-2 text-amber-600 text-xs font-semibold">${service.price}</Text>
                        </View>
                    ))}
                </View>
            </View>
        )}
    </Pressable>
));

MonkCard.displayName = 'MonkCard';

export default function BookingScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);

    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[i18n.language] || data.en || data.mn || '';
    };

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

    const availableMonks = monks?.filter(m => m.isAvailable) || [];
    const allMonks = monks || [];

    return (
        <ScreenWrapper className="bg-stone-50 dark:bg-stone-900">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} tintColor="#D97706" />
                }
            >
                {/* Header */}
                <View className="px-6 pt-4 pb-6">
                    <ThemedText type="title" className="text-stone-800 dark:text-stone-100">
                        Book a Session
                    </ThemedText>
                    <ThemedText className="text-stone-600 dark:text-stone-400 mt-1">
                        Connect with our spiritual guides for personalized sessions
                    </ThemedText>
                </View>

                {/* Quick Stats */}
                <View className="flex-row px-6 mb-6 gap-3">
                    <View className="flex-1 bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
                        <View className="flex-row items-center">
                            <Users size={20} color="#D97706" />
                            <ThemedText className="ml-2 text-2xl font-bold">
                                {availableMonks.length}
                            </ThemedText>
                        </View>
                        <Text className="text-stone-500 text-sm mt-1">Available Now</Text>
                    </View>
                    <View className="flex-1 bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
                        <View className="flex-row items-center">
                            <Calendar size={20} color="#78716C" />
                            <ThemedText className="ml-2 text-2xl font-bold">
                                {allMonks.length}
                            </ThemedText>
                        </View>
                        <Text className="text-stone-500 text-sm mt-1">Total Monks</Text>
                    </View>
                </View>

                {/* Available Monks */}
                {availableMonks.length > 0 && (
                    <View className="px-6 mb-4">
                        <Text className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-3">
                            Available Now
                        </Text>
                        {availableMonks.slice(0, 3).map((monk) => (
                            <MonkCard
                                key={monk._id}
                                monk={monk}
                                t_db={t_db}
                                onPress={() => router.push(`/booking/${monk._id}`)}
                            />
                        ))}
                    </View>
                )}

                {/* All Monks */}
                <View className="px-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-semibold text-stone-800 dark:text-stone-200">
                            All Spiritual Guides
                        </Text>
                        <Pressable onPress={() => router.push('/(tabs)/monks')}>
                            <Text className="text-amber-600 font-medium">View All</Text>
                        </Pressable>
                    </View>
                    {allMonks.map((monk) => (
                        <MonkCard
                            key={monk._id}
                            monk={monk}
                            t_db={t_db}
                            onPress={() => router.push(`/booking/${monk._id}`)}
                        />
                    ))}

                    {allMonks.length === 0 && !isLoading && (
                        <View className="items-center py-12">
                            <Text className="text-stone-500">No monks available at the moment</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
