import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useCallback, memo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import api from '../lib/api';
import { useTranslation } from 'react-i18next';

interface Booking {
    _id: string;
    type: 'monk' | 'tour';
    monkId?: string;
    tourId?: string;
    monkName?: string;
    tourTitle?: string;
    imageUrl?: string;
    date: string;
    time?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalPrice?: number;
}

import { Video } from 'lucide-react-native';

const BookingCard = memo(({ booking, onPress, onJoinSession }: { booking: Booking; onPress: () => void, onJoinSession: () => void }) => {
    const { i18n } = useTranslation();
    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[i18n.language] || data.en || data.mn || '';
    };
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    const statusColor = statusColors[booking.status] || 'bg-stone-100 text-stone-700';
    const showJoinButton = booking.status === 'confirmed' && booking.type === 'monk';

    return (
        <Pressable
            onPress={onPress}
            className="bg-white rounded-xl mb-3 mx-4 shadow-sm overflow-hidden active:bg-stone-50 border border-stone-100"
        >
            <View className="flex-row">
                <Image
                    source={{ uri: booking.imageUrl || 'https://via.placeholder.com/100' }}
                    style={{ width: 100, height: 100 }}
                    contentFit="cover"
                />
                <View className="flex-1 p-4">
                    <Text className="text-lg font-semibold text-stone-800" numberOfLines={1}>
                        {booking.type === 'monk' ? t_db(booking.monkName) : t_db(booking.tourTitle)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Calendar size={14} color="#78716C" />
                        <Text className="ml-1 text-monk-secondary text-sm">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Text>
                        {booking.time && (
                            <>
                                <Clock size={14} color="#78716C" className="ml-2" />
                                <Text className="ml-1 text-monk-secondary text-sm">{booking.time}</Text>
                            </>
                        )}
                    </View>

                    <View className="flex-row items-center justify-between mt-3">
                        <View className={`px-2 py-1 rounded-md ${statusColor.split(' ')[0]}`}>
                            <Text className={`text-xs font-medium ${statusColor.split(' ')[1]}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Text>
                        </View>

                        {showJoinButton && (
                            <Pressable
                                onPress={onJoinSession}
                                className="bg-monk-primary px-3 py-1.5 rounded-full flex-row items-center"
                            >
                                <Video size={12} color="white" className="mr-1" />
                                <Text className="text-white text-xs font-bold uppercase">Join</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );
});

BookingCard.displayName = 'BookingCard';

type FilterType = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function MyBookingsScreen() {
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');

    const { data: bookings, isLoading, refetch } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get('/bookings');
            return res.data as Booking[];
        },
        enabled: isSignedIn,
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const filteredBookings = useCallback(() => {
        if (!bookings) return [];
        const now = new Date();

        switch (filter) {
            case 'upcoming':
                return bookings.filter(
                    (b) => new Date(b.date) >= now && b.status !== 'cancelled'
                );
            case 'past':
                return bookings.filter(
                    (b) => new Date(b.date) < now || b.status === 'completed'
                );
            case 'cancelled':
                return bookings.filter((b) => b.status === 'cancelled');
            default:
                return bookings;
        }
    }, [bookings, filter]);

    const renderItem = useCallback(
        ({ item }: { item: Booking }) => (
            <BookingCard
                booking={item}
                onPress={() => { }}
                onJoinSession={() => router.push(`/live-session/${item._id}`)}
            />
        ),
        [router]
    );

    const keyExtractor = useCallback((item: Booking) => item._id, []);

    if (!isSignedIn) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50">
                <Stack.Screen options={{ headerTitle: 'My Bookings' }} />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-2xl font-bold text-stone-800 mb-2">
                        Sign In Required
                    </Text>
                    <Text className="text-stone-600 text-center mb-6">
                        Please sign in to view your bookings
                    </Text>
                    <Pressable
                        onPress={() => router.push('/(auth)/sign-in')}
                        className="bg-amber-600 rounded-xl py-4 px-8 active:bg-amber-700"
                        style={{ minHeight: 52 }}
                    >
                        <Text className="text-white font-semibold text-lg">Sign In</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <Stack.Screen options={{ headerTitle: 'My Bookings' }} />

            {/* Filter Tabs */}
            <View className="flex-row px-4 py-4 gap-2 bg-stone-50">
                {(['all', 'upcoming', 'past', 'cancelled'] as FilterType[]).map((tab) => (
                    <Pressable
                        key={tab}
                        onPress={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-full ${filter === tab ? 'bg-amber-600' : 'bg-white'
                            }`}
                        style={{ minHeight: 36 }}
                    >
                        <Text
                            className={`font-medium capitalize ${filter === tab ? 'text-white' : 'text-stone-700'
                                }`}
                        >
                            {tab}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Bookings List */}
            <FlatList
                data={filteredBookings()}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ paddingVertical: 8 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <Text className="text-stone-500 text-center">
                            {isLoading ? 'Loading bookings...' : 'No bookings found'}
                        </Text>
                        {!isLoading && (
                            <Pressable
                                onPress={() => router.push('/(tabs)/monks')}
                                className="mt-4 bg-amber-600 rounded-xl py-3 px-6 active:bg-amber-700"
                            >
                                <Text className="text-white font-semibold">
                                    Explore Monks & Tours
                                </Text>
                            </Pressable>
                        )}
                    </View>
                }
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </SafeAreaView>
    );
}
