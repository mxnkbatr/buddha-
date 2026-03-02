import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Calendar, Clock, Check, ArrowLeft, Star, Sparkles } from 'lucide-react-native';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '../../src/components/ui';
import { useUserStore } from '../../store/userStore';
import { useIsAuthenticated } from '../../hooks/useIsAuthenticated';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Service {
    _id?: string;
    id?: string;
    name: any;
    duration: number;
    price: number;
}

interface Monk {
    _id: string;
    name: any;
    image?: string;
    imageUrl?: string;
    specialization?: any;
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
    const { user: clerkUser } = useUser();
    const { user: dbUser } = useUserStore();
    const isAuthenticated = useIsAuthenticated();
    const { i18n } = useTranslation();

    const t_db = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        return data[i18n.language] || data.en || data.mn || '';
    };

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
            const res = await api.post('/bookings', bookingData);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedTime(time);
    }, []);

    const handleServiceSelect = useCallback((service: Service) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedService(service);
    }, []);

    const handleBooking = useCallback(async () => {
        if (!selectedTime || !selectedService) {
            alert('Please select a time slot and service');
            return;
        }

        if (!isAuthenticated) {
            router.push('/(auth)/sign-in');
            return;
        }

        const userName = dbUser?.firstName
            ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
            : clerkUser?.fullName || 'Seeker';
        const userEmail = dbUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
        const userPhone = dbUser?.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || '';

        const bookingData = {
            monkId: id,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            serviceId: selectedService._id || selectedService.id,
            userName,
            userEmail,
            userPhone,
            note: specialRequests || undefined,
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
            <View className="flex-1 bg-[#0F172A] items-center justify-center">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text className="text-monk-primary mt-4 font-bold tracking-widest uppercase text-xs">
                    Summoning...
                </Text>
            </View>
        );
    }

    if (!monk) {
        return (
            <View className="flex-1 bg-[#0F172A] items-center justify-center">
                <Stack.Screen options={{ headerShown: false }} />
                <Text className="text-monk-primary">Mentor not found</Text>
            </View>
        );
    }

    if (bookingSuccess) {
        return (
            <View className="flex-1 bg-[#0F172A] items-center justify-center px-6">
                <Stack.Screen options={{ headerShown: false }} />
                <Animated.View entering={FadeInDown.duration(600)} className="items-center">
                    <View className="w-24 h-24 bg-monk-primary/10 rounded-full items-center justify-center mb-8 border border-monk-primary/30 shadow-2xl" style={{ shadowColor: '#D4AF37', shadowRadius: 30, shadowOpacity: 0.5 }}>
                        <Check size={40} color="#D4AF37" />
                    </View>
                    <Text className="text-4xl font-serif font-bold text-white mb-4 text-center tracking-tight">
                        Sanctuary Secured
                    </Text>
                    <Text className="text-slate-300 text-center mb-12 text-lg leading-8 opacity-90 max-w-[300px]">
                        Your guidance session with <Text className="text-monk-primary font-bold">{t_db(monk.name)}</Text> has been booked for {formattedDate} at {selectedTime}.
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push('/my-bookings');
                        }}
                        activeOpacity={0.9}
                        className="bg-monk-primary rounded-full py-5 w-full shadow-lg border border-monk-primary mb-4"
                        style={{ shadowColor: '#D4AF37', shadowRadius: 15, shadowOpacity: 0.4 }}
                    >
                        <Text className="text-[#0F172A] text-center font-bold text-base tracking-widest uppercase">
                            View Bookings
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="py-4"
                    >
                        <Text className="text-monk-secondary text-center font-bold tracking-widest uppercase text-xs">
                            Return Home
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F172A]">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Parallax Header Element */}
            <View style={{ height: SCREEN_HEIGHT * 0.35, width: '100%', position: 'absolute', top: 0 }}>
                <Image
                    source={{ uri: monk.image || monk.imageUrl || 'https://via.placeholder.com/400' }}
                    style={{ width: '100%', height: '100%', opacity: 0.8 }}
                    contentFit="cover"
                />
                <View className="absolute inset-0 bg-black/30" />
                <View className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />

                <SafeAreaView edges={['top']}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                        className="ml-6 mt-2 w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/20 backdrop-blur-lg"
                    >
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            {/* Bottom-Sheet Style Container */}
            <View className="flex-1 bg-monk-surface rounded-t-[40px] mt-[25%]" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 20 }}>
                <View className="items-center mt-4 mb-2">
                    <View className="w-12 h-1.5 bg-monk-secondary/30 rounded-full" />
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>

                    {/* Monk Info Header */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600)} className="px-8 pb-8 pt-4 border-b border-monk-primary/10 items-center">
                        <View className="bg-monk-primary/10 px-4 py-1.5 rounded-full border border-monk-primary/20 mb-4 shadow-sm">
                            <Text className="text-[10px] font-bold text-monk-primary uppercase tracking-[3px]">
                                {t_db(monk.specialization) || 'Master Guide'}
                            </Text>
                        </View>
                        <Text className="text-4xl font-serif font-bold text-[#0F172A] tracking-tight text-center mb-2">
                            {t_db(monk.name)}
                        </Text>
                        <View className="flex-row items-center justify-center gap-1 opacity-80">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={14} color="#D4AF37" fill="#D4AF37" />
                            ))}
                            <Text className="text-xs font-bold text-[#0F172A] ml-2 tracking-widest">5.0</Text>
                        </View>
                    </Animated.View>

                    {/* Service Selection */}
                    {monk.services && monk.services.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="px-6 pt-8 pb-4 border-b border-monk-primary/10">
                            <Text className="text-xs uppercase tracking-[3px] font-bold text-monk-primary mb-4 ml-2">
                                01. The Path (Service)
                            </Text>
                            {monk.services.map((service, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleServiceSelect(service)}
                                    className={`flex-row items-center justify-between rounded-[24px] px-6 py-5 mb-4 border transition-colors shadow-sm ${selectedService === service
                                        ? 'bg-[#0F172A] border-monk-primary/50'
                                        : 'bg-white border-monk-primary/10'
                                        }`}
                                    style={selectedService === service ? { shadowColor: '#D4AF37', shadowRadius: 15, shadowOpacity: 0.15, elevation: 5 } : {}}
                                >
                                    <View className="flex-1 pr-4">
                                        <Text className={`font-serif font-bold text-xl mb-1 ${selectedService === service ? 'text-monk-primary' : 'text-[#0F172A]'}`}>
                                            {t_db(service.name)}
                                        </Text>
                                        <View className="flex-row items-center opacity-80">
                                            <Clock size={12} color={selectedService === service ? '#D4AF37' : '#64748B'} />
                                            <Text className={`ml-1.5 text-xs font-bold uppercase tracking-widest ${selectedService === service ? 'text-white' : 'text-[#64748B]'}`}>
                                                {service.duration} min session
                                            </Text>
                                        </View>
                                    </View>
                                    <View className={`px-4 py-2 rounded-full border ${selectedService === service ? 'bg-monk-primary/10 border-monk-primary/30' : 'bg-stone-50 border-stone-100'}`}>
                                        <Text className={`font-bold text-lg ${selectedService === service ? 'text-monk-primary' : 'text-[#0F172A]'}`}>
                                            ${service.price}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </Animated.View>
                    )}

                    {/* Date Selection */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600)} className="px-6 py-8 border-b border-monk-primary/10">
                        <Text className="text-xs uppercase tracking-[3px] font-bold text-monk-primary mb-4 ml-2">
                            02. The Alignment (Date)
                        </Text>
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center bg-white rounded-[24px] px-6 py-5 border border-monk-primary/10 shadow-sm"
                        >
                            <View className="w-10 h-10 rounded-full bg-monk-primary/10 items-center justify-center mr-4">
                                <Calendar size={20} color="#D4AF37" />
                            </View>
                            <View>
                                <Text className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest mb-0.5">Selected Date</Text>
                                <Text className="text-[#0F172A] font-serif font-bold text-xl">
                                    {formattedDate}
                                </Text>
                            </View>
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
                    </Animated.View>

                    {/* Time Slot Selection */}
                    <Animated.View entering={FadeInDown.delay(400).duration(600)} className="px-6 py-8 border-b border-monk-primary/10">
                        <Text className="text-xs uppercase tracking-[3px] font-bold text-monk-primary mb-4 ml-2">
                            03. The Moment (Time)
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {TIME_SLOTS.map((time) => (
                                <Pressable
                                    key={time}
                                    onPress={() => handleTimeSelect(time)}
                                    className={`px-6 py-4 rounded-[20px] border shadow-sm ${selectedTime === time
                                        ? 'bg-[#0F172A] border-monk-primary/50'
                                        : 'bg-white border-monk-primary/10'
                                        }`}
                                    style={selectedTime === time ? { shadowColor: '#D4AF37', shadowRadius: 10, shadowOpacity: 0.2, elevation: 4 } : {}}
                                >
                                    <Text
                                        className={`text-center font-bold tracking-[2px] text-sm ${selectedTime === time ? 'text-monk-primary' : 'text-[#0F172A]'
                                            }`}
                                    >
                                        {time}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Special Requests */}
                    <Animated.View entering={FadeInDown.delay(500).duration(600)} className="px-6 py-8">
                        <Text className="text-xs uppercase tracking-[3px] font-bold text-monk-primary mb-4 ml-2">
                            04. The Intention (Notes)
                        </Text>
                        <TextInput
                            value={specialRequests}
                            onChangeText={setSpecialRequests}
                            placeholder="Share your spiritual intentions, questions, or concerns..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="bg-white border border-monk-primary/10 rounded-[24px] px-6 py-6 text-stone-800 shadow-sm text-base leading-6"
                            style={{ minHeight: 140 }}
                        />
                    </Animated.View>
                </ScrollView>

                {/* Fixed Glassmorphic Book Button Container */}
                <Animated.View entering={FadeInUp.delay(800).duration(600)} className="absolute bottom-0 left-0 right-0 bg-[#FDFBF7]/95 border-t border-monk-primary/10 px-6 py-4 pb-8">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleBooking}
                        disabled={!selectedTime || !selectedService || bookingMutation.isPending}
                        className={`rounded-full py-5 flex-row justify-center items-center shadow-2xl border ${selectedTime && selectedService && !bookingMutation.isPending
                            ? 'bg-monk-primary border-monk-primary/80'
                            : 'bg-[#E2E8F0] border-[#CBD5E1] shadow-none'
                            }`}
                        style={selectedTime && selectedService && !bookingMutation.isPending ? { shadowColor: '#D4AF37', shadowRadius: 20, shadowOpacity: 0.4 } : {}}
                    >
                        <Text className={`text-center font-bold tracking-widest text-sm uppercase ${selectedTime && selectedService && !bookingMutation.isPending ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                            {bookingMutation.isPending ? 'Securing Sanctuary...' : 'Confirm Ceremony'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}
