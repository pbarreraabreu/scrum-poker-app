import { useEffect } from 'react';
import { auth, firestore, database } from '../services/firebase';
import { doc, setDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { ref as dbRef, set as dbSet, onDisconnect } from 'firebase/database';

// Heartbeat + unload best-effort marking for presence; RTDB onDisconnect for reliable removal
export function usePresence(sessionId?: string) {
  useEffect(() => {
    if (!sessionId) return;
    const user = auth.currentUser;
    if (!user) return;
    const participantRef = doc(firestore, 'sessions', sessionId, 'participants', user.uid);
    const presenceRef = dbRef(database, `presence/${sessionId}/${user.uid}`);

    setDoc(participantRef, { lastSeen: serverTimestamp(), connected: true, leftAt: deleteField() }, { merge: true }).catch(() => {});

    dbSet(presenceRef, { uid: user.uid, lastSeen: Date.now() }).catch(() => {});
    onDisconnect(presenceRef).remove().catch(() => {});

    const id = setInterval(() => {
      setDoc(participantRef, { lastSeen: serverTimestamp(), connected: true }, { merge: true }).catch(() => {});
      dbSet(presenceRef, { uid: user.uid, lastSeen: Date.now() }).catch(() => {});
    }, 5000); // more frequent heartbeat

    const onUnload = () => {
      setDoc(participantRef, { connected: false, leftAt: serverTimestamp() }, { merge: true }).catch(() => {});
      dbSet(presenceRef, null).catch(()=>{});
    };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);

    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
      setDoc(participantRef, { connected: false, leftAt: serverTimestamp() }, { merge: true }).catch(() => {});
    };
  }, [sessionId]);
}
