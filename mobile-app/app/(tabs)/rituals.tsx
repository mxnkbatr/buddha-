import React, { useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRitualsStore } from '../../store/useRitualsStore';
import { RitualCard } from '../../components/RitualCard';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RitualItem } from '../../lib/data/ritualsData';

export default function RitualsScreen() {
    const { categories, isLoading, error, fetchRitualsFromBackend } = useRitualsStore();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Optionally trigger a backend sync if required
        // fetchRitualsFromBackend();
    }, []);

    // Flattening data to support section-like rendering or grouped items easily 
    // with efficient memoization
    const flattenedData = React.useMemo(() => {
        const result: any[] = [];
        categories.forEach(cat => {
            result.push({ isHeader: true, title: cat.category, id: `header-${cat.category}` });
            cat.items.forEach(item => {
                result.push({ isHeader: false, ...item });
            });
        });
        return result;
    }, [categories]);

    // Use Callback as requested by Mobile-design guidelines
    const renderItem = useCallback(({ item }: { item: any }) => {
        if (item.isHeader) {
            return (
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, { color: colors.tint }]}>{item.title}</Text>
                </View>
            );
        }
        return <RitualCard item={item as RitualItem} />;
    }, [colors]);

    const keyExtractor = useCallback((item: any) => item.id, []);

    if (isLoading && flattenedData.length === 0) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    if (error && flattenedData.length === 0) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: 'red' }}>Error loading data: {error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <View style={styles.topBar}>
                <Text style={[styles.screenTitle, { color: colors.text }]}>Гүрэм Засал</Text>
            </View>

            <FlatList
                data={flattenedData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                // Setting initialNumToRender to improve fast render times
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    headerContainer: {
        marginTop: 24,
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: {
        paddingVertical: 8,
    },
});
