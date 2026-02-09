import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Home, Map, Users, User } from 'lucide-react-native';

export default function TabLayout() {
    const { isSignedIn } = useAuth();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#F59E0B', // Amber-500
                tabBarInactiveTintColor: '#78716C', // Stone-500
                tabBarStyle: {
                    backgroundColor: '#1C1917', // Stone-900
                    borderTopColor: '#44403C', // Stone-700
                    borderTopWidth: 1,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                    paddingTop: 8,
                    height: Platform.OS === 'ios' ? 88 : 64,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tours"
                options={{
                    title: 'Tours',
                    tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="monks"
                options={{
                    title: 'Monks',
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: isSignedIn ? 'Profile' : 'Sign In',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
