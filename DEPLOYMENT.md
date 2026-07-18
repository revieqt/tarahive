# DEPLOYMENT.md

# TaraHive Mobile Deployment (EAS)

This guide explains how to build and deploy the TaraHive mobile app using Expo Application Services (EAS).

---

## Prerequisites

- Node.js LTS
- Expo CLI
- EAS CLI
- Expo account
- Apple Developer Account (iOS)
- Google Play Developer Account (Android)

Install EAS CLI:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

---

# 1. Install Dependencies

```bash
npm install
```

---

# 2. Configure Environment Variables

Create a local `.env`:

```env
API_URL=https://api.example.com
MAPTILER_KEY=xxxxxxxx
GOOGLE_MAPS_API_KEY=xxxxxxxx
```

These values are loaded by `app.config.ts`.

For production, store secrets in EAS instead of committing `.env`.

Example:

```bash
eas env:create
```

or through the Expo dashboard.

---

# 3. Configure EAS

Initialize EAS if not already done.

```bash
eas build:configure
```

This generates:

```
eas.json
```

Example configuration:

```json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

---

# 4. Verify Expo Configuration

Check generated configuration:

```bash
npx expo config
```

Ensure:

- App name
- Bundle identifier
- Package name
- Environment variables
- Plugins

are correct.

---

# 5. Android Build

Development build:

```bash
eas build --platform android --profile development
```

Preview build:

```bash
eas build --platform android --profile preview
```

Production build:

```bash
eas build --platform android --profile production
```

---

# 6. iOS Build

Development:

```bash
eas build --platform ios --profile development
```

Production:

```bash
eas build --platform ios --profile production
```

The first build will guide you through certificate and provisioning profile setup.

---

# 7. Submit to Google Play

```bash
eas submit --platform android
```

or upload the generated `.aab` manually through Google Play Console.

---

# 8. Submit to Apple App Store

```bash
eas submit --platform ios
```

or upload manually through App Store Connect.

---

# Updating the App

Increase the application version if needed.

Build again:

```bash
eas build --platform android --profile production
```

or

```bash
eas build --platform ios --profile production
```

Submit the new build.

---

# Local Native Build

For testing native code locally:

Android:

```bash
npx expo run:android
```

iOS:

```bash
npx expo run:ios
```

---

# Common Commands

Start development server:

```bash
npx expo start
```

Clear cache:

```bash
npx expo start --clear
```

Check Expo configuration:

```bash
npx expo config
```

View build history:

```bash
eas build:list
```

View build details:

```bash
eas build:view
```

Download credentials:

```bash
eas credentials
```

---

# Release Checklist

- Update version number
- Verify environment variables
- Test Android
- Test iOS
- Verify API connectivity
- Verify Maps
- Verify Push Notifications
- Verify Authentication
- Verify Deep Links
- Run final production build
- Submit to stores

---

# References

- https://docs.expo.dev/build/introduction/
- https://docs.expo.dev/submit/introduction/
- https://docs.expo.dev/eas/