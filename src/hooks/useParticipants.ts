import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';

// Participants list computes an online flag; threshold controls offline detection
const ONLINE_THRESHOLD_MS = 15_000; // 15 seconds (reduced for snappier disappearance)

export function useParticipants(sessionId: string) {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(collection(firestore, 'sessions', sessionId, 'participants'), (snap) => {
      const now = Date.now();
      const docs: any[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      // Hysteresis: avoid flicker by requiring a sustained offline period before labeling as "left"
      const OFFLINE_LABEL_MS = 7_000; // 7 seconds
      // keep per-participant timestamps for when they were first observed offline
      const offlineTimestamps = (useParticipants as any)._offlineTimestamps || ((useParticipants as any)._offlineTimestamps = {} as Record<string, number>);

      const withStatus = docs.map((p: any) => {
        const last = (p.lastSeen?.toMillis?.() ?? p.joinedAt?.toMillis?.() ?? now) as number;
        const recentlySeen = (now - last) < ONLINE_THRESHOLD_MS;

        if (recentlySeen) {
          // clear any offline timer
          delete offlineTimestamps[p.id];
        } else if (!offlineTimestamps[p.id]) {
          // start offline timer
          offlineTimestamps[p.id] = now;
        }

        // compute status
        let status: 'online' | 'transient' | 'offline' = 'online';
        if (p.connected === false || p.leftAt) {
          status = 'offline';
        } else if (!recentlySeen) {
          const downSince = offlineTimestamps[p.id] ?? now;
          if ((now - downSince) >= OFFLINE_LABEL_MS) status = 'offline';
          else status = 'transient';
        }

        return { ...p, status, online: status === 'online' };
      });

      // auto-remove participants who have left for longer than AUTO_REMOVE_MS
      const AUTO_REMOVE_MS = 60_000; // 1 minute
      const filtered = withStatus.filter((p: any) => {
        if (!p.leftAt) return true;
        const leftMs = (p.leftAt?.toMillis?.() ?? 0) as number;
        return (now - leftMs) <= AUTO_REMOVE_MS;
      });

      setList(filtered);
    });
    return () => unsub();
  }, [sessionId]);
  return list;
}