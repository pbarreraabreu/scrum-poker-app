# Scrum Poker (React + Firebase)

Free Scrum Poker web app using React + Vite, TailwindCSS, React Router, and Firebase (Firestore + Hosting + Anonymous Auth).

## Features
- Create rooms with a Fibonacci deck
- Join by code, vote, reveal (facilitator-only)
- Responsive UI with header/footer

## Setup
1. Install dependencies:
   - Use Node.js 18+.
2. Create `.env` with Firebase config:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
3. Firebase Hosting init and deploy:
   - Run `firebase login` and `firebase init` (Hosting + Firestore). Set `dist` as public directory.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — build
- `npm run preview` — preview build
- `npm run deploy` — deploy via Firebase Hosting
