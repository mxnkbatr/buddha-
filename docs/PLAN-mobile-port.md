# Implementation Plan - Mobile App Porting

The goal is to port core features (Monks, Rituals, Booking, Profile) from the web app (`app/`) to the mobile app (`mobile-app/`), leveraging the existing Next.js API as the backend.

## User Review Required

> [!IMPORTANT]
> **Backend Change**: I will modify `app/api/users/profile/route.ts` to add a `GET` method. This allows the mobile app to fetch the current user's extended profile data (Karma, Zodiac, etc.) using the auth token.

## Proposed Changes

### Shared Types
#### [NEW] [mobile-app/src/types/schema.ts](file:///home/puujee/buddha/mobile-app/src/types/schema.ts)
-   Copy content from `database/types.ts` to ensure type safety across frontend and mobile.

### Backend (Web API)
#### [MODIFY] [app/api/users/profile/route.ts](file:///home/puujee/buddha/app/api/users/profile/route.ts)
-   Add `export async function GET(request: Request)` handler.
-   Logic: Verify token (Clerk/Custom), fetch user from MongoDB, return user object (excluding password).

### Mobile App Core
#### [MODIFY] [mobile-app/lib/api.ts](file:///home/puujee/buddha/mobile-app/lib/api.ts)
-   Update `getBaseUrl` to ensure it works with the local dev server (IP address for Android Emulator).
-   Add `getUserProfile()` function.
-   Ensure `createBooking` are correctly typed with the new schema.

#### [NEW] [mobile-app/store/userStore.ts](file:///home/puujee/buddha/mobile-app/store/userStore.ts)
-   Create a Zustand store to manage the fetched `User` profile data.

### Feature: Home & Profile
#### [MODIFY] [mobile-app/app/(tabs)/index.tsx](file:///home/puujee/buddha/mobile-app/app/(tabs)/index.tsx)
-   Connect to `userStore` to display the user's real name and "Karma" or "Zodiac" stats if available.

#### [MODIFY] [mobile-app/app/(tabs)/profile.tsx](file:///home/puujee/buddha/mobile-app/app/(tabs)/profile.tsx)
-   Fetch and display full profile details from the API.

### Feature: Monks & Rituals
#### [NEW] [mobile-app/src/screens/MonkListScreen.tsx](file:///home/puujee/buddha/mobile-app/src/screens/MonkListScreen.tsx)
-   Fetch monks using `getMonks()`.
-   Render using a new `MonkCard` component.

#### [MODIFY] [mobile-app/app/(tabs)/rituals.tsx](file:///home/puujee/buddha/mobile-app/app/(tabs)/rituals.tsx)
-   Replace simulated data with `getServices()` from API.

## Verification Plan

### Automated Tests
-   None currently set up for mobile. Will rely on manual verification.

### Manual Verification
1.  **Backend**:
    -   Use `curl` or Postman to hit `GET http://localhost:3000/api/users/profile` with a valid Bearer token. Confirm it returns user JSON.
2.  **Mobile App**:
    -   **Auth**: Sign in via Clerk.
    -   **Home**: Verify "Good Morning, [Name]" shows the real name from DB.
    -   **Rituals**: Verify the list matches the database services.
    -   **Monks**: Verify the monk list loads images and names correctly.
