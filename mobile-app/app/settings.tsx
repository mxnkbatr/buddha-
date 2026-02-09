import { View, Text, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Globe, Bell, Info, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

export default function SettingsScreen() {
    const { i18n } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const currentLanguage = i18n.language;

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'mn', name: 'Монгол' },
        { code: 'de', name: 'Deutsch' },
    ];

    const handleLanguageChange = async (langCode: string) => {
        Haptics.selectionAsync();
        await i18n.changeLanguage(langCode);
    };

    const handleNotificationToggle = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setNotificationsEnabled(value);
        // TODO: Update notification preferences in backend
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <Stack.Screen options={{ headerTitle: 'Settings' }} />

            <ScrollView className="flex-1">
                {/* Language Section */}
                <View className="mt-4 px-4">
                    <View className="flex-row items-center mb-3 px-2">
                        <Globe size={20} color="#78716C" />
                        <Text className="text-sm font-medium text-stone-500 uppercase ml-2">
                            Language
                        </Text>
                    </View>

                    <View className="bg-white rounded-xl overflow-hidden">
                        {languages.map((lang, index) => (
                            <Pressable
                                key={lang.code}
                                onPress={() => handleLanguageChange(lang.code)}
                                className={`flex-row items-center justify-between px-4 py-4 ${index < languages.length - 1 ? 'border-b border-stone-200' : ''
                                    } active:bg-stone-50`}
                                style={{ minHeight: 56 }}
                            >
                                <Text className="text-stone-800 font-medium">{lang.name}</Text>
                                {currentLanguage === lang.code && (
                                    <View className="w-2 h-2 bg-amber-600 rounded-full" />
                                )}
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Notifications Section */}
                <View className="mt-6 px-4">
                    <View className="flex-row items-center mb-3 px-2">
                        <Bell size={20} color="#78716C" />
                        <Text className="text-sm font-medium text-stone-500 uppercase ml-2">
                            Notifications
                        </Text>
                    </View>

                    <View className="bg-white rounded-xl px-4 py-4">
                        <View className="flex-row items-center justify-between" style={{ minHeight: 40 }}>
                            <View className="flex-1">
                                <Text className="text-stone-800 font-medium">
                                    Push Notifications
                                </Text>
                                <Text className="text-stone-500 text-sm mt-1">
                                    Receive booking reminders and updates
                                </Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: '#D6D3D1', true: '#FDE68A' }}
                                thumbColor={notificationsEnabled ? '#D97706' : '#F5F5F4'}
                            />
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View className="mt-6 px-4 pb-8">
                    <View className="flex-row items-center mb-3 px-2">
                        <Info size={20} color="#78716C" />
                        <Text className="text-sm font-medium text-stone-500 uppercase ml-2">
                            About
                        </Text>
                    </View>

                    <View className="bg-white rounded-xl overflow-hidden">
                        <View className="px-4 py-4 border-b border-stone-200">
                            <Text className="text-stone-600 text-sm">App Version</Text>
                            <Text className="text-stone-800 font-medium mt-1">
                                {Constants.expoConfig?.version || '1.0.0'}
                            </Text>
                        </View>

                        <Pressable
                            className="flex-row items-center justify-between px-4 py-4 border-b border-stone-200 active:bg-stone-50"
                            style={{ minHeight: 56 }}
                        >
                            <Text className="text-stone-800 font-medium">Terms of Service</Text>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </Pressable>

                        <Pressable
                            className="flex-row items-center justify-between px-4 py-4 border-b border-stone-200 active:bg-stone-50"
                            style={{ minHeight: 56 }}
                        >
                            <Text className="text-stone-800 font-medium">Privacy Policy</Text>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </Pressable>

                        <Pressable
                            className="flex-row items-center justify-between px-4 py-4 active:bg-stone-50"
                            style={{ minHeight: 56 }}
                        >
                            <Text className="text-stone-800 font-medium">Support</Text>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
