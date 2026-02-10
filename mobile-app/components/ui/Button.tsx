import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text, View } from 'react-native';
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

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return 'bg-monk-primary';
            case 'secondary':
                return 'bg-monk-secondary';
            case 'outline':
                return 'bg-transparent border border-monk-primary';
            case 'ghost':
                return 'bg-transparent';
            default:
                return 'bg-monk-primary';
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5';
            case 'md':
                return 'px-4 py-2';
            case 'lg':
                return 'px-6 py-3';
            default:
                return 'px-4 py-2';
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return 'text-monk-primary';
            case 'ghost':
                return 'text-monk-primary';
            default:
                return 'text-white';
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            className={`rounded-lg flex-row items-center justify-center ${getVariantStyle()} ${getSizeStyle()} ${disabled ? 'opacity-50' : ''
                } ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.monk.primary : 'white'} />
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
