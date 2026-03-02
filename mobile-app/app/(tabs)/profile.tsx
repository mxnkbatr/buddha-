import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Settings, LogOut, ChevronRight, User as UserIcon, Calendar, Heart, Sparkles, Moon, Edit3, Globe, Phone, Mail, Cake, TrendingUp, CheckCircle } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useIsAuthenticated } from '../../hooks/useIsAuthenticated';
import { useEffect, useState } from 'react';
import { ZodiacDisplay, getZodiacByKey } from '../../components/profile/ZodiacYearPicker';
import { useTranslation } from 'react-i18next';
import { changeLanguage, supportedLanguages } from '../../lib/i18n';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate } from 'react-native-reanimated';

export default function ProfileScreen() {
    const router = useRouter();
    const { isSignedIn, signOut } = useAuth();
    const { user: clerkUser } = useUser();
    const { user: dbUser, fetchProfile, isLoading } = useUserStore();
    const { isCustomAuth, customUser, logout: customLogout } = useAuthStore();
    const isAuthenticated = useIsAuthenticated();
    const [refreshing, setRefreshing] = useState(false);
    const { i18n } = useTranslation();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    const isMonk = dbUser?.role === 'monk';

    // Fetch bookings for stats (like parent dashboard)
    const { data: bookings } = useQuery({
        queryKey: ['profile-bookings', dbUser?._id],
        queryFn: async () => {
            if (!dbUser?._id) return [];
            const param = isMonk ? `monkId=${dbUser._id}` : `userId=${dbUser._id}`;
            const res = await api.get(`/bookings?${param}`);
            return res.data;
        },
        enabled: isAuthenticated && !!dbUser?._id,
    });

    const acceptedCount = bookings?.filter((b: any) => ['confirmed', 'completed'].includes(b.status)).length || 0;
    const isSpecial = (dbUser as any)?.isSpecial === true;
    const rate = isSpecial ? 88800 : 40000;
    const totalEarnings = acceptedCount * rate;

    // Scroll Animation Value for Parallax
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        // When pulling down (negative scrollY), scale up and translate down slightly
        // When scrolling up (positive scrollY), just return to normal 
        const scale = interpolate(scrollY.value, [-100, 0, 100], [1.15, 1, 0.95], 'clamp');
        const translateY = interpolate(scrollY.value, [-100, 0, 100], [-20, 0, 0], 'clamp');
        return {
            transform: [{ scale }, { translateY }],
        };
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    const getName = () => {
        const name = (dbUser as any)?.name;
        if (name && typeof name === 'object') {
            return name[lang] || name.en || name.mn || '';
        }
        const first = dbUser?.firstName || customUser?.firstName || clerkUser?.firstName || '';
        const last = dbUser?.lastName || customUser?.lastName || clerkUser?.lastName || '';
        return `${first} ${last}`.trim();
    };

    const getTitle = () => {
        const title = (dbUser as any)?.title;
        if (title && typeof title === 'object') {
            return title[lang] || title.en || title.mn || '';
        }
        return '';
    };

    const getPhone = () => dbUser?.phone || customUser?.phone || '';
    const getEmail = () => dbUser?.email || customUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch { return dateStr; }
    };

    if (!isAuthenticated) {
        return (
            <ScreenWrapper className="justify-center items-center px-6">
                <View className="w-24 h-24 bg-earth-200 rounded-full items-center justify-center mb-6">
                    <UserIcon size={48} color="#78716C" />
                </View>
                <Text className="text-3xl font-serif text-monk-primary font-bold mb-2">
                    Welcome
                </Text>
                <Text className="text-monk-text text-center mb-8">
                    Sign in to book sessions, manage your bookings, and more
                </Text>

                <Button
                    title="Sign In"
                    onPress={() => router.push('/(auth)/sign-in')}
                    className="w-full mb-4"
                />

                <Button
                    title="Create Account"
                    variant="outline"
                    onPress={() => router.push('/(auth)/sign-up')}
                    className="w-full"
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper className="bg-monk-bg">
            <SafeAreaView className="flex-1" edges={['top']}>
                <Animated.ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} tintColor="#D4AF37" progressViewOffset={40} />
                    }
                >
                    {/* Immersive Profile Header Card with Parallax */}
                    <Animated.View style={headerAnimatedStyle} className="mx-4 mt-4 rounded-[40px] overflow-hidden bg-[#0F172A] p-6 shadow-2xl">
                        <View className="absolute top-0 right-0 w-32 h-32 bg-monk-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <View className="absolute bottom-0 left-0 w-40 h-40 bg-monk-primary/5 rounded-full blur-3xl -ml-16 -mb-16" />

                        <View className="items-center z-10">
                            <View className="relative shadow-lg" style={{ shadowColor: '#D4AF37', shadowRadius: 20, shadowOpacity: 0.3 }}>
                                <Image
                                    source={{ uri: (dbUser as any)?.image || dbUser?.avatar || clerkUser?.imageUrl || 'https://via.placeholder.com/150' }}
                                    style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#D4AF37' }}
                                    contentFit="cover"
                                    transition={500}
                                />
                                {isMonk && (
                                    <View className="absolute bottom-0 right-0 bg-monk-primary p-1.5 rounded-full border-2 border-[#0F172A]">
                                        <Sparkles size={14} color="#0F172A" />
                                    </View>
                                )}
                            </View>

                            <Text className="text-3xl font-serif font-bold text-monk-bg mt-5 tracking-tight shadow-sm shadow-monk-primary/20">
                                {getName() || 'Seeker'}
                            </Text>

                            <View className={`mt-3 px-5 py-1.5 rounded-full border ${isMonk ? 'bg-monk-primary/20 border-monk-primary/50' : 'bg-white/10 border-white/20'}`}>
                                <Text className={`text-xs font-bold uppercase tracking-widest ${isMonk ? 'text-monk-primary' : 'text-monk-bg'}`}>
                                    {isMonk ? (getTitle() || (lang === 'mn' ? 'Лам' : 'Monk')) : (lang === 'mn' ? 'Эрхэм сүсэгтэн' : 'Seeker')}
                                </Text>
                            </View>

                            {/* Contact Info */}
                            <View className="mt-5 w-full flex-row justify-center items-center flex-wrap gap-x-4 gap-y-2">
                                {getPhone() ? (
                                    <View className="flex-row items-center">
                                        <Phone size={12} color="#94A3B8" />
                                        <Text className="text-slate-400 ml-1.5 text-xs tracking-wider">{getPhone()}</Text>
                                    </View>
                                ) : null}
                                {dbUser?.dateOfBirth ? (
                                    <View className="flex-row items-center">
                                        <Cake size={12} color="#94A3B8" />
                                        <Text className="text-slate-400 ml-1.5 text-xs tracking-wider">{formatDate(dbUser.dateOfBirth as string)}</Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Zodiac */}
                            {dbUser?.zodiacYear && (
                                <View className="flex-row items-center mt-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                    <ZodiacDisplay zodiacKey={dbUser.zodiacYear} size="small" />
                                    <Text className="text-slate-300 ml-2 font-medium tracking-widest uppercase text-[10px]">
                                        {getZodiacByKey(dbUser.zodiacYear)?.mn || getZodiacByKey(dbUser.zodiacYear)?.en}
                                    </Text>
                                </View>
                            )}

                            {/* Edit Profile Button */}
                            <Pressable
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/edit-profile');
                                }}
                                className="mt-6 flex-row items-center justify-center bg-monk-primary px-6 py-3 rounded-full w-full active:opacity-80 border-t border-monk-primary/50 shadow-lg"
                                style={{ shadowColor: '#D4AF37', shadowRadius: 10, shadowOpacity: 0.2 }}
                            >
                                <Edit3 size={16} color="#0F172A" />
                                <Text className="text-[#0F172A] font-bold tracking-widest uppercase text-xs ml-2">
                                    {lang === 'mn' ? 'Профайл засах' : 'Edit Profile'}
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* Stats Dashboard */}
                    {dbUser && (
                        <View className="mx-4 mt-4 flex-row justify-between gap-3">
                            {isMonk ? (
                                <>
                                    <StatItem
                                        icon={<TrendingUp size={18} color="#D4AF37" />}
                                        value={`${totalEarnings.toLocaleString()}₮`}
                                        label={lang === 'mn' ? 'Орлого' : 'Earnings'}
                                    />
                                    <StatItem
                                        icon={<CheckCircle size={18} color="#D4AF37" />}
                                        value={String(acceptedCount)}
                                        label={lang === 'mn' ? 'Захиалга' : 'Bookings'}
                                    />
                                    <StatItem
                                        icon={<Sparkles size={18} color="#D4AF37" />}
                                        value={String(dbUser.karma || 0)}
                                        label="Karma"
                                    />
                                </>
                            ) : (
                                <>
                                    <StatItem
                                        icon={<Sparkles size={18} color="#D4AF37" />}
                                        value={String(dbUser.karma || 0)}
                                        label="Karma"
                                    />
                                    <StatItem
                                        icon={<Moon size={18} color="#0F172A" />}
                                        value={String(dbUser.meditationDays || 0)}
                                        label={lang === 'mn' ? 'Хоног' : 'Days'}
                                    />
                                    <StatItem
                                        icon={<Heart size={18} color="#0F172A" />}
                                        value={String(dbUser.totalMerits || 0)}
                                        label={lang === 'mn' ? 'Буян' : 'Merits'}
                                    />
                                </>
                            )}
                        </View>
                    )}

                    {/* Navigation Menu */}
                    <View className="mt-8 px-4">
                        <Text className="text-[10px] font-bold tracking-[3px] text-monk-secondary uppercase px-2 mb-3">
                            {lang === 'mn' ? 'Миний бүртгэл' : 'Account Management'}
                        </Text>
                        <View className="bg-monk-surface rounded-3xl border border-monk-primary/10 overflow-hidden shadow-sm">
                            <MenuItem icon={<Calendar size={18} color="#0F172A" />} title={lang === 'mn' ? 'Миний захиалгууд' : 'My Bookings'} onPress={() => router.push('/my-bookings')} isFirst />
                            <MenuItem icon={<Heart size={18} color="#0F172A" />} title={lang === 'mn' ? 'Дуртай' : 'Favorites'} onPress={() => router.push('/favorites')} />
                            <MenuItem icon={<Settings size={18} color="#0F172A" />} title={lang === 'mn' ? 'Тохиргоо' : 'Settings'} onPress={() => router.push('/settings')} isLast />
                        </View>
                    </View>

                    {/* Language Settings */}
                    <View className="mt-8 px-4">
                        <Text className="text-[10px] font-bold tracking-[3px] text-monk-secondary uppercase px-2 mb-3">
                            {lang === 'mn' ? 'Хэл' : 'Language'}
                        </Text>
                        <View className="bg-monk-surface rounded-3xl p-2 border border-monk-primary/10 shadow-sm flex-row">
                            {supportedLanguages.map((l: any) => (
                                <Pressable
                                    key={l.code}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        changeLanguage(l.code);
                                    }}
                                    className={`flex-1 py-4 rounded-2xl items-center ${i18n.language === l.code ? 'bg-[#0F172A] shadow-md border-b-2 border-monk-primary' : 'bg-transparent'}`}
                                >
                                    <Text className={`font-bold tracking-widest uppercase text-[11px] ${i18n.language === l.code ? 'text-monk-primary' : 'text-monk-text'}`}>
                                        {l.nativeName}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Sign Out */}
                    <View className="mt-10 px-4">
                        <Pressable
                            onPress={async () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                if (isCustomAuth) await customLogout();
                                if (isSignedIn) await signOut();
                                router.replace('/(auth)/sign-in');
                            }}
                            className="flex-row items-center justify-center bg-white rounded-full py-4 px-6 border border-red-100 shadow-sm active:opacity-70"
                        >
                            <LogOut size={18} color="#EF4444" />
                            <Text className="text-red-500 font-bold tracking-widest uppercase text-xs ml-3">
                                {lang === 'mn' ? 'Гарах' : 'Sign Out'}
                            </Text>
                        </Pressable>
                    </View>

                </Animated.ScrollView>
            </SafeAreaView>
        </ScreenWrapper>
    );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <View className="flex-1 items-center bg-monk-surface p-4 rounded-3xl shadow-sm border border-monk-primary/10">
            <View className="w-10 h-10 rounded-full bg-monk-primary/10 items-center justify-center mb-2">
                {icon}
            </View>
            <Text className="text-xl font-serif font-bold text-monk-text tracking-tight">{value}</Text>
            <Text className="text-[9px] text-monk-secondary uppercase tracking-[2px] mt-1 font-bold">{label}</Text>
        </View>
    );
}

function MenuItem({ icon, title, onPress, isFirst, isLast }: { icon: React.ReactNode, title: string, onPress: () => void, isFirst?: boolean, isLast?: boolean }) {
    return (
        <Pressable
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            className={`flex-row items-center bg-transparent px-5 py-5 active:bg-monk-primary/5 ${!isLast ? 'border-b border-monk-primary/10' : ''}`}
        >
            <View className="w-8 h-8 rounded-full bg-[#FDFBF7] items-center justify-center mr-4 border border-monk-primary/20">
                {icon}
            </View>
            <Text className="text-monk-text font-medium text-sm flex-1 tracking-wide">{title}</Text>
            <ChevronRight size={18} color="#1E293B" opacity={0.3} />
        </Pressable>
    );
}
