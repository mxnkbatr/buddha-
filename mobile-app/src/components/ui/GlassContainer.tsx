import { View, ViewProps } from 'react-native';

export const GlassContainer = ({ className, children, ...props }: ViewProps) => {
    return (
        <View
            className={`bg-white/10 rounded-full border border-white/20 items-center justify-center p-3 backdrop-blur-md overflow-hidden ${className || ''}`}
            {...props}
        >
            {children}
        </View>
    );
};
