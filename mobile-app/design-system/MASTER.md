# MASTER DESIGN SYSTEM: Gilded Minimalism

## Overview
A high-end, spiritual, and wellness-focused design system that balances earthy grounding with premium metallic accents. This design system is built for React Native (Expo) using NativeWind (Tailwind CSS).

## 1. Color Palette

**Primary (Gold/Metallic):**
- `gold-500`: `#D4AF37` (Metallic Gold - Primary Accent)
- `gold-600`: `#AA8C2C` (Deep Gold - Active States)
- `gold-400`: `#E6C762` (Light Gold - Highlights)

**Neutral (Slate/Cream):**
- `slate-900`: `#0F172A` (Pure Dark - Main Text in Light Mode / Background in Dark Mode)
- `slate-800`: `#1E293B` (Soft Dark - Surface in Dark Mode)
- `cream-50`: `#FDFBF7` (Warm Cream - Background in Light Mode)
- `cream-100`: `#F3EFE6` (Surface in Light Mode)

**Semantic:**
- `error`: `#7F1D1D` (Deep Red)
- `success`: `#14532D` (Deep Green)

## 2. Typography
- **Headings:** Crisp, minimal scale. Use `font-serif` (Playfair Display or similar) for primary headers to evoke elegance.
- **Body:** `font-sans` (Inter/SF Pro) for extreme legibility.
- **Contrast:** Ensure high contrast. Light mode uses text-slate-900 on cream-50. Dark mode uses text-cream-50 on slate-900.

## 3. UI Components

### Buttons
- **Primary:** `bg-gold-500` with `text-slate-900` for high contrast. Must include haptic feedback on press.
- **Secondary:** Glassmorphism (`bg-white/10` or `bg-slate-900/5` with blur) and slate text.
- **Borders:** Crisp borders (`border-width: 1px`, `border-gold-500`).
- **Rounding:** Minimalist rounding (`rounded-md` or `rounded-lg`). Avoid excessive pill shapes unless for specific tags.

### Cards & Surfaces
- **Light Mode:** `bg-cream-100` with subtle, crisp shadows (`shadow-sm`).
- **Dark Mode:** `bg-slate-800` with gold border accents (`border border-gold-500/20`).

## 4. UX Guidelines (The "Pro Max" Polish)
- **Haptics:** `Haptics.impactAsync(Light)` on EVERY interactive tag, button, and tab switch.
- **Snappiness:** Remove artificial delays. Animations should be under 200ms.
- **Offline States:** Graceful degradation. If network fails, show cached data with a subtle "Offline" indicator.
- **Touch Targets:** Minimum `48x48px` for all interactive elements.

## 5. Anti-Patterns to Avoid 🚫
- **Pure White Backgrounds:** `#FFFFFF` looks cheap. Use `#FDFBF7` (Cream) instead.
- **Pure Black:** `#000000` is harsh. Use `#0F172A` (Slate 900).
- **Missing Feedback:** Never leave a button without visual (opacity/color change) and tactile (haptic) feedback.
- **Cluttered Lists:** Always use `FlatList` with memoized items for performance.
