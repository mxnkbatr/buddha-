
import { View, Text, ActivityIndicator } from 'react-native';
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

    const roomName = `room-${id}`;
    const serverUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;

    useEffect(() => {
        const fetchToken = async () => {
            if (!user || !id) return;

            try {
                // In a real app, you would fetch this from your backend securely
                // for this implementation we use the Next.js API route we assumed exists
                // or constructing it here if we had a direct token generator (not safe)

                // We use the Next.js API: /api/livekit?room={room}&username={name}
                const username = user.firstName || 'User';
                const { data } = await api.get(`/livekit?room=${roomName}&username=${username}`);
                setToken(data.token);
            } catch (err) {
                console.error('Failed to fetch token:', err);
                setError('Failed to connect to session.');
            }
        };

        fetchToken();
    }, [id, user]);

    if (error) {
        return (
            <ScreenWrapper className="justify-center items-center">
                <Text className="text-red-500">{error}</Text>
                <Text className="text-monk-secondary mt-4" onPress={() => router.back()}>Go Back</Text>
            </ScreenWrapper>
        );
    }

    if (!token || !serverUrl) {
        return (
            <ScreenWrapper className="justify-center items-center bg-stone-900">
                <ActivityIndicator size="large" color="#D97706" />
                <Text className="text-stone-400 mt-4">Connecting to sanctuary...</Text>
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
