import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Users, Globe, Lock, Zap, ArrowLeft, Orbit } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import SpotlightCard from '../components/SpotlightCard';

export default function AboutScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    // Static content for now (similar to web)
    const cards = [
        {
            title: "Expert Guidance",
            desc: "Experienced masters guiding your path.",
            icon: Users,
        },
        {
            title: "Anytime Access",
            desc: "Connect instantly from anywhere on Earth.",
            icon: Globe,
        },
        {
            title: "Full Privacy",
            desc: "Your sessions are strictly confidential.",
            icon: Lock,
        },
        {
            title: "Seamless Tech",
            desc: "Effortless booking & secure payments.",
            icon: Zap,
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-stone-900" edges={['top']}>
            {/* Simple Header */}
            <View className="px-6 py-4 flex-row items-center">
                <ArrowLeft
                    size={24}
                    color="#D6D3D1"
                    onPress={() => router.back()}
                />
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Section */}
                <Animated.View
                    entering={FadeInDown.delay(100).duration(800)}
                    className="items-center py-10"
                >
                    <View className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-stone-800/50 mb-8 backdrop-blur-sm">
                        <Orbit size={14} color="#F59E0B" />
                        <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
                            Our Story
                        </Text>
                    </View>

                    <Text className="text-5xl font-bold text-stone-50 text-center leading-tight mb-2">
                        Heritage
                    </Text>
                    <Text className="text-5xl font-light italic text-amber-500 text-center leading-tight mb-8">
                        & Future
                    </Text>

                    <Text className="text-lg text-stone-400 text-center font-light leading-relaxed mb-10">
                        Bridging ancient wisdom with modern technology to bring clarity to the digital age.
                    </Text>
                </Animated.View>

                {/* Cards Grid */}
                <View className="space-y-4">
                    {cards.map((card, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(300 + index * 100).duration(600)}
                        >
                            <SpotlightCard
                                title={card.title}
                                desc={card.desc}
                                icon={card.icon}
                            />
                        </Animated.View>
                    ))}
                </View>

                {/* Bottom Section */}
                <View className="py-20 items-center">
                    <Text className="text-3xl font-bold text-stone-50 text-center mb-4">
                        Our Noble
                    </Text>
                    <Text className="text-3xl font-light italic text-amber-500 text-center mb-8">
                        Mission
                    </Text>

                    <View className="pl-6 border-l-2 border-amber-500/30">
                        <Text className="text-xl font-medium italic text-stone-300">
                            "Wisdom in your hands."
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
