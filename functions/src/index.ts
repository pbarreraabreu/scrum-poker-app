import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// When an RTDB presence entry is created or updated, mirror to Firestore participant (lastSeen/connected)
export const onPresenceWrite = functions.database
  .ref('/presence/{sessionId}/{uid}')
  .onWrite(async (change, context) => {
    const { sessionId, uid } = context.params as any;
    const val = change.after.exists() ? change.after.val() : null;
    const ref = db.doc(`sessions/${sessionId}/participants/${uid}`);
    if (val) {
      // presence set/updated
      return ref.set({ lastSeen: admin.firestore.FieldValue.serverTimestamp(), connected: true }, { merge: true });
    } else {
      // deleted is handled by onDelete
      return null;
    }
  });

// When an RTDB presence entry is removed (onDisconnect), mark participant leftAt in Firestore
export const onPresenceRemoved = functions.database
  .ref('/presence/{sessionId}/{uid}')
  .onDelete(async (snapshot, context) => {
    const { sessionId, uid } = context.params as any;
    const ref = db.doc(`sessions/${sessionId}/participants/${uid}`);
    try {
      await ref.set({ connected: false, leftAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch (e) {
      console.error('onPresenceRemoved error', e);
    }
    return null;
  });
