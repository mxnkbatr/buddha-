import { Tabs } from 'expo-router';
import { Home, Users, Scroll, Compass, User, Sparkles } from 'lucide-react-native';
import { useIsAuthenticated } from '../../hooks/useIsAuthenticated';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
    const isAuthenticated = useIsAuthenticated();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: '#FDFBF7' }, // Cream background
                tabBarBackground: () => <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(253, 251, 247, 0.96)' }]} />, // Luminous frosted
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 32 : 16,
                    left: 32,
                    right: 32,
                    borderRadius: 9999,
                    height: 68,
                    paddingBottom: 0,
                    borderTopWidth: 0,
                    elevation: 15,
                    shadowColor: '#D4AF37', // Golden glow
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    borderWidth: 0.5,
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    overflow: 'hidden',
                },
                tabBarActiveTintColor: '#D4AF37', // Gold
                tabBarInactiveTintColor: '#A89F91', // Warm Grey
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    borderRadius: 9999,
                    margin: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconWrapper,
                            focused && styles.iconWrapperActive,
                        ]}>
                            <Home size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="monks"
                options={{
                    title: 'Monks',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                            <Users size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="blog"
                options={{
                    title: 'Blog',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                            <Scroll size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                            <Compass size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="rituals"
                options={{
                    title: 'Rituals',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                            <Sparkles size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: isAuthenticated ? 'Profile' : 'Sign In',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                            <User size={22} color={color} strokeWidth={focused ? 2 : 1.5} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapperActive: {
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
});
