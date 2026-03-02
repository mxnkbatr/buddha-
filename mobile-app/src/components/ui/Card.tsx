import { View, ViewProps } from 'react-native';
import clsx from 'clsx';

export const Card = ({ className, children, ...props }: ViewProps) => {
    return (
        <View
            className={clsx(
                "bg-white/5 rounded-[24px] shadow-xl border border-white/10 p-5",
                className
            )}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5
            }}
            {...props}
        >
            {children}
        </View>
    );
};
