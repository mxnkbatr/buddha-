import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { Calendar, Clock, Star } from 'lucide-react-native';
import api from '../../lib/api';

// Helper function to extract string from translation object
const getLang = (data: any) => {
    if (!data) return '';
    // If it's already a string, return it
    if (typeof data === 'string') return data;
    // Return English if available, otherwise Mongolian, otherwise empty
    return data.en || data.mn || '';
};

export default function MonkDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isSignedIn } = useAuth();

    const { data: monk, isLoading } = useQuery({
        queryKey: ['monk', id],
        queryFn: async () => {
            const res = await api.get(`/monks/${id}`);
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
                <ActivityIndicator size="large" color="#D97706" />
            </SafeAreaView>
        );
    }

    if (!monk) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
                <Text className="text-stone-600">Monk not found</Text>
            </SafeAreaView>
        );
    }

    const handleBook = () => {
        if (!isSignedIn) {
            router.push('/(auth)/sign-in');
            return;
        }
        router.push(`/booking/${id}`);
    };

    return (
        <View className="flex-1 bg-stone-50">
            <Stack.Screen
                options={{
                    // FIX 1: Use helper for header title
                    headerTitle: getLang(monk.name),
                    headerBackTitle: 'Back',
                }}
            />

            <ScrollView className="flex-1">
                {/* Hero Image */}
                <Image
                    source={{ uri: monk.imageUrl || 'https://via.placeholder.com/400' }}
                    style={{ width: '100%', height: 300 }}
                    contentFit="cover"
                />

                {/* Content */}
                <View className="px-6 pt-6 pb-24">
                    <Text className="text-3xl font-bold text-stone-800">
                        {/* FIX 2: Use helper for Name */}
                        {getLang(monk.name)}
                    </Text>

                    <Text className="text-amber-600 font-medium mt-1">
                        {/* FIX 3: Use helper for Specialization */}
                        {getLang(monk.specialization) || 'Spiritual Guidance'}
                    </Text>

                    {/* Stats */}
                    <View className="flex-row mt-4 gap-6">
                        <View className="flex-row items-center">
                            <Star size={18} color="#D97706" fill="#D97706" />
                            <Text className="ml-1 text-stone-700 font-medium">
                                {monk.rating || '5.0'}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Calendar size={18} color="#78716C" />
                            <Text className="ml-1 text-stone-600">
                                {monk.experience || '10+'} years
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mt-6">
                        <Text className="text-lg font-semibold text-stone-800 mb-2">
                            About
                        </Text>
                        <Text className="text-stone-600 leading-6">
                            {/* FIX 4: Use helper for Bio/Description */}
                            {getLang(monk.bio) || getLang(monk.description) || 'A dedicated spiritual guide with years of experience in Buddhist teachings and meditation practices.'}
                        </Text>
                    </View>

                    {/* Services */}
                    {monk.services && monk.services.length > 0 && (
                        <View className="mt-6">
                            <Text className="text-lg font-semibold text-stone-800 mb-3">
                                Services
                            </Text>
                            {monk.services.map((service: any, index: number) => (
                                <View
                                    key={index}
                                    className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-2"
                                >
                                    <View className="flex-1">
                                        <Text className="text-stone-800 font-medium">
                                            {/* FIX 5: Use helper for Service Name */}
                                            {getLang(service.name)}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Clock size={14} color="#9CA3AF" />
                                            <Text className="ml-1 text-stone-500 text-sm">
                                                {service.duration || '60'} min
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-amber-600 font-bold">
                                        ${service.price || '50'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Availability Status */}
                    <View className="mt-6 bg-white rounded-xl p-4">
                        <View className="flex-row items-center">
                            <View
                                className={`w-3 h-3 rounded-full mr-2 ${monk.isAvailable ? 'bg-green-500' : 'bg-stone-400'
                                    }`}
                            />
                            <Text className="text-stone-700 font-medium">
                                {monk.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Book Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-4 pb-8">
                <Pressable
                    onPress={handleBook}
                    disabled={!monk.isAvailable}
                    className={`rounded-xl py-4 ${monk.isAvailable
                        ? 'bg-amber-600 active:bg-amber-700'
                        : 'bg-stone-300'
                        }`}
                    style={{ minHeight: 52 }}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        {monk.isAvailable ? 'Book Session' : 'Unavailable'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}