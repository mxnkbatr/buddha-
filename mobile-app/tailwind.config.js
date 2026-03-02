/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            sans: ['System'], // Recommend replacing with Inter/SF Pro if available
            serif: ['System'], // Recommend replacing with Playfair Display if available
        },
        colors: {
            // Gilded Minimalism Palette
            monk: {
                primary: '#D4AF37', // Metallic Gold - Primary Accent
                secondary: '#1E293B', // Slate 800 - Secondary
                accent: '#E6C762', // Light Gold - Highlights
                bg: '#FDFBF7', // Cream 50 - Warm white background
                text: '#0F172A', // Slate 900 - Soft Black Base Text
                surface: '#F3EFE6', // Cream 100 for Cards
                glass: 'rgba(253, 251, 247, 0.8)', // Cream Glassmorphism
                'surface-highlight': '#E6E0D1', // Active states/borders
                'deep-red': '#7F1D1D', // Deep Red for Live stream
                gold: '#D4AF37', // Core Gold
                'dark-surface': '#1E293B', // Slate 800
                'dark-bg': '#0F172A', // Slate 900
            },
            earth: {
                100: '#F5F5F4', // Stone 100
                200: '#E7E5E4', // Stone 200
                300: '#D6D3D1', // Stone 300
                400: '#A8A29E', // Stone 400
                500: '#78716C', // Stone 500
                600: '#57534E', // Stone 600
                700: '#44403C', // Stone 700
                800: '#292524', // Stone 800
                900: '#1C1917', // Stone 900
            }
        },
    },
    plugins: [],
};
