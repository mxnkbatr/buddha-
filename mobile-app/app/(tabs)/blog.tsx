import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, Zap, Filter, Calendar } from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getBlogs } from '../../lib/api';
import { ScrollView } from 'react-native';

interface BlogPost {
    id: string;
    _id: string;
    title: { en: string; mn: string };
    content: { en: string; mn: string };
    cover?: string;
    date: string;
    authorName?: string;
    category?: string;
}

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) { return dateString; }
};

export default function BlogTabScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';
    const tr = (data: { mn: string; en: string }) => data[lang] || data.en;

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const { data: posts, isLoading } = useQuery({
        queryKey: ['blogs'],
        queryFn: getBlogs,
    });

    const categories = [
        { id: 'all', label: tr({ mn: 'Бүгд', en: 'All' }) },
        { id: 'wisdom', label: tr({ mn: 'Сургаал', en: 'Wisdom' }) },
        { id: 'news', label: tr({ mn: 'Мэдээ', en: 'News' }) },
        { id: 'meditation', label: tr({ mn: 'Бясалгал', en: 'Meditation' }) },
    ];

    const filteredPosts = useMemo(() => {
        return (posts || []).filter((post: BlogPost) => {
            const title = (post.title?.[lang] || post.title?.mn || '').toLowerCase();
            const content = (post.content?.[lang] || post.content?.mn || '').toLowerCase();
            const q = search.toLowerCase();
            const matchesSearch = title.includes(q) || content.includes(q);
            const matchesFilter = filter === 'all' || (post.category && post.category.toLowerCase() === filter);
            return matchesSearch && matchesFilter;
        });
    }, [posts, search, filter, lang]);

    return (
        <SafeAreaView className="flex-1 bg-monk-bg" edges={['top']}>
            <FlatList
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View className="px-6 pt-8 pb-4">
                        {/* Badge */}
                        <View className="flex-row self-start items-center gap-2 px-4 py-1.5 rounded-full border border-monk-primary/30 bg-monk-primary/10 mb-4 shadow-sm">
                            <Zap size={14} color="#D4AF37" fill="#D4AF37" />
                            <Text className="text-[10px] font-bold uppercase tracking-[3px] text-monk-primary">
                                {tr({ mn: 'Блог & Мэдээ', en: 'Blog & Wisdom' })}
                            </Text>
                        </View>

                        {/* Title */}
                        <Text className="text-4xl font-serif font-bold text-monk-text leading-tight mb-2 tracking-tight">
                            {tr({ mn: 'Өдөр тутмын', en: 'Daily' })}{' '}
                            <Text className="text-monk-primary">
                                {tr({ mn: 'Ухаарал', en: 'Wisdom' })}
                            </Text>
                        </Text>
                        <Text className="text-monk-secondary uppercase tracking-widest text-xs mb-8">
                            {tr({ mn: 'Сургаал, бясалгал, мэдлэг нийтлэлүүд', en: 'Teachings, meditation, and insights' })}
                        </Text>

                        {/* Search Bar */}
                        <View className="relative mb-6 shadow-sm">
                            <View className="absolute left-5 top-4 z-10">
                                <Search size={18} color="#D4AF37" opacity={0.7} />
                            </View>
                            <TextInput
                                placeholder={tr({ mn: 'Хайх...', en: 'Search wisdom...' })}
                                placeholderTextColor="#94A3B8"
                                value={search}
                                onChangeText={setSearch}
                                className="w-full py-4 pl-12 pr-6 rounded-2xl border border-monk-primary/20 bg-monk-surface text-[#0F172A] font-medium tracking-wide shadow-inner"
                            />
                        </View>

                        {/* Category Filter Tabs */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
                                        setFilter(cat.id);
                                    }}
                                    className={`px-6 py-3 mr-3 rounded-full border transition-colors ${filter === cat.id
                                        ? 'bg-monk-primary border-monk-primary shadow-md'
                                        : 'bg-monk-surface border-monk-primary/20'
                                        }`}
                                >
                                    <Text className={`text-xs font-bold uppercase tracking-widest ${filter === cat.id
                                        ? 'text-[#0F172A]'
                                        : 'text-monk-secondary'
                                        }`}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Results Count */}
                        <View className="flex-row items-center gap-2 mt-4 mb-2 opacity-60 px-1">
                            <Filter size={12} color="#0F172A" />
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A]">
                                {filteredPosts.length} {tr({ mn: 'Нийтлэл', en: 'Posts Found' })}
                            </Text>
                        </View>
                    </View>
                }
                data={filteredPosts}
                keyExtractor={(item: BlogPost) => item._id}
                renderItem={({ item, index }: { item: BlogPost; index: number }) => (
                    <Animated.View entering={FadeInDown.delay(index * 80).duration(500)} className="px-6 mb-6">
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                import('expo-haptics').then(Haptics => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
                                router.push(`/blog/${item._id}`);
                            }}
                            className="bg-monk-surface rounded-[32px] overflow-hidden border border-monk-primary/10 shadow-xl"
                            style={{ shadowColor: '#D4AF37', shadowRadius: 15, shadowOpacity: 0.1, elevation: 8 }}
                        >
                            {item.cover && (
                                <View className="relative">
                                    <Image
                                        source={{ uri: item.cover }}
                                        style={{ width: '100%', height: 200 }}
                                        contentFit="cover"
                                        transition={500}
                                    />
                                    {/* Subtle gradient overlay to blend image into card */}
                                    <View className="absolute bottom-0 w-full h-20" style={{ backgroundColor: 'rgba(243,239,230,0.5)', opacity: 0.5 }} />
                                </View>
                            )}
                            <View className="p-6 bg-monk-surface pt-5">
                                <View className="flex-row justify-between items-center mb-3">
                                    {item.category && (
                                        <View className="bg-monk-primary/10 px-3 py-1 rounded-full border border-monk-primary/20">
                                            <Text className="text-[9px] font-bold text-monk-primary uppercase tracking-[2px]">
                                                {item.category}
                                            </Text>
                                        </View>
                                    )}
                                    <View className="flex-row items-center gap-1.5 opacity-60">
                                        <Calendar size={12} color="#0F172A" />
                                        <Text className="text-[10px] font-bold tracking-widest uppercase text-[#0F172A]">
                                            {formatDate(item.date)}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-2xl font-serif font-bold text-monk-text mb-3 leading-8 tracking-tight">
                                    {item.title[lang] || item.title.en}
                                </Text>
                                <Text numberOfLines={2} className="text-monk-secondary leading-6 text-sm opacity-90">
                                    {(item.content[lang] || item.content.en)?.replace(/<[^>]*>?/g, '')}
                                </Text>
                                {item.authorName && (
                                    <View className="mt-5 pt-4 border-t border-monk-primary/10 flex-row items-center">
                                        <Text className="text-[10px] font-bold text-monk-primary uppercase tracking-[2px]">
                                            {tr({ mn: 'Зохиогч', en: 'Penned By' })}
                                        </Text>
                                        <Text className="text-xs font-serif font-bold text-monk-text ml-2">
                                            {item.authorName}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    isLoading ? (
                        <View className="items-center mt-12 bg-monk-surface/50 mx-6 p-10 rounded-[32px] border border-monk-primary/10">
                            <ActivityIndicator size="large" color="#D4AF37" />
                            <Text className="text-monk-primary mt-4 font-bold tracking-widest uppercase text-xs">
                                {tr({ mn: 'Ачааллаж байна...', en: 'Summoning...' })}
                            </Text>
                        </View>
                    ) : (
                        <View className="items-center mt-6 bg-monk-surface/50 mx-6 p-10 rounded-[32px] border border-monk-primary/10">
                            <Text className="text-center text-monk-secondary font-serif text-lg italic tracking-tight">
                                {tr({ mn: 'Нийтлэл олдсонгүй.', en: 'The scrolls are empty.' })}
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}
