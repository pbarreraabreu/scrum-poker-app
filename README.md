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
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```
3. Firebase Hosting init and deploy:
   - Run `firebase login` and `firebase init` (Hosting + Firestore + Realtime Database). Set `dist` as public directory.

## Security and privacy
- Firebase web config is public by design; access control is enforced by Firebase rules.
- Room codes and room links are invitations. Share them only with people who should join the room.
- Session details, participants, rounds, and votes are readable only by joined participants.
- Realtime Database presence is scoped so users can write only their own presence entry.
- For production abuse protection, consider enabling Firebase App Check in the Firebase Console.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — build
- `npm run preview` — preview build
- `npm run deploy` — deploy via Firebase Hosting
