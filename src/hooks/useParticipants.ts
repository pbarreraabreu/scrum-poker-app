import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';

export function useParticipants(sessionId: string) {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(collection(firestore, 'sessions', sessionId, 'participants'), (snap) => {
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [sessionId]);
  return list;
}