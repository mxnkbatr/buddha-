
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ScreenWrapper, Card } from '../../src/components/ui';
import { useQuery } from '@tanstack/react-query';
import { getBlogs, BlogPost } from '../../lib/api';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

export default function BlogListScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();
    const isLargeScreen = width > 600;

    const { data: blogs, isLoading, error } = useQuery({
        queryKey: ['blogs'],
        queryFn: getBlogs,
    });

    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    if (isLoading) {
        return (
            <ScreenWrapper>
                <SafeAreaView className="flex-1 justify-center items-center">
                    <Text className="text-monk-secondary">Loading wisdom...</Text>
                </SafeAreaView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <SafeAreaView className="flex-1">
                <View className="px-6 pt-6 pb-2">
                    <Text className="text-3xl font-serif text-monk-primary font-bold">Wisdom</Text>
                    <Text className="text-monk-secondary mt-1">Teachings and insights</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {blogs?.map((blog) => (
                        <TouchableOpacity
                            key={blog._id}
                            activeOpacity={0.9}
                            onPress={() => router.push(`/blog/${blog._id}`)}
                            className="mb-6"
                        >
                            <Card className="p-0 overflow-hidden border-monk-secondary/20">
                                <Image
                                    source={{ uri: blog.cover }}
                                    style={{ width: '100%', height: 200 }}
                                    contentFit="cover"
                                />
                                <View className="p-4 bg-white">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-xs font-bold text-monk-accent uppercase tracking-wider">
                                            {blog.category}
                                        </Text>
                                        <Text className="text-xs text-stone-400">
                                            {formatDate(blog.date)}
                                        </Text>
                                    </View>
                                    <Text className="text-xl font-serif font-bold text-monk-primary mb-2 leading-6">
                                        {blog.title[lang] || blog.title.en}
                                    </Text>
                                    <Text numberOfLines={2} className="text-stone-600 leading-5">
                                        {blog.content[lang]?.replace(/<[^>]*>?/g, '') || blog.content.en?.replace(/<[^>]*>?/g, '')}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </ScreenWrapper>
    );
}
