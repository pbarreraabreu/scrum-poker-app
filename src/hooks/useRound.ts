import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';

export function useRound(sessionId: string, roundId?: string) {
  const [round, setRound] = useState<any | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    if (roundId) {
      const rdoc = doc(firestore, 'sessions', sessionId, 'rounds', roundId);
      const unsub = onSnapshot(rdoc, (snap) => setRound(snap.exists() ? { id: snap.id, ...snap.data() } : null));
      return () => unsub();
    }
    const q = query(collection(firestore, 'sessions', sessionId, 'rounds'), where('status', 'in', ['voting','revealed']));
    const unsub = onSnapshot(q, (snap) => {
      // choose latest startedAt
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a:any,b:any) => (a.startedAt?.toMillis?.()||0) - (b.startedAt?.toMillis?.()||0));
        const last = docs.length ? docs[docs.length - 1] : null;
        setRound(last);
    });
    return () => unsub();
  }, [sessionId, roundId]);
  return round;
}