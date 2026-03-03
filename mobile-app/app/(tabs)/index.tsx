import React from 'react';
import { ScrollView, View, Text, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getMonks } from '../../lib/api';
import { Image } from 'expo-image';
import { ArrowRight, Sparkles, Users, Video, BookOpen, Quote, Star } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, SharedValue, Extrapolation } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COMMENTS = [
    {
        name: 'Munkhbaatar D.',
        role: 'Seeker',
        text: 'Хүүхдүүд маань энэ сайтыг зааж өгөөд, багштай холбож өгсөн. Дүрс нь маш тод, дуу нь цэвэрхэн. Их буянтай ажил байна.',
        avatar: 'https://i.pravatar.cc/150?u=1',
    },
    {
        name: 'Sarnai B.',
        role: 'Seeker',
        text: 'Заавал хийд явж дугаарлахгүйгээр, гэрээсээ бүх үйлчилгээгээ аваад, төлбөрөө төлчихдөг нь цаг маш их хэмнэсэн.',
        avatar: 'https://i.pravatar.cc/150?u=2',
    },
    {
        name: 'Bold E.',
        role: 'Seeker',
        text: 'Үзмэрч маань маш тодорхой, ойлгомжтой тайлбарлаж өгсөн. Вэбсайт нь хэрэглэхэд маш хялбар юм байна.',
        avatar: 'https://i.pravatar.cc/150?u=3',
    },
];

function MonkParallaxCard({ monk, index, scrollX, lang, router }: { monk: any, index: number, scrollX: SharedValue<number>, lang: 'en' | 'mn', router: any }) {
    const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
    const SPACING = 24;
    const FULL_SIZE = ITEM_WIDTH + SPACING;

    const animatedImageStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * FULL_SIZE,
            index * FULL_SIZE,
            (index + 1) * FULL_SIZE,
        ];
        const translateX = interpolate(
            scrollX.value,
            inputRange,
            [-100, 0, 100],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [1.2, 1, 1.2],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateX }, { scale }],
        };
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * FULL_SIZE,
            index * FULL_SIZE,
            (index + 1) * FULL_SIZE,
        ];
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.9, 1, 0.9],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <Animated.View style={[{ width: ITEM_WIDTH }, animatedContainerStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
                    router.push(`/monk/${monk._id}`);
                }}
            >
                <View className="rounded-[40px] overflow-hidden border border-white/10 bg-[#0F172A] shadow-2xl"
                    style={{ height: 420, shadowColor: '#000', shadowRadius: 30, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 20 }, elevation: 15 }}
                >
                    <View style={{ width: '100%', height: 300, overflow: 'hidden' }}>
                        <Animated.View style={[{ width: '100%', height: '100%' }, animatedImageStyle]}>
                            <Image
                                source={{ uri: monk.image }}
                                style={{ width: '130%', height: '100%', marginLeft: '-15%' }}
                                contentFit="cover"
                                transition={400}
                            />
                        </Animated.View>
                        <View className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/80 to-transparent" />
                    </View>

                    <View className="absolute bottom-0 w-full p-6 bg-transparent">
                        <View className="flex-row items-center mb-2">
                            <Sparkles size={12} color="#D4AF37" />
                            <Text numberOfLines={1} className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[4px] ml-2">
                                {monk.title?.[lang] || monk.title?.en || 'Master'}
                            </Text>
                        </View>
                        <Text numberOfLines={1} className="text-3xl font-serif text-[#291E14] font-bold mb-1 tracking-tight">
                            {monk.name?.[lang] || monk.name?.en}
                        </Text>
                        <Text numberOfLines={1} className="text-xs text-[#786851] uppercase tracking-widest font-bold mt-1">
                            {monk.specialties?.[0] || 'Meditation'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    const tr = (data: { mn: string; en: string }) => data[lang] || data.en;

    const { data: monks } = useQuery({
        queryKey: ['monks'],
        queryFn: getMonks,
    });

    const featuredMonks = monks?.slice(0, 5) || [];
    const scrollX = useSharedValue(0);
    const mainScrollY = useSharedValue(0);

    const horizontalScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const mainScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            mainScrollY.value = event.contentOffset.y;
        },
    });

    const heroAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        mainScrollY.value,
                        [-100, 0, SCREEN_HEIGHT],
                        [-50, 0, SCREEN_HEIGHT * 0.5],
                        Extrapolation.CLAMP
                    )
                }
            ],
            opacity: interpolate(
                mainScrollY.value,
                [0, SCREEN_HEIGHT * 0.5],
                [1, 0],
                Extrapolation.CLAMP
            )
        };
    });

    const features = [
        {
            icon: <Users size={28} color="#D4AF37" />,
            title: tr({ mn: 'Мэргэжлийн Багш нар', en: 'Expert Masters' }),
            desc: tr({ mn: 'Олон жилийн туршлагатай, шашны гүн ухаанд мэргэшсэн багш нар.', en: 'Experienced masters specialized in spiritual philosophy.' }),
        },
        {
            icon: <Video size={28} color="#D4AF37" />,
            title: tr({ mn: 'Онлайн Засал', en: 'Live Rituals' }),
            desc: tr({ mn: 'Гэрээсээ гаралгүйгээр засал номоо уншуулж, шууд холбогдох боломж.', en: 'Attend rituals and connect live from the comfort of your home.' }),
        },
        {
            icon: <BookOpen size={28} color="#D4AF37" />,
            title: tr({ mn: 'Өв Соёл', en: 'Ancient Wisdom' }),
            desc: tr({ mn: 'Монголчуудын уламжлалт өв соёл, сургаалыг орчин үеийн хэлбэрээр.', en: 'Traditional Mongolian heritage and teachings in a modern format.' }),
        },
    ];

    return (
        <View className="flex-1 bg-[#FDFBF7]">
            <Animated.ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                onScroll={mainScrollHandler}
                scrollEventThrottle={16}
            >
                {/* ===== CINEMATIC HERO SECTION ===== */}
                <View style={{ height: SCREEN_HEIGHT * 0.85, width: SCREEN_WIDTH, overflow: 'hidden' }}>
                    <Animated.View style={[{ width: '100%', height: '100%' }, heroAnimatedStyle]}>
                        <ImageBackground
                            source={{ uri: 'https://res.cloudinary.com/dxoxdiuwr/video/upload/q_60,f_webp,c_fill,w_1280,h_720,so_0/video_kakyvu.webp' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        >
                            {/* Divine Bright Gradients */}
                            <View className="absolute inset-0 bg-[#FDFBF7]/30" />
                            <View className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-[#FDFBF7]/40" />
                        </ImageBackground>
                    </Animated.View>

                    {/* Content (Absolute to overlay the parallaxing background) */}
                    <View className="absolute inset-0 flex-1 justify-end pb-32 px-6">
                        {/* Tagline Badge */}
                        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
                            <View className="self-start px-6 py-2.5 rounded-full border border-white/60 bg-white/40 backdrop-blur-xl mb-8 shadow-sm">
                                <Text className="text-[10px] font-bold tracking-[6px] uppercase text-[#D4AF37]">
                                    Gevabal Sanctuary
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Main Title */}
                        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                            <Text className="text-[56px] font-serif text-[#291E14] leading-[64px] mb-2 font-bold tracking-tight">
                                {tr({ mn: 'Бид таны', en: 'Find your' })}
                            </Text>
                            <Text className="text-[56px] font-serif text-[#D4AF37] leading-[64px] mb-6 font-bold tracking-tight" style={{ textShadowColor: 'rgba(212, 175, 55, 0.4)', textShadowRadius: 20 }}>
                                {tr({ mn: 'асуудлын шийдлийг олоход тань тусална.', en: 'inner peace.' })}
                            </Text>
                        </Animated.View>

                        {/* CTA Button */}
                        <Animated.View entering={FadeInUp.delay(600).duration(1000).springify()}>
                            <TouchableOpacity
                                onPress={() => {
                                    import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
                                    router.push('/(tabs)/monks');
                                }}
                                activeOpacity={0.9}
                                className="flex-row items-center justify-between bg-white/40 p-2 pl-8 rounded-full border border-white/60 backdrop-blur-xl mt-6 max-w-[280px]"
                            >
                                <Text className="text-[#291E14] font-bold text-xs uppercase tracking-[3px]">
                                    {tr({ mn: 'Цаг захиалах', en: 'Begin Journey' })}
                                </Text>
                                <View className="w-12 h-12 bg-[#D4AF37] rounded-full items-center justify-center shadow-md">
                                    <ArrowRight size={20} color="#FFFFFF" />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

                {/* ===== FEATURED MONKS SECTION (PARALLAX HORIZONTAL) ===== */}
                <View className="py-20 bg-[#FDFBF7]">
                    {/* Header */}
                    <View className="items-center mb-16 px-6">
                        <View className="flex-row items-center gap-4 mb-6">
                            <View className="h-[1px] w-12 bg-[#D4AF37]/50" />
                            <Text className="text-xs font-bold tracking-[6px] uppercase text-[#D4AF37]">
                                {tr({ mn: 'Мэргэн Ухаан', en: 'Divine Masters' })}
                            </Text>
                            <View className="h-[1px] w-12 bg-[#D4AF37]/50" />
                        </View>
                        <Text className="text-[40px] font-serif text-[#291E14] text-center font-bold tracking-tight leading-[48px]">
                            {tr({ mn: 'Үзмэрч', en: 'The Mentors' })}
                        </Text>
                    </View>

                    {/* Monks Horizontal Parallax Scroll */}
                    <Animated.ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.75)) / 2, paddingVertical: 20, gap: 24 }}
                        onScroll={horizontalScrollHandler}
                        scrollEventThrottle={16}
                        snapToInterval={(SCREEN_WIDTH * 0.75) + 24} // ITEM_WIDTH + SPACING
                        decelerationRate="fast"
                    >
                        {featuredMonks.map((monk: any, index: number) => (
                            <MonkParallaxCard
                                key={monk._id?.toString() || index}
                                monk={monk}
                                index={index}
                                scrollX={scrollX}
                                lang={lang}
                                router={router}
                            />
                        ))}
                    </Animated.ScrollView>

                    {/* View All */}
                    <View className="items-center mt-16">
                        <TouchableOpacity
                            onPress={() => {
                                import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
                                router.push('/(tabs)/monks');
                            }}
                            activeOpacity={0.8}
                            className="flex-row items-center justify-center pb-2 border-b border-[#D4AF37]/30"
                        >
                            <Text className="text-[#D4AF37] font-bold text-xs uppercase tracking-[4px] mr-3">
                                {tr({ mn: 'Илүү үзэх', en: 'Explore The Order' })}
                            </Text>
                            <ArrowRight size={16} color="#D4AF37" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ===== PHILOSOPHY / VALUES SECTION ===== */}
                <View className="py-24 px-6 bg-[#FDFBF7]">
                    <View className="mb-16">
                        <Text className="text-[10px] font-bold tracking-[4px] uppercase text-[#786851] mb-6 font-serif">
                            01 / {tr({ mn: 'ФИЛОСОФИ', en: 'Philosophy' })}
                        </Text>
                        <Text className="text-[40px] font-serif text-[#291E14] font-bold tracking-tight leading-[48px]">
                            {tr({ mn: 'Бидний Үнэт Зүйл', en: 'Our Sacred Vault' })}
                        </Text>
                    </View>

                    {/* Feature Cards */}
                    <View className="gap-8 mb-16">
                        {features.map((f, i) => (
                            <View key={i} className="bg-white/60 p-8 rounded-[32px] border border-white/80 backdrop-blur-3xl shadow-lg relative overflow-hidden" style={{ shadowColor: '#D4AF37', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 }}>
                                {/* Decorative Glow */}
                                <View className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-[40px] -mr-8 -mt-8" />

                                <View className="w-16 h-16 rounded-2xl bg-[#FFF9E6] items-center justify-center mb-8 border border-white/50 shadow-sm">
                                    {f.icon}
                                </View>
                                <Text className="text-2xl font-serif text-[#291E14] mb-4 font-bold">{f.title}</Text>
                                <Text className="text-[#544636] leading-8 text-[15px]">{f.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ===== TESTIMONIALS SECTION ===== */}
                <View className="py-24 px-6 bg-[#FDFBF7] border-t border-[#D4AF37]/10">
                    <View className="mb-16">
                        <Text className="text-[10px] font-bold tracking-[4px] uppercase text-[#786851] mb-6 font-serif">
                            02 / {tr({ mn: 'Сэтгэгдэл', en: 'Voices' })}
                        </Text>
                        <Text className="text-[40px] font-serif text-[#291E14] font-bold tracking-tight leading-[48px]">
                            {tr({ mn: 'Үйлчлүүлэгчдийн үг', en: 'Echoes of Peace' })}
                        </Text>
                    </View>

                    <View className="gap-8">
                        {COMMENTS.map((c, i) => (
                            <View key={i} className="bg-white/60 p-8 rounded-[32px] border border-white/80 shadow-lg backdrop-blur-xl" style={{ shadowColor: '#D4AF37', shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 }}>
                                <View className="flex-row mb-8">
                                    <Quote size={32} color="#D4AF37" style={{ opacity: 0.5 }} />
                                </View>
                                <Text className="text-[#544636] italic leading-9 text-lg font-serif mb-10">"{c.text}"</Text>

                                <View className="flex-row items-center border-t border-[#E8E0D5] pt-6">
                                    <Image
                                        source={{ uri: c.avatar }}
                                        style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#D4AF37' }}
                                        contentFit="cover"
                                    />
                                    <View className="ml-4 flex-1">
                                        <Text className="font-serif font-bold text-[#291E14] tracking-wide">{c.name}</Text>
                                        <Text className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[2px]">{c.role}</Text>
                                    </View>
                                    <View className="flex-row gap-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={14} color="#D4AF37" fill="#D4AF37" />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}
