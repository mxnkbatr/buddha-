import React, { useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import RenderHtml from 'react-native-render-html';

import api from '../../lib/api';

export default function BlogDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { i18n } = useTranslation();
    const lang = i18n.language === 'mn' ? 'mn' : 'en';

    const { data: post, isLoading } = useQuery({
        queryKey: ['blog', id],
        queryFn: async () => {
            const res = await api.get(`/blogs/${id}`); // Adjust endpoint if needed (might need single fetch)
            // If API returns list, find specific post (rendering optimization)
            if (Array.isArray(res.data)) {
                return res.data.find((p: any) => p._id === id || p.id === id);
            }
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-stone-900 justify-center items-center">
                <Text className="text-amber-500">Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView className="flex-1 bg-stone-900 justify-center items-center">
                <Text className="text-stone-400">Post not found</Text>
                <Text onPress={() => router.back()} className="text-amber-500 mt-4">Go Back</Text>
            </SafeAreaView>
        );
    }

    const title = post.title?.[lang] || post.title?.mn || "No Title";
    const content = post.content?.[lang] || post.content?.mn || "";

    const tagsStyles: any = {
        body: { color: '#D6D3D1', fontSize: 16, lineHeight: 28, fontFamily: 'System' },
        p: { marginBottom: 16 },
        h1: { color: '#FAFAF9', fontSize: 24, fontWeight: '700', marginBottom: 12 },
        h2: { color: '#FAFAF9', fontSize: 20, fontWeight: '700', marginBottom: 12 },
        strong: { color: '#FAFAF9', fontWeight: '700' },
        blockquote: {
            borderLeftWidth: 2,
            borderLeftColor: '#F59E0B',
            paddingLeft: 12,
            fontStyle: 'italic',
            color: '#A8A29E',
            marginVertical: 12
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-900" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-white/5">
                <ArrowLeft
                    size={24}
                    color="#D6D3D1"
                    onPress={() => router.back()}
                />
            </View>

            <ScrollView className="flex-1">
                {post.cover && (
                    <Image
                        source={{ uri: post.cover }}
                        style={{ width: '100%', height: 250 }}
                        contentFit="cover"
                    />
                )}

                <View className="p-6">
                    <View className="flex-row items-center gap-4 mb-6">
                        <View className="flex-row items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                            <Calendar size={12} color="#F59E0B" />
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-stone-400 opacity-80">
                                {new Date(post.date).toLocaleDateString()}
                            </Text>
                        </View>
                        {post.authorName && (
                            <View className="flex-row items-center gap-2">
                                <User size={12} color="#A8A29E" />
                                <Text className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                                    {post.authorName}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-3xl font-black text-stone-50 leading-tight mb-8">
                        {title}
                    </Text>

                    <RenderHtml
                        contentWidth={width - 48}
                        source={{ html: content }}
                        tagsStyles={tagsStyles}
                    />

                    <View className="h-20" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
