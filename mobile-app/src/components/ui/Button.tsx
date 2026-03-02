import { View, Text, TouchableOpacity } from 'react-native';
import clsx from 'clsx';
import * as Haptics from 'expo-haptics';

export interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
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

    const baseStyles = "flex-row items-center justify-center rounded-full border shadow-lg";

    // Applying robust hover/active states via React Native Touchables + Haptics
    const variants = {
        primary: "bg-[#D4AF37] border-[#D4AF37]/50 shadow-[#D4AF37]/30",
        secondary: "bg-white/10 border-white/20 shadow-black/20",
        outline: "border-[#D4AF37] bg-transparent shadow-none",
        ghost: "border-transparent bg-transparent shadow-none",
    };
    const sizes = {
        sm: "px-4 py-2",
        md: "px-6 py-4",
        lg: "px-10 py-5",
    };
    const textStyles = {
        primary: "text-[#0F172A] font-bold tracking-widest uppercase text-xs",
        secondary: "text-white font-bold tracking-widest uppercase text-xs",
        outline: "text-[#D4AF37] font-bold tracking-widest uppercase text-xs",
        ghost: "text-[#D4AF37] font-semibold text-sm",
    };

    return (
        <TouchableOpacity
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            onPress={handlePress}
            activeOpacity={0.8}
            {...props}
        >
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={clsx(textStyles[variant])}>{label}</Text>
        </TouchableOpacity>
    );
};
