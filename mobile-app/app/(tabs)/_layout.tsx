import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Home, Scroll, Calendar, User, Flower } from 'lucide-react-native'; // Flower as Lotus replacement
import { TabBar } from '../../src/components/TabBar';

export default function TabLayout() {
    const { isSignedIn } = useAuth();

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} />,
                }}
            />
            <Tabs.Screen
                name="rituals"
                options={{
                    title: 'Rituals',
                    tabBarIcon: ({ color, size }) => <Flower size={size} color={color} strokeWidth={1.5} />,
                }}
            />
            <Tabs.Screen
                name="blog"
                options={{
                    title: 'Wisdom',
                    tabBarIcon: ({ color, size }) => <Scroll size={size} color={color} strokeWidth={1.5} />,
                }}
            />
            <Tabs.Screen
                name="booking"
                options={{
                    title: 'Book',
                    href: null, // Keep existing if needed, or null if we want to hide it
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} strokeWidth={1.5} />,
                }}
            />
            <Tabs.Screen
                name="monks"
                options={{
                    href: null, // Hiding for now based on user request "Home, Rituals, Booking, Profile"
                }}
            />
            <Tabs.Screen
                name="tours"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: isSignedIn ? 'Profile' : 'Sign In',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.5} />,
                }}
            />
        </Tabs>
    );
}
