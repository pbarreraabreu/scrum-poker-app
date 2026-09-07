import { useEffect } from 'react';
import { auth, firestore, database } from '../services/firebase';
import { doc, setDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { ref as dbRef, set as dbSet, onDisconnect, serverTimestamp as dbServerTs } from 'firebase/database';

// Heartbeat + unload best-effort marking for presence; RTDB onDisconnect for reliable removal
export function usePresence(sessionId?: string) {
  useEffect(() => {
    if (!sessionId) return;
    const user = auth.currentUser;
    if (!user) return;
    const participantRef = doc(firestore, 'sessions', sessionId, 'participants', user.uid);
    const presenceRef = dbRef(database, `presence/${sessionId}/${user.uid}`);

    // initial ping (Firestore)
    console.debug('presence: initial ping', { sessionId, uid: user.uid });
    setDoc(participantRef, { lastSeen: serverTimestamp(), connected: true, leftAt: deleteField() }, { merge: true }).catch((e)=>{ console.debug('presence: initial ping failed', e); });

    // initial RTDB presence and onDisconnect removal
    dbSet(presenceRef, { uid: user.uid, lastSeen: Date.now() }).catch((e)=>{ console.debug('presence: rtdb initial set failed', e); });
    onDisconnect(presenceRef).remove().catch((e)=>{ console.debug('presence: onDisconnect setup failed', e); });

    const id = setInterval(() => {
      console.debug('presence: heartbeat', { sessionId, uid: user.uid });
      setDoc(participantRef, { lastSeen: serverTimestamp(), connected: true }, { merge: true }).catch((e)=>{ console.debug('presence: heartbeat failed', e); });
      dbSet(presenceRef, { uid: user.uid, lastSeen: Date.now() }).catch((e)=>{ console.debug('presence: rtdb heartbeat failed', e); });
    }, 5000); // more frequent heartbeat

    const onUnload = () => {
      // best-effort on unload
      console.debug('presence: unload', { sessionId, uid: user.uid });
      setDoc(participantRef, { connected: false, leftAt: serverTimestamp() }, { merge: true }).catch((e)=>{ console.debug('presence: unload failed', e); });
      // attempt to remove RTDB key as well (best-effort)
      dbSet(presenceRef, null).catch(()=>{});
    };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);

    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
      // mark offline when component unmounts
      console.debug('presence: cleanup unmount', { sessionId, uid: user.uid });
      setDoc(participantRef, { connected: false, leftAt: serverTimestamp() }, { merge: true }).catch((e)=>{ console.debug('presence: cleanup failed', e); });
    };
  }, [sessionId]);
}
