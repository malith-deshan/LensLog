# LensLog – Offline Photography Companion

LensLog is a React Native (Expo) mobile app for photographers. Browse
photography ideas with recommended camera settings, learn the exposure
triangle, and keep a journal of your own photoshoots. All data is stored on
the device with SQLite, so the app works fully offline.

> Individual university project – React Native with Expo.

## Features

- **Dashboard** – live statistics, recently added ideas, quick actions
- **Ideas** – 26 built-in photography ideas with search and category filter
- **Idea details** – description, recommended ISO / aperture / shutter speed, favorite toggle
- **Camera settings guide** – ISO, aperture, shutter speed, exposure triangle, practical examples
- **Categories** – 9 categories with live idea counts and related ideas
- **Journal** – create, view, edit, and delete photoshoot records (full CRUD) with search and filter
- **Form validation** – required fields, real-date check, ISO / aperture / shutter format checks
- **Favorites** – save and remove favorite ideas
- **Settings** – about, offline information, and clear local data with confirmation
- **Loading, error, and empty states** on every data screen

## Tech Stack

| Area | Technology |
|---|---|
| Framework | React Native with Expo (Expo Go compatible) |
| Language | JavaScript (JSX) |
| Navigation | React Navigation (Native Stack + Bottom Tabs) |
| Database | SQLite via `expo-sqlite` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Version control | Git and GitHub |

## Getting Started

**Requirements:** Node.js (LTS), Git, and the **Expo Go** app on an Android phone.

```bash
git clone https://github.com/malith-deshan/LensLog.git
cd LensLog
npm install
npx expo start
```

Scan the QR code with Expo Go. The phone and computer must be on the same
Wi-Fi network. If they cannot connect, run `npx expo start --tunnel`.

No Android Studio, accounts, API keys, or internet connection are needed to use the app.

## Project Structure

```
LensLog/
├── assets/                    App icons and splash images
├── src/
│   ├── data/
│   │   └── seedData.jsx       Categories, category icons, 26 seed ideas
│   ├── navigation/
│   │   └── AppNavigator.jsx   Bottom tabs and stack navigator
│   ├── screens/
│   │   ├── DashboardScreen.jsx
│   │   ├── IdeasScreen.jsx
│   │   ├── IdeaDetailScreen.jsx
│   │   ├── CameraSettingsScreen.jsx
│   │   ├── JournalScreen.jsx
│   │   ├── AddShootScreen.jsx
│   │   ├── ShootDetailScreen.jsx
│   │   ├── CategoriesScreen.jsx
│   │   ├── FavoritesScreen.jsx
│   │   └── SettingsScreen.jsx
│   └── storage/
│       └── storage.jsx        All SQLite functions
├── App.jsx                    Database initialization and root component
├── index.js                   Expo entry point
├── TESTING.md                 Test plan
└── README.md
```

## Navigation

```
NavigationContainer
└── Native Stack
    ├── MainTabs (Bottom Tabs)
    │   ├── Dashboard
    │   ├── Ideas
    │   ├── Journal
    │   ├── Favorites
    │   └── Settings
    ├── IdeaDetail      (param: ideaId)
    ├── CameraSettings
    ├── Categories
    ├── AddShoot        (param: shootId, optional, used for editing)
    └── ShootDetail     (param: shootId)
```

## Database

SQLite database `lenslog.db`, created on first launch.

| Table | Columns |
|---|---|
| `ideas` | id, title, category, description, iso, aperture, shutter_speed |
| `shoots` | id, title, location, date, category, notes, iso, aperture, shutter_speed, created_at |
| `favorites` | idea_id (references ideas), created_at |

- Built-in ideas are seeded **once**, tracked with SQLite's `PRAGMA user_version`, so user data is never overwritten on restart.
- All queries are parameterized.
- Storage functions (`src/storage/storage.jsx`): `initializeDatabase`, `getIdeas`, `getIdeaById`, `getShoots`, `getShootById`, `addShoot`, `updateShoot`, `deleteShoot`, `getFavorites`, `isFavorite`, `addFavorite`, `removeFavorite`, `getDashboardStatistics`, `clearUserData`.
- "Clear local data" deletes shoots and favorites only. The built-in ideas are kept.

## Design

Dark professional theme.

| Role | Color |
|---|---|
| Background | `#101114` |
| Card | `#1C1E23` |
| Secondary | `#292C33` |
| Primary accent | `#F2A65A` |
| White | `#FFFFFF` |
| Muted text | `#92949B` |
| Border | `#30333A` |

## Git Branch Strategy

Each feature was developed on its own branch and merged into `main` through a GitHub Pull Request.

| Branch | Purpose |
|---|---|
| `feature/setup` | Project setup, JSX entry point, folder structure |
| `feature/navigation` | Tabs, stack, and placeholder screens |
| `feature/database` | SQLite storage layer and seed data |
| `feature/dashboard` | Dashboard screen |
| `feature/ideas` | Ideas, idea details, camera settings guide, categories |
| `feature/journal` | Journal list, add/edit form, shoot details, delete |
| `feature/favorites` | Favorites screen |
| `feature/settings` | Settings screen and UI polish |
| `feature/testing` | Test plan, fixes, and documentation |

## Testing

The full manual test plan is in [TESTING.md](TESTING.md). It covers startup,
navigation, every screen, validation, persistence, and offline use.

## Known Limitations

- Shoot dates are typed as `YYYY-MM-DD` (a **Today** button is provided) instead of using a date picker, to avoid extra dependencies.
- Photos cannot be attached to journal records.
- Built-in ideas are read-only.
- Data lives only on the device, so uninstalling the app or clearing Expo Go's storage removes it.

## Author

Malith Deshan – University project