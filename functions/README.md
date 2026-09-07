Functions in this project:

- onPresenceWrite: mirrors RTDB presence writes to Firestore participant docs (sets lastSeen, connected true)
- onPresenceRemoved: when RTDB presence is removed (onDisconnect), mark Firestore participant as {connected:false, leftAt: serverTimestamp()}

To deploy:
1. cd functions
2. npm install
3. npm run build
4. firebase deploy --only functions

Ensure your Firebase project has the Realtime Database enabled and security rules configured appropriately.