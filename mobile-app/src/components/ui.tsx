
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';
import clsx from 'clsx';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    label: string;
    icon?: React.ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    label,
    icon,
    className,
    onPress,
    ...props
}: ButtonProps) => {

    const handlePress = (e: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const baseStyles = "flex-row items-center justify-center rounded-xl";
    const variants = {
        primary: "bg-monk-primary",
        secondary: "bg-monk-secondary",
        outline: "border border-monk-primary bg-transparent",
        ghost: "bg-transparent",
    };
    const sizes = {
        sm: "px-4 py-2",
        md: "px-6 py-3",
        lg: "px-8 py-4",
    };
    const textStyles = {
        primary: "text-white font-semibold",
        secondary: "text-white font-semibold",
        outline: "text-monk-primary font-semibold",
        ghost: "text-monk-primary font-medium",
    };

    return (
        <TouchableOpacity
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            onPress={handlePress}
            activeOpacity={0.8}
            {...props}
        >
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={clsx("text-base", textStyles[variant])}>{label}</Text>
        </TouchableOpacity>
    );
};

export const Card = ({ className, children, ...props }: ViewProps) => {
    return (
        <View
            className={clsx("bg-monk-surface rounded-2xl shadow-sm border border-stone-100 p-4", className)}
            {...props}
        >
            {children}
        </View>
    );
};

export const ScreenWrapper = ({ className, children, ...props }: ViewProps) => {
    return (
        <View className={clsx("flex-1 bg-monk-bg", className)} {...props}>
            {children}
        </View>
    );
};
