import { ScrollView, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Calendar, Quote, Sparkles } from 'lucide-react-native';
import { useUserStore } from '../../store/userStore';
import { useQuery } from '@tanstack/react-query';
import { getMonks } from '../../lib/api';
import { Image } from 'expo-image';
import { Video } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '@clerk/clerk-expo';

export default function HomeScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { user } = useUserStore();

    // Mock specific data for "Zen" vibe
    const dailyMantra = "Peace comes from within. Do not seek it without.";
    const dailyMantraAuthor = "Buddha";

    const { data: monks } = useQuery({
        queryKey: ['monks'],
        queryFn: getMonks,
    });

    const { isSignedIn } = useAuth();
    const { data: bookings } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            if (!isSignedIn) return [];
            const res = await api.get('/bookings');
            return res.data;
        },
        enabled: !!isSignedIn,
    });

    // Find active session (confirmed monk booking within 15 mins)
    const activeSession = bookings?.find((b: any) => {
        if (b.status !== 'confirmed' || b.type !== 'monk') return false;

        // Check if time is within window (mocking 'now' overlap for simplicity or rigorous check)
        // For this feature, we assume if it's confirmed and today, it's "Live" or "Upcoming"
        // In real app, check specific time window (start_time - 15m <= now <= end_time)
        const bookingDate = new Date(b.date);
        const now = new Date();
        const isSameDay = bookingDate.toDateString() === now.toDateString();
        return isSameDay;
    });

    // Sort logic handled by backend usually, but for "Featured" we can take the first few
    const featuredMonks = monks?.slice(0, 5) || [];
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View className="px-6 pt-8 pb-6 flex-row justify-between items-start">
                    <View>
                        <Text className="text-monk-text text-lg font-medium">Good Morning,</Text>
                        <Text className="text-3xl font-serif text-monk-primary font-bold mt-1">
                            {user?.firstName || 'Seeker'}
                        </Text>
                    </View>
                    {user?.karma ? (
                        <View className="bg-monk-accent/20 px-3 py-1 rounded-full flex-row items-center">
                            <Sparkles size={14} color="#D97706" className="mr-1" />
                            <Text className="text-monk-primary font-bold">{user.karma} Karma</Text>
                        </View>
                    ) : null}
                </View>

                {/* Live Now / One-Tap Join Card - High Priority */}
                {activeSession && (
                    <View className="px-4 mb-6">
                        <TouchableOpacity
                            onPress={() => router.push(`/live-session/${activeSession._id}`)}
                            activeOpacity={0.9}
                        >
                            <Card className="bg-monk-deep-red border-monk-gold/30 p-0 overflow-hidden flex-row items-center">
                                <View className="p-4 flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                                        <Text className="text-white/90 font-bold uppercase text-xs tracking-wider">
                                            {activeSession.status === 'confirmed' ? (i18n.language === 'mn' ? 'Уншлага эхэллээ' : 'Reading Started') : 'Live Now'}
                                        </Text>
                                    </View>
                                    <Text className="text-monk-gold font-serif font-bold text-xl mb-1">
                                        {activeSession.monkName?.mn || activeSession.monkName?.en || 'Monk Session'}
                                    </Text>
                                    <Text className="text-white/60 text-xs">
                                        Tap to join video call immediately
                                    </Text>
                                </View>
                                <View className="bg-monk-gold/10 h-full px-5 justify-center items-center border-l border-monk-gold/10">
                                    <View className="bg-monk-gold w-10 h-10 rounded-full justify-center items-center shadow-lg shadow-black/20">
                                        <Video size={20} color="#800000" fill="#800000" />
                                    </View>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Daily Wisdom Card */}
                <View className="px-4 mb-8">
                    <Card className="bg-monk-surface/80 border-monk-secondary/20">
                        <Quote size={24} color="#78716C" className="mb-4 opacity-50" />
                        <Text className="text-xl font-serif text-monk-text italic leading-8 text-center">
                            "{dailyMantra}"
                        </Text>
                        <Text className="text-right text-monk-secondary mt-4 font-medium">— {dailyMantraAuthor}</Text>
                    </Card>
                </View>

                {/* Main Action: Book Ceremony */}
                <View className="px-4 mb-8">
                    <Card className="bg-monk-primary border-none p-0 overflow-hidden min-h-[200px] justify-end">
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1600609842388-3e4b7c8d9e76?q=80&w=800&auto=format&fit=crop' }}
                            className="absolute inset-0 opacity-40"
                            resizeMode="cover"
                        />
                        <View className="p-6 bg-gradient-to-t from-monk-primary/90 to-transparent">
                            <Text className="text-monk-accent text-lg font-medium mb-1">Begin Your Journey</Text>
                            <Text className="text-white text-2xl font-serif font-bold mb-4">Book a Sacred Ceremony</Text>
                            <Button
                                title="View Rituals"
                                variant="secondary"
                                onPress={() => router.push('/rituals')}
                                icon={<Calendar size={18} color="white" />}
                            />
                        </View>
                    </Card>
                </View>

                {/* Featured Monks Section */}
                <View className="px-6 mb-4 flex-row justify-between items-end">
                    <View>
                        <Text className="text-lg font-bold text-monk-text">Featured Monks</Text>
                        <Text className="text-xs text-monk-secondary">Guided by wisdom</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/monks')}>
                        <Text className="text-monk-accent font-bold">View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }} className="gap-4">
                    {featuredMonks.map((monk) => (
                        <TouchableOpacity
                            key={monk._id?.toString()}
                            activeOpacity={0.8}
                            onPress={() => router.push(`/monk/${monk._id}`)}
                        >
                            <Card className="w-[140px] h-[190px] p-0 overflow-hidden border-stone-100 bg-white">
                                <Image
                                    source={{ uri: monk.image }}
                                    style={{ width: '100%', height: 120 }}
                                    contentFit="cover"
                                />
                                <View className="p-2">
                                    <Text numberOfLines={1} className="text-[10px] font-bold text-monk-accent uppercase tracking-wider mb-0.5">
                                        {monk.title[lang] || monk.title.en}
                                    </Text>
                                    <Text numberOfLines={1} className="text-sm font-serif font-bold text-monk-primary">
                                        {monk.name[lang] || monk.name.en}
                                    </Text>
                                    <Text numberOfLines={1} className="text-[10px] text-monk-secondary mt-1">
                                        {monk.specialties?.[0] || 'Meditation'}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recent or Recommendations (Placeholder) */}
                <View className="px-6 mt-8">
                    <Text className="text-lg font-bold text-monk-text mb-4">Suggested for You</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="w-[160px] h-[120px] justify-center items-center bg-white">
                                <Text className="text-monk-secondary">Ritual {i}</Text>
                            </Card>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
