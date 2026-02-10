import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Monk, Service, Booking, User } from '../src/types/schema';

// Determine base URL based on platform
const getBaseUrl = () => {
    // First check env variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // For Expo Go on physical device, use the debugger host IP
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

    if (Platform.OS === 'android') {
        // Physical device - use debugger host if available
        if (debuggerHost && debuggerHost !== 'localhost') {
            return `http://${debuggerHost}:3000/api`;
        }
        // Android Emulator
        return 'http://10.0.2.2:3000/api';
    }

    if (Platform.OS === 'ios') {
        // Physical iOS device - use debugger host
        if (debuggerHost && debuggerHost !== 'localhost') {
            return `http://${debuggerHost}:3000/api`;
        }
        // iOS Simulator
        return 'http://localhost:3000/api';
    }

    // Web
    return 'http://localhost:3000/api';
};

export const API_URL = getBaseUrl();

// Log API URL for debugging
console.log('API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token (supports both Clerk and custom JWT)
api.interceptors.request.use(async (config) => {
    try {
        // Try Clerk token first
        const clerkToken = await SecureStore.getItemAsync('clerk-db-jwt');
        if (clerkToken) {
            config.headers.Authorization = `Bearer ${clerkToken}`;
            return config;
        }

        // Fall back to custom auth token
        const customToken = await SecureStore.getItemAsync('custom-auth-jwt');
        if (customToken) {
            config.headers.Authorization = `Bearer ${customToken}`;
        }
    } catch (error) {
        console.error('Error getting token', error);
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Network error - provide helpful debugging info
            console.error('Network Error:', error.message);
            console.error('Attempted URL:', API_URL);
            console.error('Make sure Next.js server is running: cd ../buddha && npm run dev');
            error.message = `Cannot connect to server at ${API_URL}. Make sure the server is running.`;
        } else if (error.response.status === 401) {
            console.error('Unauthorized - token may be invalid');
        }
        return Promise.reject(error);
    }
);

export const getMonks = async (): Promise<Monk[]> => {
    const response = await api.get('/monks');
    return response.data;
};

export const getServices = async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
};

export const getUserProfile = async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
};


export interface BlogPost {
    _id: string;
    id: string;
    title: { mn: string; en: string };
    content: { mn: string; en: string };
    date: string;
    cover: string;
    category: string;
    authorName: string;
}

export const getBlogs = async (): Promise<BlogPost[]> => {
    const response = await api.get('/blogs');
    return response.data;
};

export const createBooking = async (bookingData: Partial<Booking>): Promise<{ success: boolean; id: string }> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

export default api;
