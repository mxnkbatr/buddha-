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
            // Monastic/Zen Palette (Synced with Web App)
            monk: {
                primary: '#D97706', // Amber 600 - Warm spiritual gold
                secondary: '#78716C', // Stone 500 - Earthy balance
                accent: '#D97706', // Amber 600 - Unifying accent
                bg: '#FAFAF9', // Stone 50 - Warm white/paper
                text: '#292524', // Stone 800 - Soft Black
                surface: '#FFFFFF', // White for cards
                glass: 'rgba(255, 255, 255, 0.8)', // Glassmorphism base
                'surface-highlight': '#F5F5F4', // Stone 100 for active states
                'deep-red': '#800000', // Deep Red/Maroon for Live stream background
                gold: '#FFD700', // Golden Yellow for accents/buttons
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
