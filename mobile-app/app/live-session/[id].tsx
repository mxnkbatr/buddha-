
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import LiveSession from '../../src/components/LiveSession';
import { useAuth, useUser } from '@clerk/clerk-expo';
import api from '../../lib/api';
import { ScreenWrapper } from '../../src/components/ui';

export default function LiveSessionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const roomName = id as string;
    const serverUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;

    useEffect(() => {
        const fetchToken = async () => {
            if (!user || !id) return;

            if (!serverUrl) {
                console.error('EXPO_PUBLIC_LIVEKIT_URL is not defined');
                setError('LiveKit server URL is not configured.');
                return;
            }

            try {
                // Fetch token from backend
                const username = user.firstName || user.fullName || 'User';
                const { data } = await api.get(`/livekit?room=${roomName}&username=${encodeURIComponent(username)}`);
                
                if (data.token) {
                    setToken(data.token);
                    
                    // Optimistically try to mark call as active if monk
                    // The backend will check permissions anyway
                    api.patch(`/bookings/${id}`, { callStatus: 'active' }).catch(err => {
                        console.log('Not authorized to start call or booking not found', err.message);
                    });
                } else {
                    throw new Error('No token received');
                }
            } catch (err) {
                console.error('Failed to fetch token:', err);
                setError('Failed to connect to session. Please check your internet.');
            }
        };

        fetchToken();
    }, [id, user, serverUrl]);

    if (error) {
        return (
            <ScreenWrapper className="justify-center items-center">
                <View className="p-6 bg-white rounded-2xl shadow-sm border border-stone-100 items-center">
                    <Text className="text-red-500 font-bold text-center mb-2">Connection Error</Text>
                    <Text className="text-stone-600 text-center mb-6">{error}</Text>
                    <Text 
                        className="bg-monk-primary text-white px-8 py-3 rounded-full font-bold uppercase" 
                        onPress={() => router.back()}
                    >
                        Go Back
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!token || !serverUrl) {
        return (
            <ScreenWrapper className="justify-center items-center bg-stone-900">
                <ActivityIndicator size="large" color="#D97706" />
                <Text className="text-stone-400 mt-4 font-serif italic tracking-widest">Connecting to sanctuary...</Text>
            </ScreenWrapper>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <LiveSession
                token={token}
                serverUrl={serverUrl}
                roomName={roomName}
                onDisconnect={() => router.back()}
            />
        </View>
    );
}
