/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other colors defined in the theme which you can use.
 */

const tintColorLight = '#D4AF37'; // Pure Gold
const tintColorDark = '#FBBF24'; // Brighter Gold for Dark Mode contrast

export const Colors = {
    light: {
        text: '#0F172A', // Slate 900
        background: '#FDFBF7', // Cream/Beige
        tint: tintColorLight,
        icon: '#64748B', // Slate 500
        tabIconDefault: '#94A3B8', // Slate 400
        tabIconSelected: tintColorLight,
        border: '#E2E8F0', // Slate 200
    },
    dark: {
        text: '#F8FAFC', // Slate 50
        background: '#0F172A', // Slate 900
        tint: tintColorDark,
        icon: '#94A3B8', // Slate 400
        tabIconDefault: '#475569', // Slate 600
        tabIconSelected: tintColorDark,
        border: '#1E293B', // Slate 800
    },
    monk: {
        primary: '#D4AF37', // Pure Gold
        secondary: '#64748B', // Slate 500
        accent: '#FBBF24', // Brighter Gold
        bg: '#FDFBF7', // Cream/Beige
        text: '#0F172A', // Slate 900
        surface: '#FFFFFF', // Pure White for cards
    },
    earth: {
        100: '#F8FAFC',
        200: '#F1F5F9',
        300: '#E2E8F0',
        400: '#CBD5E1',
        500: '#94A3B8',
        600: '#64748B',
        700: '#475569',
        800: '#334155',
        900: '#1E293B',
    },
};
