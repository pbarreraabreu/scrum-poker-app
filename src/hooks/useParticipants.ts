import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';
import type { Participant } from '../types';

const ONLINE_THRESHOLD_MS = 15_000;
const OFFLINE_LABEL_MS = 7_000;
const AUTO_REMOVE_MS = 60_000;

const offlineTimestamps: Record<string, number> = {};

export function useParticipants(sessionId: string) {
  const [list, setList] = useState<Participant[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSnapshot(collection(firestore, 'sessions', sessionId, 'participants'), (snap) => {
      const now = Date.now();
      const docs = snap.docs.map((participantDoc) => ({
        id: participantDoc.id,
        ...participantDoc.data(),
      })) as Array<Omit<Participant, 'status' | 'online'>>;

      const withStatus = docs.map((participant) => {
        const lastSeenMs = participant.lastSeen?.toMillis?.() ?? participant.joinedAt?.toMillis?.() ?? now;
        const recentlySeen = now - lastSeenMs < ONLINE_THRESHOLD_MS;

        if (recentlySeen) {
          delete offlineTimestamps[participant.id];
        } else if (!offlineTimestamps[participant.id]) {
          offlineTimestamps[participant.id] = now;
        }

        let status: Participant['status'] = 'online';
        if (participant.connected === false || participant.leftAt) {
          status = 'offline';
        } else if (!recentlySeen) {
          const downSince = offlineTimestamps[participant.id] ?? now;
          status = now - downSince >= OFFLINE_LABEL_MS ? 'offline' : 'transient';
        }

        return { ...participant, status, online: status === 'online' };
      });

      const filtered = withStatus.filter((participant) => {
        if (!participant.leftAt) return true;
        const leftMs = participant.leftAt.toMillis?.() ?? 0;
        return now - leftMs <= AUTO_REMOVE_MS;
      });

      setList(filtered);
    });

    return () => unsub();
  }, [sessionId]);

  return list;
}
