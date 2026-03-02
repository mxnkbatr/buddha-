import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { RitualItem } from '../lib/data/ritualsData';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

interface RitualCardProps {
    item: RitualItem;
}

export const RitualCard: React.FC<RitualCardProps> = ({ item }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <Link href={`/ritual/${item.id}`} asChild>
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        opacity: pressed ? 0.9 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                    }
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${item.name}`}
            >
                <View style={styles.contentContainer}>
                    <Text
                        style={[styles.title, { color: colors.tint }]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text
                        style={[styles.description, { color: colors.text }]}
                        numberOfLines={2}
                    >
                        {item.desc || "Дэлгэрэнгүй мэдээлэл байхгүй байна."}
                    </Text>
                </View>

                <View style={styles.iconContainer}>
                    <Text style={{ color: colors.icon }}>→</Text>
                </View>
            </Pressable>
        </Link>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        // Ensure touch target >= 48px
        minHeight: 80,
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
        paddingRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    description: {
        fontSize: 14,
        opacity: 0.8,
        lineHeight: 20,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(100, 116, 139, 0.1)', // Subtle slate background
    }
});
