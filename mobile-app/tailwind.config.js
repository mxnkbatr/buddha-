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
            // Divine Buddha Aura Palette
            monk: {
                primary: '#D4AF37', // Metallic Gold - Primary Accent
                secondary: '#291E14', // Deep Warm Brown - Secondary
                accent: '#E6C762', // Light Gold - Highlights
                bg: '#FDFBF7', // Cream - Luminous background
                text: '#291E14', // Deep Warm Brown - Base Text
                surface: '#FFFFFF', // Pure White for Cards
                glass: 'rgba(255, 255, 255, 0.6)', // Ethereal Glassmorphism
                'surface-highlight': '#F8F5EE', // Active states/borders
                'deep-red': '#7F1D1D', // Deep Red for Live stream
                gold: '#D4AF37', // Core Gold
                'dark-surface': '#FAF6F0', // Dimmer Cream (avoiding actual dark mode)
                'dark-bg': '#FDFBF7', // Kept bright for divine feel
                aura: '#FFF9E6', // Soft golden glow for animations
            },
            earth: {
                100: '#FDFBF7', // Cream
                200: '#F8F5EE', // Dim Cream
                300: '#E8E0D5', // Warm Border
                400: '#D5C4B3', // Soft Taupe
                500: '#A89F91', // Warm Grey
                600: '#786851', // Medium Brown
                700: '#544636', // Dark Brown
                800: '#3D2E1F', // Deep Mocha
                900: '#291E14', // Deepest Warm Brown
            }
        },
    },
    plugins: [],
};
