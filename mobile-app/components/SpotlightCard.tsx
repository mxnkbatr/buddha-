import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SpotlightCardProps {
    title: string;
    desc: string;
    icon: LucideIcon;
    onPress?: () => void;
    // We'll stick to the Stone/Amber theme, so color props are optional overrides
    // but the component handles the "spotlight" look via styling
}

export default function SpotlightCard({ title, desc, icon: Icon, onPress }: SpotlightCardProps) {
    return (
        <Pressable
            onPress={onPress}
            className="bg-stone-800 rounded-3xl p-6 mb-4 border border-white/5 relative overflow-hidden active:bg-stone-700/80"
            style={Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            })}
        >
            {/* Background "Highlight" effect (simplified for mobile perf) */}
            <View className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

            <View className="flex-row items-start justify-between mb-4">
                <View className="w-12 h-12 rounded-2xl bg-amber-500/10 items-center justify-center border border-amber-500/20">
                    <Icon size={24} color="#F59E0B" />
                </View>
            </View>

            <Text className="text-xl font-bold text-stone-50 mb-2 leading-tight">
                {title}
            </Text>

            <View className="h-[1px] w-10 bg-stone-600 mb-3 opacity-50" />

            <Text className="text-stone-400 text-sm leading-relaxed">
                {desc}
            </Text>
        </Pressable>
    );
}
