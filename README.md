# LensLog – Offline Photography Companion

A React Native (Expo) mobile app for photographers. Browse photography ideas,
learn camera settings, and keep a journal of your photoshoots. Everything is
stored locally with SQLite, so the app works fully offline.

## Tech Stack

- React Native with Expo (JavaScript / JSX)
- React Navigation (Native Stack + Bottom Tabs)
- expo-sqlite (local database)

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on an Android phone.

## Project Structure

```
src/
├── data/         Seed data for photography ideas
├── navigation/   App navigator (tabs + stack)
├── screens/      All application screens
└── storage/      SQLite database functions
```

## Development Status

- [x] Phase 1 – Project setup
- [ ] Phase 2 – Navigation
- [ ] Phase 3 – Database and seed data
- [ ] Phase 4 – Dashboard
- [ ] Phase 5 – Ideas and details
- [ ] Phase 6 – Camera settings and categories
- [ ] Phase 7 – Journal (CRUD)
- [ ] Phase 8 – Favorites
- [ ] Phase 9 – Settings and UI polish
- [ ] Phase 10 – Testing and documentation