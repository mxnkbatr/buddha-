
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Settings, LogOut, ChevronRight, User as UserIcon, Calendar, Heart, Sparkles, Moon, Edit3 } from 'lucide-react-native';
import { ScreenWrapper, Button } from '../../src/components/ui';
import { useUserStore } from '../../store/userStore';
import { useEffect, useState } from 'react';
import { ZodiacDisplay, getZodiacByKey } from '../../components/profile/ZodiacYearPicker';

export default function ProfileScreen() {
    const router = useRouter();
    const { isSignedIn, signOut } = useAuth();
    const { user: clerkUser } = useUser();
    const { user: dbUser, fetchProfile, isLoading } = useUserStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            fetchProfile();
        }
    }, [isSignedIn]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    if (!isSignedIn) {
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
                    label="Sign In"
                    onPress={() => router.push('/(auth)/sign-in')}
                    className="w-full mb-4"
                />

                <Button
                    label="Create Account"
                    variant="outline"
                    onPress={() => router.push('/(auth)/sign-up')}
                    className="w-full"
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} tintColor="#78716C" />
                    }
                >
                    {/* Profile Header */}
                    <View className="items-center px-6 py-8 border-b border-monk-secondary/20 bg-monk-surface/30">
                        <Image
                            source={{ uri: clerkUser?.imageUrl || 'https://via.placeholder.com/100' }}
                            style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#78716C' }}
                            contentFit="cover"
                        />
                        <Text className="text-2xl font-serif font-bold text-monk-primary mt-4">
                            {dbUser?.firstName || clerkUser?.firstName} {dbUser?.lastName || clerkUser?.lastName}
                        </Text>
                        <Text className="text-monk-secondary">{clerkUser?.primaryEmailAddress?.emailAddress}</Text>

                        {/* Zodiac Display */}
                        {dbUser?.zodiacYear && (
                            <View className="flex-row items-center mt-2">
                                <ZodiacDisplay zodiacKey={dbUser.zodiacYear} size="small" />
                                <Text className="text-monk-secondary ml-2">
                                    {getZodiacByKey(dbUser.zodiacYear)?.mn || getZodiacByKey(dbUser.zodiacYear)?.en}
                                </Text>
                            </View>
                        )}

                        {/* Edit Profile Button */}
                        <Pressable
                            onPress={() => router.push('/edit-profile')}
                            className="mt-4 flex-row items-center bg-amber-50 px-4 py-2 rounded-full active:bg-amber-100"
                        >
                            <Edit3 size={16} color="#D97706" />
                            <Text className="text-amber-700 font-medium ml-2">Edit Profile</Text>
                        </Pressable>

                        {/* Spiritual Stats */}
                        {dbUser && (
                            <View className="flex-row mt-6 w-full justify-around px-4">
                                <StatItem
                                    icon={<Sparkles size={20} color="#D97706" />}
                                    value={dbUser.karma || 0}
                                    label="Karma"
                                />
                                <StatItem
                                    icon={<Moon size={20} color="#78716C" />}
                                    value={dbUser.meditationDays || 0}
                                    label="Days"
                                />
                                <StatItem
                                    icon={<Heart size={20} color="#78716C" />}
                                    value={dbUser.totalMerits || 0}
                                    label="Merits"
                                />
                            </View>
                        )}
                    </View>

                    {/* Menu Items */}
                    <View className="mt-6 px-4">
                        <Text className="text-sm font-medium text-monk-secondary uppercase px-2 mb-2">
                            My Account
                        </Text>

                        <MenuItem
                            icon={<Calendar size={22} color="#78716C" />}
                            title="My Bookings"
                            onPress={() => router.push('/my-bookings')}
                        />
                        <MenuItem
                            icon={<Heart size={22} color="#78716C" />}
                            title="Favorites"
                            onPress={() => router.push('/favorites')}
                        />
                        <MenuItem
                            icon={<Settings size={22} color="#78716C" />}
                            title="Settings"
                            onPress={() => router.push('/settings')}
                        />
                    </View>

                    {/* Sign Out */}
                    <View className="mt-6 px-4 pb-8">
                        <Pressable
                            onPress={() => signOut()}
                            className="flex-row items-center bg-white rounded-xl px-4 py-4 active:bg-earth-100 border border-stone-100"
                            style={{ minHeight: 56 }}
                        >
                            <LogOut size={22} color="#78716C" />
                            <Text className="text-monk-secondary ml-3 font-medium">Sign Out</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ScreenWrapper>
    );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
    return (
        <View className="items-center bg-white p-3 rounded-xl min-w-[30%] shadow-sm">
            {icon}
            <Text className="text-xl font-bold text-monk-text mt-1">{value}</Text>
            <Text className="text-xs text-monk-secondary uppercase tracking-wide">{label}</Text>
        </View>
    );
}

function MenuItem({
    icon,
    title,
    onPress,
}: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center bg-white rounded-xl px-4 py-4 mb-2 active:bg-earth-50 shadow-sm border border-stone-50"
            style={{ minHeight: 56 }}
        >
            {icon}
            <Text className="text-monk-text ml-3 flex-1 font-medium">{title}</Text>
            <ChevronRight size={20} color="#D7CCC8" />
        </Pressable>
    );
}
