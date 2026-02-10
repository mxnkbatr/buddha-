
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { ScreenWrapper, Button, Card } from '../../src/components/ui';
import { useQuery } from '@tanstack/react-query';
import { getMonks } from '../../lib/api';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Calendar, Sparkles } from 'lucide-react-native';

export default function MonkDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    const { data: monks, isLoading } = useQuery({
        queryKey: ['monks'],
        queryFn: getMonks,
    });

    const monk = monks?.find(m => m._id === id || m._id?.toString() === id);

    if (isLoading || !monk) {
        return (
            <ScreenWrapper>
                <SafeAreaView className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#795548" size="large" />
                </SafeAreaView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <SafeAreaView className="flex-1 relative">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-4 left-6 z-10 bg-white/50 p-2 rounded-full"
                >
                    <ArrowLeft size={24} color="#795548" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    <View className="items-center pt-8 pb-6 px-6 bg-monk-bg">
                        <Image
                            source={{ uri: monk.image }}
                            style={{ width: 160, height: 200, borderRadius: 12, marginBottom: 16 }}
                            contentFit="cover"
                        />
                        <View className="items-center">
                            <Text className="text-sm font-bold text-monk-accent uppercase tracking-wider mb-1">
                                {monk.title[lang] || monk.title.en}
                            </Text>
                            <Text className="text-3xl font-serif font-bold text-monk-primary text-center mb-2">
                                {monk.name[lang] || monk.name.en}
                            </Text>
                            {monk.isSpecial && (
                                <View className="flex-row items-center bg-monk-accent/10 px-3 py-1 rounded-full mb-3">
                                    <Star size={14} color="#D4AF37" fill="#D4AF37" className="mr-1" />
                                    <Text className="text-xs font-bold text-monk-accent">Head Monk</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row gap-2 mt-2 flex-wrap justify-center">
                            {monk.specialties?.map((s, i) => (
                                <View key={`${i}-${s}`} className="bg-white border border-stone-100 px-3 py-1 rounded-full">
                                    <Text className="text-xs text-monk-secondary">{s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="px-6 py-6 bg-white rounded-t-3xl min-h-[500px] -mt-4 shadow-sm">

                        <View className="flex-row justify-around mb-8 border-b border-stone-100 pb-6">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-monk-primary">{monk.yearsOfExperience}+</Text>
                                <Text className="text-xs text-monk-secondary uppercase">Years</Text>
                            </View>
                            <View className="w-[1px] bg-stone-100" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-monk-primary">1k+</Text>
                                <Text className="text-xs text-monk-secondary uppercase">Students</Text>
                            </View>
                            <View className="w-[1px] bg-stone-100" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-monk-primary">4.9</Text>
                                <Text className="text-xs text-monk-secondary uppercase">Rating</Text>
                            </View>
                        </View>

                        <Text className="text-lg font-serif font-bold text-monk-primary mb-3">About</Text>
                        <Text className="text-monk-text leading-7 mb-8">
                            {monk.bio[lang] || monk.bio.en}
                        </Text>

                        <Button
                            label="Book a Session"
                            icon={<Calendar size={20} color="white" />}
                            onPress={() => router.push({ pathname: '/booking', params: { monkId: monk?._id?.toString() ?? '' } })}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ScreenWrapper>
    );
}