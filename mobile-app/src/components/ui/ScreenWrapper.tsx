import { View, ViewProps } from 'react-native';
import clsx from 'clsx';

export const ScreenWrapper = ({ className, children, ...props }: ViewProps) => {
    return (
        <View className={clsx("flex-1 bg-[#0F172A]", className)} {...props}>
            {children}
        </View>
    );
};
