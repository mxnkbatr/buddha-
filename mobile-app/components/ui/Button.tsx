import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string; // For additional tailwind classes
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon,
    className,
}: ButtonProps) {

    const handlePress = async () => {
        if (!disabled && !isLoading) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
        }
    };

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                // Dark slate background with pure gold border for a premium, gilded minimalism look
                return 'bg-monk-text dark:bg-earth-100 border-[0.5px] border-monk-primary shadow-sm';
            case 'secondary':
                // Slate background with subtle border
                return 'bg-earth-200 dark:bg-earth-800 border-[0.5px] border-earth-300 dark:border-earth-700';
            case 'outline':
                // Gold border, transparent bg
                return 'bg-transparent border-[0.5px] border-monk-primary';
            case 'ghost':
                return 'bg-transparent';
            default:
                return 'bg-monk-text dark:bg-earth-100 border-[0.5px] border-monk-primary shadow-sm';
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'sm':
                return 'px-4 py-2';
            case 'md':
                return 'px-5 py-3';
            case 'lg':
                return 'px-8 py-4';
            default:
                return 'px-5 py-3';
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                // Pure gold text on dark slate
                return 'text-monk-primary dark:text-monk-text tracking-wide';
            case 'outline':
            case 'ghost':
                // Gold text
                return 'text-monk-primary tracking-wide';
            case 'secondary':
                return 'text-monk-text dark:text-earth-100 tracking-wide';
            default:
                return 'text-monk-primary dark:text-monk-text tracking-wide';
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            className={`rounded-xl flex-row items-center justify-center ${getVariantStyle()} ${getSizeStyle()} ${disabled ? 'opacity-50' : ''
                } ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'secondary' ? Colors.monk.text : Colors.monk.primary} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={`font-semibold text-center ${getTextStyle()} ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
