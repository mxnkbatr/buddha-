# UI/UX Orchestration Plan: Divine Radiance

**Target:** Web App (`app/`) and Mobile App (`mobile-app/`)
**Aesthetic:** Divine Radiance (Deep obsidian/espresso backgrounds, glowing gold/amber interactive elements, warm-tinted glassmorphism)

---

## Phase 1: Planning (Completed)
- ✅ Aesthetic chosen: Divine Radiance
- ✅ Cross-platform scope defined

## Phase 2: Implementation (Pending Approval)

The following parallel tracks will be executed once approved:

### Track 1: Web App (`frontend-specialist`)
**Goal:** Apply Divine Radiance to the Next.js web app.
1. **Design Tokens:** Update `tailwind.config.ts` and `app/globals.css` to define the "Divine Radiance" color palette (obsidian backgrounds, amber glows, warm text).
2. **Global Components:** 
   - Refactor primary Buttons to include an amber/"divine" glow on hover.
   - Update Card/Container components to use warm-tinted glassmorphism (`bg-white/5` or `bg-amber-900/10` with backdrop blur).
3. **Typography & Spacing:** Improve breathing room and ensure high-contrast legibility for text over dark-warm backgrounds.

### Track 2: Mobile App (`mobile-developer`)
**Goal:** Apply identical Divine Radiance styling to the Expo React Native app.
1. **Design Tokens:** Update `mobile-app/constants/Colors.ts` to strictly match the web palette.
2. **Core Components:**
   - Enhance `ThemedView` and `ThemedText` to support the new warm-dark mode.
   - Update `Button` components to feature exact Reanimated glow effects mimicking the web hover states (triggered on press), plus haptic feedback.
3. **Screen Refactoring:** Apply to key screens like `profile.tsx`, `booking/[id].tsx`, and tab bars to ensure the aesthetic is completely unified.

### Track 3: Verification (`test-engineer` / `performance-optimizer`)
**Goal:** Ensure quality and performance.
1. **Contrast & UX Audit:** Verify light/dark mode legibility (4.5:1 ratio minimum).
2. **Performance Audit:** Ensure blur effects don't destroy mobile framerates or web performance.

---

## 🛑 CHECKPOINT
**Are you ready to approve this plan and proceed to Phase 2 (Implementation) with multiple agents?**
