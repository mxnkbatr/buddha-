/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other colors defined in the theme which you can use.
 */

const tintColorLight = '#D97706'; // Amber 600
const tintColorDark = '#F59E0B'; // Amber 500

export const Colors = {
    light: {
        text: '#292524', // Stone 800
        background: '#FAFAF9', // Stone 50
        tint: tintColorLight,
        icon: '#78716C', // Stone 500
        tabIconDefault: '#A8A29E', // Stone 400
        tabIconSelected: tintColorLight,
        border: '#E7E5E4', // Stone 200
    },
    dark: {
        text: '#F5F5F4', // Stone 100
        background: '#1C1917', // Stone 900
        tint: tintColorDark,
        icon: '#A8A29E', // Stone 400
        tabIconDefault: '#57534E', // Stone 600
        tabIconSelected: tintColorDark,
        border: '#44403C', // Stone 700
    },
    monk: {
        primary: '#D97706',
        secondary: '#78716C',
        accent: '#D97706',
        bg: '#FAFAF9',
        text: '#292524',
        surface: '#FFFFFF',
    },
    earth: {
        100: '#F5F5F4',
        200: '#E7E5E4',
        300: '#D6D3D1',
        400: '#A8A29E',
        500: '#78716C',
        600: '#57534E',
        700: '#44403C',
        800: '#292524',
        900: '#1C1917',
    },
};
