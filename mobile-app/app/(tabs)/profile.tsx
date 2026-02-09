import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Settings, LogOut, ChevronRight, User, Calendar, Heart } from 'lucide-react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { isSignedIn, signOut } = useAuth();
    const { user } = useUser();

    if (!isSignedIn) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50">
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-24 h-24 bg-stone-200 rounded-full items-center justify-center mb-6">
                        <User size={48} color="#78716C" />
                    </View>
                    <Text className="text-2xl font-bold text-stone-800 mb-2">
                        Welcome to Gevabal
                    </Text>
                    <Text className="text-stone-600 text-center mb-8">
                        Sign in to book sessions, manage your bookings, and more
                    </Text>

                    <Pressable
                        onPress={() => router.push('/(auth)/sign-in')}
                        className="bg-amber-600 rounded-xl py-4 px-8 w-full active:bg-amber-700"
                        style={{ minHeight: 48 }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            Sign In
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(auth)/sign-up')}
                        className="border border-amber-600 rounded-xl py-4 px-8 w-full mt-3 active:bg-amber-50"
                        style={{ minHeight: 48 }}
                    >
                        <Text className="text-amber-600 text-center font-semibold text-lg">
                            Create Account
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <ScrollView className="flex-1">
                {/* Profile Header */}
                <View className="items-center px-6 py-8 bg-white border-b border-stone-200">
                    <Image
                        source={{ uri: user?.imageUrl || 'https://via.placeholder.com/100' }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                        contentFit="cover"
                    />
                    <Text className="text-2xl font-bold text-stone-800 mt-4">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-stone-600">{user?.primaryEmailAddress?.emailAddress}</Text>
                </View>

                {/* Menu Items */}
                <View className="mt-6 px-4">
                    <Text className="text-sm font-medium text-stone-500 uppercase px-2 mb-2">
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
                        className="flex-row items-center bg-white rounded-xl px-4 py-4 active:bg-stone-100"
                        style={{ minHeight: 56 }}
                    >
                        <LogOut size={22} color="#EF4444" />
                        <Text className="text-red-500 ml-3 font-medium">Sign Out</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
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
            className="flex-row items-center bg-white rounded-xl px-4 py-4 mb-2 active:bg-stone-100"
            style={{ minHeight: 56 }}
        >
            {icon}
            <Text className="text-stone-800 ml-3 flex-1 font-medium">{title}</Text>
            <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
    );
}
