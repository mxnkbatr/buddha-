import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { X } from 'lucide-react-native';

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp, setActive, isLoaded } = useSignUp();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    const onSignUp = useCallback(async () => {
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress: email,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    }, [firstName, lastName, email, password, isLoaded, signUp]);

    const onVerify = useCallback(async () => {
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        try {
            const result = await signUp.attemptEmailAddressVerification({ code });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                router.replace('/(tabs)');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    }, [code, isLoaded, signUp, setActive, router]);

    if (pendingVerification) {
        return (
            <SafeAreaView className="flex-1 bg-stone-50">
                <View className="flex-row items-center justify-between px-4 py-2">
                    <Pressable
                        onPress={() => setPendingVerification(false)}
                        className="p-2 -ml-2"
                        style={{ minWidth: 44, minHeight: 44 }}
                    >
                        <X size={24} color="#44403C" />
                    </Pressable>
                    <Text className="text-lg font-semibold text-stone-800">Verify Email</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View className="flex-1 px-6 pt-8">
                    <Text className="text-3xl font-bold text-stone-800 mb-2">
                        Check your email
                    </Text>
                    <Text className="text-stone-600 mb-8">
                        We sent a verification code to {email}
                    </Text>

                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <Text className="text-red-600">{error}</Text>
                        </View>
                    ) : null}

                    <View className="mb-6">
                        <Text className="text-stone-700 font-medium mb-2">Verification Code</Text>
                        <TextInput
                            value={code}
                            onChangeText={setCode}
                            placeholder="123456"
                            keyboardType="number-pad"
                            className="bg-white border border-stone-300 rounded-xl px-4 py-4 text-stone-800 text-center text-xl tracking-widest"
                            style={{ minHeight: 52 }}
                            maxLength={6}
                        />
                    </View>

                    <Pressable
                        onPress={onVerify}
                        disabled={loading}
                        className={`rounded-xl py-4 px-6 ${loading ? 'bg-amber-400' : 'bg-amber-600 active:bg-amber-700'}`}
                        style={{ minHeight: 52 }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-row items-center justify-between px-4 py-2">
                    <Pressable
                        onPress={() => router.back()}
                        className="p-2 -ml-2"
                        style={{ minWidth: 44, minHeight: 44 }}
                    >
                        <X size={24} color="#44403C" />
                    </Pressable>
                    <Text className="text-lg font-semibold text-stone-800">Sign Up</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView className="flex-1 px-6 pt-4">
                    <Text className="text-3xl font-bold text-stone-800 mb-2">
                        Create account
                    </Text>
                    <Text className="text-stone-600 mb-6">
                        Start your spiritual journey today
                    </Text>

                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <Text className="text-red-600">{error}</Text>
                        </View>
                    ) : null}

                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                            <Text className="text-stone-700 font-medium mb-2">First Name</Text>
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="John"
                                className="bg-white border border-stone-300 rounded-xl px-4 py-4 text-stone-800"
                                style={{ minHeight: 52 }}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-stone-700 font-medium mb-2">Last Name</Text>
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Doe"
                                className="bg-white border border-stone-300 rounded-xl px-4 py-4 text-stone-800"
                                style={{ minHeight: 52 }}
                            />
                        </View>
                    </View>

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
                        onPress={onSignUp}
                        disabled={loading}
                        className={`rounded-xl py-4 px-6 ${loading ? 'bg-amber-400' : 'bg-amber-600 active:bg-amber-700'}`}
                        style={{ minHeight: 52 }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            {loading ? 'Creating...' : 'Create Account'}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(auth)/sign-in')}
                        className="mt-4 py-3 mb-8"
                        style={{ minHeight: 44 }}
                    >
                        <Text className="text-center text-stone-600">
                            Already have an account?{' '}
                            <Text className="text-amber-600 font-semibold">Sign In</Text>
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
