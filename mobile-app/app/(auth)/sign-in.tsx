import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { X } from 'lucide-react-native';

export default function SignInScreen() {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSignIn = useCallback(async () => {
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.replace('/(tabs)');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Sign in failed');
        } finally {
            setLoading(false);
        }
    }, [email, password, isLoaded, signIn, setActive, router]);

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-2">
                    <Pressable
                        onPress={() => router.back()}
                        className="p-2 -ml-2"
                        style={{ minWidth: 44, minHeight: 44 }}
                    >
                        <X size={24} color="#44403C" />
                    </Pressable>
                    <Text className="text-lg font-semibold text-stone-800">Sign In</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Form */}
                <View className="flex-1 px-6 pt-8">
                    <Text className="text-3xl font-bold text-stone-800 mb-2">
                        Welcome back
                    </Text>
                    <Text className="text-stone-600 mb-8">
                        Sign in to continue your spiritual journey
                    </Text>

                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <Text className="text-red-600">{error}</Text>
                        </View>
                    ) : null}

                    <View className="mb-4">
                        <Text className="text-stone-700 font-medium mb-2">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            className="bg-white border border-stone-300 rounded-xl px-4 py-4 text-stone-800"
                            style={{ minHeight: 52 }}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-stone-700 font-medium mb-2">Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            className="bg-white border border-stone-300 rounded-xl px-4 py-4 text-stone-800"
                            style={{ minHeight: 52 }}
                        />
                    </View>

                    <Pressable
                        onPress={onSignIn}
                        disabled={loading}
                        className={`rounded-xl py-4 px-6 ${loading ? 'bg-amber-400' : 'bg-amber-600 active:bg-amber-700'}`}
                        style={{ minHeight: 52 }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(auth)/sign-up')}
                        className="mt-4 py-3"
                        style={{ minHeight: 44 }}
                    >
                        <Text className="text-center text-stone-600">
                            Don't have an account?{' '}
                            <Text className="text-amber-600 font-semibold">Sign Up</Text>
                        </Text>
                    </Pressable>

                    <View className="mt-6 pt-6 border-t border-stone-200">
                        <Pressable
                            onPress={() => router.push('/(auth)/phone-login')}
                            className="border border-stone-300 rounded-xl py-4 px-6 active:bg-stone-100"
                            style={{ minHeight: 52 }}
                        >
                            <Text className="text-stone-700 text-center font-semibold text-lg">
                                Sign in with Phone
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
