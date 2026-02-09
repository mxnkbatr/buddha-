import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Monk, Service, Booking } from './types';

// Determine base URL based on platform
const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Default fallbacks for development
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api';
    }

    return 'http://localhost:3000/api';
};

export const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('clerk-db-jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
        // Handle 401, network errors, etc.
        if (!error.response) {
            // Network error
            console.error('Network Error:', error.message);
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

export const createBooking = async (bookingData: Partial<Booking> & { userName: string, userPhone: string, userEmail?: string, serviceId?: string, note?: string }): Promise<{ success: boolean; id: string }> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
};

export default api;
