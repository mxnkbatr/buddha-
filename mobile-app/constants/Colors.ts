/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other colors defined in the theme which you can use.
 */

const tintColorLight = '#D4AF37'; // Pure Gold
const tintColorDark = '#FBBF24'; // Brighter Gold for Dark Mode contrast

export const Colors = {
    light: {
        text: '#291E14', // Deep warm brown
        background: '#FDFBF7', // Warm cream
        tint: tintColorDark,
        icon: '#786851', // Warm grey
        tabIconDefault: '#A89F91', // Lighter warm grey
        tabIconSelected: tintColorDark,
        border: '#E8E0D5', // Soft warm border
    },
    dark: {
        // Enforce the bright divine aura even in dark mode context
        text: '#291E14',
        background: '#FAF6F0',
        tint: tintColorDark,
        icon: '#786851',
        tabIconDefault: '#A89F91',
        tabIconSelected: tintColorDark,
        border: '#E8E0D5',
    },
    monk: {
        primary: '#D4AF37', // Metallic Gold
        secondary: '#B45309', // Amber 700
        accent: '#FBBF24', // Brighter Gold
        bg: '#FDFBF7', // Cream
        text: '#291E14', // Deep brown
        surface: '#FFFFFF', // Pure white card
        aura: '#FFF9E6', // Soft golden glow
    },
    earth: {
        100: '#FDFBF7', // Cream
        200: '#F8F5EE', // Slightly darker cream
        300: '#E8E0D5', // Soft warm border
        400: '#D5C4B3',
        500: '#A89F91',
        600: '#786851',
        700: '#544636',
        800: '#3D2E1F',
        900: '#291E14', // Deep brown
    },
};
