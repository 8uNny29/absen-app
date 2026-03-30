# AbsenApp — Google Forms Attendance Automation

A React Native (Expo) mobile app that automates attendance submission via Google Forms — built for real-world use by multiple staff members on a single device.

Instead of manually filling out forms every day, AbsenApp injects user profile data directly into the Google Form via WebView and auto-submits it within seconds of loading.

## Features

- **Multi-profile support** — Multiple employee profiles (ID, full name, WhatsApp number) can be stored and switched on a single device
- **Google Forms autofill** — Injects custom JavaScript into WebView to accurately fill text fields, click radio buttons, and handle native Google Form dropdowns
- **Google Auth pre-flight login** — Handles Google account authentication with isolated cookie management to bypass WebView restrictions
- **Submission detection** — Text matching to confirm successful attendance recording with user notification

## Tech Stack

- **React Native** + **Expo** — cross-platform mobile framework
- **TypeScript** — typed JavaScript
- **React Navigation** — screen and stack navigation
- **AsyncStorage** — local profile data persistence
- **React Native WebView** — in-app browser for form injection

## Getting Started

Make sure [Node.js](https://nodejs.org/) is installed.

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your Android or iOS device.

## Build APK (Android)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

When prompted for an application ID, use `com.absen.app`. Allow Expo to generate the keystore automatically. Download the `.apk` from the build link when complete.

## How It Works

AbsenApp uses a WebView-based automation approach:

1. User selects their profile
2. App loads the Google Form URL in a WebView
3. On page load, a JavaScript payload is injected to fill all form fields
4. Form is auto-submitted and success is detected via text matching

> **Note:** The autofill script targets Google Form's current DOM structure. If Google updates their form architecture, the injection script may need to be updated accordingly.

## Use Case

Originally built for a team that needed to submit daily attendance via Google Forms without manual input — reducing the process from ~2 minutes to under 5 seconds per person.

## Author

Muhammad Rafi Rabani — [jasainput.id](https://jasainput.id)
