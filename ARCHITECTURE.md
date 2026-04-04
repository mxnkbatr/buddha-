# Buddha App Architecture

This document outlines the technical architecture, data flows, and configuration of the Buddha spiritual platform.

## Data Flow
Client → Capacitor WebView → gevabal.mn (Next.js) → MongoDB

- **Client**: Native mobile (iOS/Android) or Web browser.
- **Capacitor**: Provides the bridge to native device features (Push, Storage, Haptics).
- **Backend**: Next.js App Router API endpoints.
- **Database**: MongoDB for persistent document storage.

## Auth Flow
- **Web**: Clerk Authentication → Session synchronization via `/api/auth/me` → `AuthContext` state management.
- **Mobile**: Traditional Phone/Password login → `/api/auth/client-login` → JWT issued → Saved to `SecureStorage` (Capacitor) → Authorized requests using `Bearer` token to `/api/auth/me`.

## User Roles
| Role | Capabilities |
| :--- | :--- |
| **seeker** | Browse monks, book rituals, message spiritual guides, manage profile. |
| **monk** | Professional dashboard, manage weekly schedule, reply to seeker messages, view earnings. |
| **admin** | All monk capabilities + approve/reject monk applications, manage global users, services, and all bookings. |

## API Map
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/monks` | Public list of monks (cached 15min on server, stale-while-revalidate 10min). |
| GET | `/api/monks/[id]` | Monk detail profile. |
| GET | `/api/bookings` | Fetch authenticated user's current/past bookings. |
| POST | `/api/bookings` | Create a new ritual booking request. |
| PATCH | `/api/bookings/[id]` | Update booking status (Monk/Admin only). |
| GET | `/api/conversations` | Retrieve list of active chat threads for the user. |
| GET | `/api/messages/[id]` | Retrieve full message history for a specific thread. |
| POST | `/api/messages/[id]` | Send a new direct message. |
| GET | `/api/admin/data` | High-level admin dashboard statistics. |
| PATCH | `/api/admin/users/[id]` | Update user role or permissions. |

## Capacitor Plugins Used
- `@capacitor/app`: Native back button handling and app state monitoring.
- `@capacitor/haptics`: Touch feedback for premium UI interactions.
- `@capacitor/keyboard`: Intelligent keyboard resizing and accessory bar management.
- `@capacitor/preferences`: High-performance offline storage and caching.
- `@capacitor/splash-screen`: Native splash screen synchronization with Web UI.
- `@capacitor/status-bar`: Dynamic status bar styling (Light/Dark/Overlay).
- `@capacitor/push-notifications`: Firebase Cloud Messaging (FCM) integration (In Implementation).

## Known Issues → Fixed
- **MASTER_PASSWORD Security**: Now strictly managed via environment variables instead of hardcoded strings.
- **Debugging Safety**: `webContentsDebuggingEnabled` now strictly respects the `isDev` flag to prevent unauthorized inspection in production.
- **Message Performance**: Transitioning from 5s polling to the optimized message framework.
- **Booking Integrity**: Implemented atomic locks/checks to prevent scheduling conflicts.
- **Offline Resilience**: Implemented a comprehensive fallback layer using Capacitor Preferences and background refreshes.
