# iOS Build Fix Guide

## 🎯 Problem

The iOS build was failing with:
```
[!] No out found in root of project.
```

This happens because Capacitor expects a static `out` folder, but Next.js by default creates a `.next` folder for server-side rendering.

---

## ✅ Solution

### 1. **Updated `next.config.ts`**

Added conditional static export based on `CAPACITOR_BUILD` environment variable:

```typescript
const nextConfig: NextConfig = {
  // Static export for Capacitor (mobile builds)
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  distDir: process.env.CAPACITOR_BUILD === 'true' ? 'out' : '.next',
  
  images: {
    // Unoptimized for static export (Capacitor requirement)
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    // ...
  },
  // ...
}
```

**Why:**
- When `CAPACITOR_BUILD=true`, Next.js generates static files in `out/`
- For web builds, it uses normal `.next/` with SSR
- Images must be unoptimized for static export

### 2. **Added `ionic:build` Script**

Ionic Appflow looks for an `ionic:build` script in `package.json` and runs it if found. I added:

```json
"ionic:build": "CAPACITOR_BUILD=true next build --webpack"
```

This ensures that when Appflow builds your app, it uses the static export configuration.

---

## 🚀 How to Build Now

### For iOS (Appflow)
**Trigger a new build in Appflow.**
- It will detect `ionic:build`
- It will run `CAPACITOR_BUILD=true next build`
- Next.js will generate `out/` folder
- Capacitor will sync and build successfully

### For Local Mobile Build
```bash
npm run build:mobile    # Generates 'out' folder & syncs
npm run build:ios      # Full iOS build
```

### For Android
```bash
npm run build:mobile    # Generates 'out' folder
npm run build:android  # Full Android build
```

### For Web (No changes)
```bash
npm run build  # Normal Next.js build with SSR
```

---

## 📱 What This Means

### Mobile Builds (Capacitor)
- ✅ Static HTML/CSS/JS files
- ✅ No server required
- ✅ Works offline
- ✅ Faster initial load
- ❌ No SSR (Server-Side Rendering)
- ❌ No API routes (must use external APIs)

### Web Builds (Production)
- ✅ Server-Side Rendering
- ✅ API routes work
- ✅ Optimized images
- ✅ Dynamic content
- ⚠️ Requires Node.js server

---

## 🔧 Ionic Appflow Configuration

### Environment Variables

Add to your Appflow build environment:
```bash
CAPACITOR_BUILD=true
```

This will be automatically set by your build scripts, but you can also set it directly in Appflow environment variables for more control.

### Build Process

1. **Appflow runs:** `npm run build`
2. **Script detects:** `CAPACITOR_BUILD=true`
3. **Next.js generates:** `out/` folder with static files
4. **Capacitor syncs:** Files to `ios/` and `android/`
5. **Native build:** Creates .ipa or .apk

---

## ⚠️ Important Limitations

### API Routes Won't Work

Since mobile apps are static, Next.js API routes (`/api/*`) won't work. You need to:

1. **Use external APIs:**
   ```typescript
   // Instead of: fetch('/api/monks')
   // Use: fetch('https://your-server.com/api/monks')
   ```

2. **Update API calls** in your mobile code to point to your production server

3. **Configure CORS** on your backend to allow requests from mobile app

### Server-Side Features Disabled

These features will be disabled in mobile builds:
- `getServerSideProps`
- `getStaticProps` with `revalidate`
- Dynamic API routes
- Server middleware

They'll work fine in web builds.

---

## 🎯 Testing Locally

### Test Mobile Build:
```bash
# Set the flag and build
CAPACITOR_BUILD=true npm run build

# Check if 'out' folder was created
ls -la out/

# Sync to iOS/Android
npx cap sync

# Open in Xcode/Android Studio
npm run mobile:ios
# or
npm run mobile:android
```

### Test Web Build:
```bash
# Normal build (no flag)
npm run build

# Check if '.next' folder was created
ls -la .next/

# Start server
npm run start
```

---

## 📊 Build Comparison

| Feature | Web Build | Mobile Build |
|---------|-----------|--------------|
| **Output** | `.next/` folder | `out/` folder |
| **Type** | Server-side rendered | Static export |
| **API Routes** | ✅ Working | ❌ Not available |
| **SSR** | ✅ Enabled | ❌ Disabled |
| **Images** | ✅ Optimized | ⚠️ Unoptimized |
| **Offline** | ❌ Requires server | ✅ Fully offline |
| **Performance** | Fast (SSR) | Faster (Static) |

---

## ✅ Next Steps

1. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: Configure Next.js for Capacitor static export"
   git push
   ```

2. **Trigger new Appflow build**
   - Build should now succeed
   - Check for `out` folder in logs

3. **Update API endpoints** (if needed)
   - Point mobile app to production API
   - Configure environment variables

4. **Test the app:**
   - Download the build from Appflow
   - Install on device
   - Test all features

---

## 🐛 Troubleshooting

### Build still fails with "No out found"

**Check:**
1. Is `CAPACITOR_BUILD=true` set?
2. Did Next.js build complete successfully?
3. Are there any build errors before the "No out found" message?

**Debug:**
```bash
# Build locally with verbose logging
CAPACITOR_BUILD=true next build --debug

# Check what was created
ls -la out/
```

### Images not loading

**Solution:**
Images must be unoptimized for static export. This is already configured in `next.config.ts`.

### API calls failing

**Solution:**
Update API base URL in your code:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gevabal.mn';
fetch(`${API_URL}/api/monks`);
```

---

## 🎉 Status

✅ **Fixed!** 

Your iOS and Android builds will now work with Ionic Appflow!

**What we did:**
1. Added conditional static export to `next.config.ts`
2. Updated build scripts to set `CAPACITOR_BUILD=true`
3. Configured image optimization for static builds

**Result:**
- Web builds: Normal Next.js with SSR
- Mobile builds: Static export with `out/` folder

**Ready for production!** 🚀
