import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';
import type { Round } from '../types';

export function useRound(sessionId: string, roundId?: string) {
  const [round, setRound] = useState<Round | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    if (roundId) {
      const roundDoc = doc(firestore, 'sessions', sessionId, 'rounds', roundId);
      const unsub = onSnapshot(roundDoc, (snap) => {
        setRound(snap.exists() ? ({ id: snap.id, ...snap.data() } as Round) : null);
      });
      return () => unsub();
    }

    const activeRoundsQuery = query(
      collection(firestore, 'sessions', sessionId, 'rounds'),
      where('status', 'in', ['voting', 'revealed']),
    );
    const unsub = onSnapshot(activeRoundsQuery, (snap) => {
      const docs = snap.docs.map((roundDoc) => ({ id: roundDoc.id, ...roundDoc.data() } as Round));
      docs.sort((a, b) => (a.startedAt?.toMillis?.() ?? 0) - (b.startedAt?.toMillis?.() ?? 0));
      setRound(docs.length ? docs[docs.length - 1] : null);
    });

    return () => unsub();
  }, [sessionId, roundId]);

  return round;
}
