import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(!state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <View className="bg-yellow-500 px-4 py-2 flex-row items-center justify-center">
            <WifiOff size={16} color="white" />
            <Text className="text-white ml-2 font-medium text-sm">
                You're offline. Showing cached data.
            </Text>
        </View>
    );
}
