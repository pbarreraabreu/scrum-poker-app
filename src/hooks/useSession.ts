import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';

export function useSession(sessionId: string) {
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(doc(firestore, 'sessions', sessionId), (snap) => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return () => unsub();
  }, [sessionId]);
  return data;
}