import { View, type ViewProps } from 'react-native';

export type CardProps = ViewProps & {
    className?: string;
};

export function Card({ className, style, ...props }: CardProps) {
    return (
        <View
            className={`bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-4 ${className}`}
            style={style}
            {...props}
        />
    );
}
