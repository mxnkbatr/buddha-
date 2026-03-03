import { View, ViewProps } from 'react-native';

export const ScreenWrapper = ({ className, children, ...props }: ViewProps) => {
    return (
        <View className={`flex-1 bg-[#0F172A] ${className || ''}`} {...props}>
            {children}
        </View>
    );
};
