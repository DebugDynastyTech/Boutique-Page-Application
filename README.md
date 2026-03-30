# Boutique App — Production Ready

WebView wrapper for `https://1it.in/boutique-page/adm_control/login`
with animated gold luxury splash screen.

---

## ✅ Your Setup
- Node: v20.20.1 (nvm)
- Expo CLI: 0.22.28
- SDK: 52 | RN: 0.76.7 | newArchEnabled: false

---

## 1. Install dependencies

```bash
cd BoutiqueApp
npm install
```

---

## 2. Build APK for Play Store

### Option A — EAS Cloud Build (RECOMMENDED, no Android Studio needed)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login / create free account at expo.dev
eas login

# First time only
eas build:configure

# Build APK for internal testing / sideload
eas build -p android --profile preview

# Build AAB for Play Store submission
eas build -p android --profile production
```

EAS emails you + shows a download link when done (~8–12 min).

---

### Option B — Local build (requires Android Studio + Java 17)

```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/
```

---

## 3. Play Store checklist

- [ ] Use `production` profile → outputs `.aab` (required by Play Store)
- [ ] Set `versionCode` in `app.json` → increment for each upload
- [ ] Add your app icon/screenshots in Play Console
- [ ] Fill Privacy Policy URL (required for apps with WebView)

---

## 📁 File map

```
app/_layout.tsx   ← Expo Router root, hides native splash instantly
app/index.tsx     ← Animated splash + WebView (only mounts after splash)
assets/           ← icon, adaptive-icon, splash, favicon
app.json          ← SDK 52, newArchEnabled false, package name
eas.json          ← preview=APK, production=AAB
package.json      ← all deps pinned to SDK 52 exact versions
babel.config.js   ← babel-preset-expo
```

## ✏️ Change the URL

Edit `app/index.tsx`, line 12:
```ts
const WEBSITE_URL = 'https://1it.in/boutique-page/adm_control/login';
```
