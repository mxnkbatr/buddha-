import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { Calendar, Clock, ArrowLeft, CheckCircle2, XCircle, RotateCcw } from 'lucide-react-native';
import api from '../lib/api';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import * as Haptics from 'expo-haptics';
import { useIsAuthenticated } from '../hooks/useIsAuthenticated';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigationState } from '@react-navigation/native';

interface Booking {
    _id: string;
    monkId?: string;
    monkName?: string;
    clientName?: string;
    date: string;
    time?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    serviceName?: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: '#F59E0B', icon: Clock },
    confirmed: { label: 'Confirmed', color: '#10B981', icon: CheckCircle2 },
    completed: { label: 'Completed', color: '#6B7280', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: '#EF4444', icon: XCircle },
    rejected: { label: 'Rejected', color: '#EF4444', icon: XCircle },
};

export default function MyBookingsScreen() {
    try {
        useNavigationState(state => state);
    } catch {
        return (
            <View className="flex-1 bg-[#0F172A] items-center justify-center">
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return <MyBookingsContent />;
}

function MyBookingsContent() {
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const isAuthenticated = useIsAuthenticated();
    const { user: dbUser } = useUserStore();
    const [refreshing, setRefreshing] = useState(false);
    const { i18n } = useTranslation();
    const lang = i18n.language === 'mn' ? 'mn' : 'en';

    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[lang] || data.en || data.mn || '';
    };

    const userId = dbUser?._id?.toString() || dbUser?.clerkId;
    const isMonk = dbUser?.role === 'monk';

    const { data: bookings, isLoading, refetch } = useQuery({
        queryKey: ['bookings', userId, isMonk],
        queryFn: async () => {
            if (!userId) return [];
            // Monks see bookings clients made WITH them; users see bookings they made
            const param = isMonk ? `monkId=${userId}` : `userId=${userId}`;
            const res = await api.get(`/bookings?${param}`);
            const data = Array.isArray(res.data) ? res.data : (res.data?.bookings || []);
            // Sort newest first
            return data.sort((a: Booking, b: Booking) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
        enabled: !!userId && isAuthenticated,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };

    if (!isAuthenticated) {
        return (
            <View className="flex-1 bg-[#0F172A]">
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView edges={['top']} className="flex-1 items-center justify-center px-6">
                    <Text className="text-white text-xl font-serif font-bold mb-4">
                        {lang === 'mn' ? 'Нэвтрэх шаардлагатай' : 'Sign in required'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/sign-in')}
                        className="bg-monk-primary rounded-full px-8 py-4"
                    >
                        <Text className="text-[#0F172A] font-bold uppercase tracking-widest text-xs">
                            {lang === 'mn' ? 'Нэвтрэх' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    const renderBooking = ({ item, index }: { item: Booking; index: number }) => {
        const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const StatusIcon = config.icon;

        return (
            <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
                <View className="bg-white/5 rounded-3xl p-5 mb-3 border border-white/10">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-1">
                            <Text className="text-white font-serif font-bold text-lg" numberOfLines={1}>
                                {isMonk ? (item.clientName || 'Client') : (item.monkName || 'Booking')}
                            </Text>
                            {item.serviceName && (
                                <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                                    {t_db(item.serviceName)}
                                </Text>
                            )}
                        </View>
                        <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: `${config.color}20` }}>
                            <StatusIcon size={12} color={config.color} />
                            <Text className="ml-1.5 text-xs font-bold" style={{ color: config.color }}>
                                {config.label}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-4 opacity-70">
                        <View className="flex-row items-center">
                            <Calendar size={13} color="#D4AF37" />
                            <Text className="text-slate-300 text-xs ml-1.5 font-bold">
                                {formatDate(item.date)}
                            </Text>
                        </View>
                        {item.time && (
                            <View className="flex-row items-center">
                                <Clock size={13} color="#D4AF37" />
                                <Text className="text-slate-300 text-xs ml-1.5 font-bold">
                                    {item.time}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 bg-[#0F172A]">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-6 py-4">
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4"
                    >
                        <ArrowLeft size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-serif font-bold tracking-tight">
                        {lang === 'mn' ? 'Миний захиалгууд' : 'My Bookings'}
                    </Text>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#D4AF37" />
                    </View>
                ) : !bookings || bookings.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <RotateCcw size={48} color="#64748B" />
                        <Text className="text-slate-400 text-center mt-6 text-base">
                            {lang === 'mn' ? 'Захиалга байхгүй' : 'No bookings yet'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        keyExtractor={(item) => item._id}
                        renderItem={renderBooking}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#D4AF37"
                            />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
