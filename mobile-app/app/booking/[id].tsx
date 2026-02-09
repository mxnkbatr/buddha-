import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Calendar, Clock, Check } from 'lucide-react-native';
import api from '../../lib/api';

interface Service {
    _id?: string;
    name: string;
    duration: number;
    price: number;
}

interface Monk {
    _id: string;
    name: string;
    imageUrl?: string;
    specialization?: string;
    services?: Service[];
}

const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00'
];

export default function MonkBookingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isSignedIn } = useAuth();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [specialRequests, setSpecialRequests] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const { data: monk, isLoading } = useQuery({
        queryKey: ['monk', id],
        queryFn: async () => {
            const res = await api.get(`/monks/${id}`);
            return res.data as Monk;
        },
    });

    const bookingMutation = useMutation({
        mutationFn: async (bookingData: any) => {
            const res = await api.post('/bookings/monk', bookingData);
            return res.data;
        },
        onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setBookingSuccess(true);
        },
        onError: (error: any) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert(error.response?.data?.message || 'Booking failed. Please try again.');
        },
    });

    const handleDateChange = useCallback((event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    }, []);

    const handleTimeSelect = useCallback((time: string) => {
        Haptics.selectionAsync();
        setSelectedTime(time);
    }, []);

    const handleServiceSelect = useCallback((service: Service) => {
        Haptics.selectionAsync();
        setSelectedService(service);
    }, []);

    const handleBooking = useCallback(async () => {
        if (!selectedTime || !selectedService) {
            alert('Please select a time slot and service');
            return;
        }

        if (!isSignedIn) {
            router.push('/(auth)/sign-in');
            return;
        }

        const bookingData = {
            monkId: id,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            serviceId: selectedService._id,
            serviceName: selectedService.name,
            duration: selectedService.duration,
            price: selectedService.price,
            specialRequests,
        };

        bookingMutation.mutate(bookingData);
    }, [id, selectedDate, selectedTime, selectedService, specialRequests, isSignedIn, bookingMutation, router]);

    const formattedDate = useMemo(() => {
        return selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, [selectedDate]);

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

    if (bookingSuccess) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center px-6">
                <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-6">
                    <Check size={48} color="white" />
                </View>
                <Text className="text-2xl font-bold text-stone-800 mb-2 text-center">
                    Booking Confirmed!
                </Text>
                <Text className="text-stone-600 text-center mb-8">
                    Your session with {monk.name} has been booked for {formattedDate} at {selectedTime}.
                </Text>
                <Pressable
                    onPress={() => router.push('/my-bookings')}
                    className="bg-amber-600 rounded-xl py-4 px-8 w-full active:bg-amber-700"
                    style={{ minHeight: 52 }}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        View My Bookings
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => router.back()}
                    className="mt-3 py-3"
                    style={{ minHeight: 44 }}
                >
                    <Text className="text-amber-600 text-center font-medium">
                        Back to Monks
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-stone-50">
            <Stack.Screen
                options={{
                    headerTitle: 'Book Session',
                    headerBackTitle: 'Back',
                }}
            />

            <ScrollView className="flex-1">
                {/* Monk Info */}
                <View className="bg-white px-6 py-4 border-b border-stone-200">
                    <View className="flex-row items-center">
                        <Image
                            source={{ uri: monk.imageUrl || 'https://via.placeholder.com/60' }}
                            style={{ width: 60, height: 60, borderRadius: 30 }}
                            contentFit="cover"
                        />
                        <View className="ml-4 flex-1">
                            <Text className="text-lg font-bold text-stone-800">
                                {monk.name}
                            </Text>
                            <Text className="text-stone-600">
                                {monk.specialization || 'Spiritual Guidance'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Date Selection */}
                <View className="px-6 py-6">
                    <Text className="text-lg font-semibold text-stone-800 mb-3">
                        Select Date
                    </Text>
                    <Pressable
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-stone-300"
                        style={{ minHeight: 56 }}
                    >
                        <Calendar size={20} color="#78716C" />
                        <Text className="ml-3 text-stone-800 flex-1">
                            {formattedDate}
                        </Text>
                    </Pressable>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>

                {/* Service Selection */}
                {monk.services && monk.services.length > 0 && (
                    <View className="px-6 pb-6">
                        <Text className="text-lg font-semibold text-stone-800 mb-3">
                            Select Service
                        </Text>
                        {monk.services.map((service, index) => (
                            <Pressable
                                key={index}
                                onPress={() => handleServiceSelect(service)}
                                className={`flex-row items-center justify-between bg-white rounded-xl px-4 py-4 mb-2 border-2 ${selectedService?.name === service.name
                                        ? 'border-amber-600'
                                        : 'border-transparent'
                                    }`}
                                style={{ minHeight: 72 }}
                            >
                                <View className="flex-1">
                                    <Text className="text-stone-800 font-medium">
                                        {service.name}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Clock size={14} color="#9CA3AF" />
                                        <Text className="ml-1 text-stone-500 text-sm">
                                            {service.duration} min
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-amber-600 font-bold text-lg">
                                    ${service.price}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Time Slot Selection */}
                <View className="px-6 pb-6">
                    <Text className="text-lg font-semibold text-stone-800 mb-3">
                        Select Time
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {TIME_SLOTS.map((time) => (
                            <Pressable
                                key={time}
                                onPress={() => handleTimeSelect(time)}
                                className={`px-4 py-3 rounded-xl ${selectedTime === time
                                        ? 'bg-amber-600'
                                        : 'bg-white border border-stone-300'
                                    }`}
                                style={{ minWidth: 90, minHeight: 48 }}
                            >
                                <Text
                                    className={`text-center font-medium ${selectedTime === time ? 'text-white' : 'text-stone-700'
                                        }`}
                                >
                                    {time}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Special Requests */}
                <View className="px-6 pb-24">
                    <Text className="text-lg font-semibold text-stone-800 mb-3">
                        Special Requests (Optional)
                    </Text>
                    <TextInput
                        value={specialRequests}
                        onChangeText={setSpecialRequests}
                        placeholder="Any special requests or questions..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        className="bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-800"
                        style={{ minHeight: 100 }}
                    />
                </View>
            </ScrollView>

            {/* Fixed Book Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-4 pb-8">
                <Pressable
                    onPress={handleBooking}
                    disabled={!selectedTime || !selectedService || bookingMutation.isPending}
                    className={`rounded-xl py-4 ${selectedTime && selectedService && !bookingMutation.isPending
                            ? 'bg-amber-600 active:bg-amber-700'
                            : 'bg-stone-300'
                        }`}
                    style={{ minHeight: 52 }}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
