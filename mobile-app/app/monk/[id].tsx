import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, StyleSheet } from 'react-native';
import { ScreenWrapper, GlassContainer } from '../../src/components/ui/index';
import { useQuery } from '@tanstack/react-query';
import { getMonks } from '../../lib/api';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Calendar, Sparkles, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function MonkDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    const { data: monks, isLoading } = useQuery({
        queryKey: ['monks'],
        queryFn: getMonks,
    });

    const monk = monks?.find(m => m._id === id || m._id?.toString() === id);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    if (isLoading || !monk) {
        return (
            <ScreenWrapper>
                <View className="flex-1 justify-center items-center bg-[#0F172A]">
                    <ActivityIndicator color="#D4AF37" size="large" />
                </View>
            </ScreenWrapper>
        );
    }

    const HEADER_HEIGHT = height * 0.65;

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                        [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
                        'clamp'
                    )
                },
                {
                    scale: interpolate(
                        scrollY.value,
                        [-HEADER_HEIGHT, 0],
                        [2, 1],
                        'clamp'
                    )
                }
            ],
            opacity: interpolate(
                scrollY.value,
                [0, HEADER_HEIGHT * 0.8],
                [1, 0],
                'clamp'
            )
        };
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                scrollY.value,
                [HEADER_HEIGHT * 0.5, HEADER_HEIGHT * 0.8],
                [0, 1],
                'clamp'
            ),
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [HEADER_HEIGHT * 0.5, HEADER_HEIGHT * 0.8],
                        [-20, 0],
                        'clamp'
                    )
                }
            ]
        };
    });

    return (
        <ScreenWrapper className="bg-[#0F172A]">
            <View className="flex-1 relative bg-[#0F172A]">

                {/* Immersive Parallax Header Background Image */}
                <View style={[StyleSheet.absoluteFill, { height: HEADER_HEIGHT, backgroundColor: '#000' }]}>
                    <Animated.View style={[{ width: '100%', height: '100%' }, imageAnimatedStyle]}>
                        <Image
                            source={{ uri: monk.image }}
                            style={{ width: '100%', height: '100%', opacity: 0.85 }}
                            contentFit="cover"
                            transition={600}
                        />
                        {/* Deep Shadow gradient overlay */}
                        <View className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
                    </Animated.View>
                </View>

                {/* Sticky Header (appears on scroll) */}
                <Animated.View
                    style={[
                        { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, paddingTop: insets.top, backgroundColor: 'rgba(15, 23, 42, 0.85)' },
                        headerAnimatedStyle
                    ]}
                    className="flex-row items-center justify-center pb-4 border-b border-white/10 backdrop-blur-xl"
                >
                    <Text className="text-lg font-serif font-bold text-white shadow-sm">{monk.name[lang] || monk.name.en}</Text>
                </Animated.View>

                {/* Floating Back Button (Frosted effect) */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    style={{ position: 'absolute', top: insets.top + 8, left: 24, zIndex: 50 }}
                >
                    <GlassContainer className="w-12 h-12 p-0 rounded-full bg-black/20">
                        <ArrowLeft size={24} color="#FFF" />
                    </GlassContainer>
                </TouchableOpacity>

                {/* Scrollable Content */}
                <Animated.ScrollView
                    contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 100, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                >
                    <View className="bg-[#0F172A] rounded-t-[40px] px-8 pt-10 min-h-screen">

                        {/* Title Badge overlay */}
                        <Animated.View entering={FadeInDown.delay(200).duration(800)} className="absolute -top-6 left-8">
                            <View className="bg-white/10 border border-[#D4AF37]/40 px-6 py-2 rounded-full backdrop-blur-md">
                                <Text className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[4px]">
                                    {monk.title[lang] || monk.title.en}
                                </Text>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(300).duration(800)} className="mb-4 mt-2">
                            <Text className="text-[40px] font-serif font-bold text-white tracking-tight leading-[48px] mb-2 shadow-2xl">
                                {monk.name[lang] || monk.name.en}
                            </Text>

                            {monk.isSpecial && (
                                <View className="flex-row items-center mt-1">
                                    <Sparkles size={16} color="#D4AF37" />
                                    <Text className="text-[10px] font-bold text-[#D4AF37] ml-2 uppercase tracking-[3px]">Master Guide</Text>
                                </View>
                            )}
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).duration(800)} className="flex-row gap-3 mt-4 flex-wrap mb-10">
                            {monk.specialties?.map((s, i) => (
                                <View key={`${i}-${s}`} className="bg-white/5 border border-white/10 px-5 py-2 rounded-full">
                                    <Text className="text-xs font-bold tracking-wider text-slate-300 uppercase">{s}</Text>
                                </View>
                            ))}
                        </Animated.View>

                        {/* Visual Stats Row */}
                        <Animated.View entering={FadeInDown.delay(500).duration(800)} className="flex-row justify-between items-center mb-12 bg-white/5 p-8 rounded-[32px] border border-white/10 shadow-2xl" style={{ elevation: 5 }}>
                            <View className="items-center flex-1">
                                <Text className="text-[32px] font-serif font-bold text-white mb-1 shadow-sm">{monk.yearsOfExperience}+</Text>
                                <Text className="text-[10px] text-[#D4AF37] uppercase tracking-[3px] font-bold">Years</Text>
                            </View>
                            <View className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent" />
                            <View className="items-center flex-1">
                                <Text className="text-[32px] font-serif font-bold text-white mb-1 shadow-sm">1k+</Text>
                                <Text className="text-[10px] text-[#D4AF37] uppercase tracking-[3px] font-bold">Seekers</Text>
                            </View>
                            <View className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent" />
                            <View className="items-center flex-1">
                                <Text className="text-[32px] font-serif font-bold text-white mb-1 shadow-sm">4.9</Text>
                                <View className="flex-row items-center mt-1">
                                    <Star size={10} color="#D4AF37" fill="#D4AF37" className="mr-1" />
                                    <Text className="text-[10px] text-[#D4AF37] uppercase tracking-[3px] font-bold">Rating</Text>
                                </View>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600).duration(800)}>
                            <View className="flex-row items-center mb-6">
                                <View className="h-4 w-1 bg-[#D4AF37] rounded-full mr-3" />
                                <Text className="text-xl font-serif font-bold text-white">The Journey</Text>
                            </View>
                            <Text className="text-slate-300 leading-8 text-[15px] opacity-90 mb-10 font-serif">
                                {monk.bio[lang] || monk.bio.en}
                            </Text>
                        </Animated.View>

                        <View className="h-32" /> {/* Spacer for bottom button */}
                    </View>
                </Animated.ScrollView>

                {/* Floating "Book Session" Glass Button */}
                <Animated.View
                    entering={FadeInUp.delay(800).duration(1000).springify()}
                    style={{ position: 'absolute', bottom: 40, left: 24, right: 24, zIndex: 50 }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push(`/booking/${monk._id}`);
                        }}
                        activeOpacity={0.9}
                    >
                        <GlassContainer className="flex-row items-center justify-between bg-white/10 p-2 pl-8 rounded-full border border-[#D4AF37]/40 shadow-2xl" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 }}>
                            <Text className="text-white font-bold text-[13px] uppercase tracking-[4px]">
                                Book a Session
                            </Text>
                            <View className="w-14 h-14 bg-[#D4AF37] rounded-full items-center justify-center shadow-lg" style={{ shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 10 }}>
                                <Navigation size={22} color="#0F172A" style={{ transform: [{ rotate: '45deg' }], marginLeft: -2, marginTop: 2 }} />
                            </View>
                        </GlassContainer>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        </ScreenWrapper>
    );
}