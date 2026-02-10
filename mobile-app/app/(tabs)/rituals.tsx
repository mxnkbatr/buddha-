
import { ScreenWrapper, Card } from '../../src/components/ui';
import { Text, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { Service } from '../../src/types/schema';

const AccordionItem = ({ item, lang }: { item: Service, lang: 'mn' | 'en' }) => {
    const [expanded, setExpanded] = useState(false);

    // Safety check for localized strings
    const title = item.name?.[lang] || item.name?.en || 'Untitled Ritual';
    const description = item.desc?.[lang] || item.desc?.en || 'No description available.';
    const category = item.type || 'Ritual';

    return (
        <Card className="mb-4 overflow-hidden">
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                className="flex-row justify-between items-center"
                activeOpacity={0.7}
            >
                <View className="flex-1 pr-2">
                    <Text className="text-monk-secondary text-xs font-bold uppercase tracking-wider mb-1">
                        {category}
                    </Text>
                    <Text className="text-lg font-serif font-semibold text-monk-text">
                        {title}
                    </Text>
                </View>
                <View className="bg-earth-100 p-2 rounded-full">
                    {expanded ? <ChevronUp size={20} color="#795548" /> : <ChevronDown size={20} color="#795548" />}
                </View>
            </TouchableOpacity>

            {expanded && (
                <View className="mt-4 pt-4 border-t border-stone-100">
                    <Text className="text-monk-text leading-6">
                        {description.replace(/<[^>]*>?/g, '')}
                    </Text>
                    <View className="flex-row items-center mt-4 justify-between">
                        <View className="flex-row gap-2">
                            <View className="bg-monk-bg px-3 py-1 rounded-md">
                                <Text className="text-monk-primary text-xs font-medium">
                                    {item.duration}
                                </Text>
                            </View>
                            <View className="bg-monk-accent/10 px-3 py-1 rounded-md">
                                <Text className="text-monk-accent text-xs font-bold">
                                    ₮{item.price?.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </Card>
    );
};

export default function RitualsScreen() {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language === 'mn' ? 'mn' : 'en') as 'mn' | 'en';

    const { data: services, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: getServices,
    });

    if (isLoading) {
        return (
            <ScreenWrapper>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#795548" size="large" />
                    <Text className="text-monk-secondary mt-4">Loading rituals...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View className="pt-12 px-6 pb-4 bg-monk-bg">
                <Text className="text-3xl font-serif text-monk-primary font-bold">Sacred Rituals</Text>
                <Text className="text-monk-secondary mt-1">Explore the ancient wisdom of Gurem</Text>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            >
                {services?.map((service) => (
                    <AccordionItem key={service._id?.toString() || service.id} item={service} lang={lang} />
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}
