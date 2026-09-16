import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useParticipants } from '../hooks/useParticipants';
import { useRound } from '../hooks/useRound';
import { usePresence } from '../hooks/usePresence';
import { auth, firestore, ensureAnon } from '../services/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { castVote, revealRound, startRound } from '../actions';

const FIB = [1,2,3,5,8,13,21, '☕'];

export default function Room() {
  const { sessionId } = useParams();
  const session = useSession(sessionId!);
  const participants = useParticipants(sessionId!);
  usePresence(sessionId);
  const round = useRound(sessionId!, session?.activeRoundId);
  const [votes, setVotes] = useState<Record<string, any>>({});
  const me = auth.currentUser;
  const isFacilitator = me && session?.facilitatorUid === me.uid;
  const [copied, setCopied] = useState(false);

  useEffect(() => { ensureAnon(); }, []);

  useEffect(() => {
    // Subscribe to the currently active round (use `round?.id` so we still subscribe
    // if the round was discovered by the rounds-query before the session was updated)
    if (!sessionId || !round?.id) {
      setVotes({}); return;
    }
    const unsub = onSnapshot(collection(firestore, 'sessions', sessionId, 'rounds', round.id, 'votes'), (snap) => {
      const v: Record<string, any> = {};
      snap.forEach(d => { v[d.id] = d.data(); });
      setVotes(v);
    });
    return () => { unsub(); };
  }, [sessionId, round?.id]);

  const stats = useMemo(() => {
    const vals = Object.values(votes).map(v => Number(v.value)).filter(v => !Number.isNaN(v));
    if (!vals.length) return null;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
    const mode = vals.sort((a,b)=>a-b).reduce((m:Record<number,number>,v)=>{m[v]=(m[v]||0)+1;return m;},{})
    const top = Object.entries(mode).sort((a:any,b:any)=>b[1]-a[1])[0][0];
    return { min, max, avg, mode: Number(top) };
  }, [votes]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 dark:text-gray-100 p-4 rounded shadow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-semibold">{session?.name || 'Room'}</div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${round?.status === 'voting' ? 'bg-amber-300 text-black dark:bg-amber-500 dark:text-black' : ''}
                ${round?.status === 'revealed' ? 'bg-emerald-500 text-white' : ''}
                ${!round?.status ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' : ''}
              `}>
                {round?.status === 'voting' ? 'Voting' : round?.status === 'revealed' ? 'Revealed' : 'Waiting to start'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded">Code: {session?.code}</span>
          <button
            onClick={() => {
              const url = location.origin + '/join?code=' + (session?.code || '');
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              });
            }}
            className="px-3 py-1 rounded bg-teal-600 text-white text-sm"
            aria-label="Copy join link"
            title="Copy join link"
          >
            Copy link
          </button>
          {copied && <span className="text-xs text-gray-500">Copied!</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
  <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 p-4 rounded shadow">
            <div className="flex justify-between mb-2">
              <div className="font-medium">Participants</div> 
              <div className="flex items-center gap-3">
                {isFacilitator && (
                  round?.status === 'voting' ? (
                    <button
                      onClick={() => round && revealRound(sessionId!, round.id)}
                      className="px-3 py-1 rounded bg-teal-600 text-white"
                    >
                      Reveal
                    </button>
                  ) : (
                    <button
                      onClick={() => startRound(sessionId!)}
                      className="px-3 py-1 rounded bg-emerald-500 text-white"
                    >
                      {round?.status === 'revealed' ? 'Start Next Round' : 'Start Round'}
                    </button>
                  )
                )}
              </div>
             </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {participants.map(p => {
                const voted = Boolean(votes[p.id]);
                const revealed = round?.status === 'revealed';
                const offline = p.status === 'offline';
                const value = offline ? '-' : (votes[p.id]?.value);
                return (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <div className={
                      `poker-card ` +
                      (revealed ? 'revealed ' : voted ? 'voted ' : 'not-yet closed ') +
                      (offline ? 'offline' : '')
                    }>
                      <div className="card-inner">
                        <div className="card-face card-front">
                          {/* masked side: no text, design-only */}
                        </div>
                        <div className="card-face card-back">
                          <span className="corner top-left">{value ?? '-'}</span>
                          <span className="value">{value ?? '-'}</span>
                          <span className="corner bottom-right">{value ?? '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      <div className="font-medium">{p.nickname}{offline ? ' • left' : ''}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{p.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 p-4 rounded shadow">
            <div className="font-medium mb-2">Deck</div>
            <div className="flex flex-wrap gap-3">
              {FIB.map(v => {
                const selected = !!me && votes[me.uid]?.value === v;
                const disabled = round?.status === 'revealed';
                return (
                  <button
                    key={v}
                    onClick={() => !disabled && round && castVote(sessionId!, round.id, v)}
                    disabled={disabled}
                    className={
                      `poker-card deck ` +
                      (selected ? 'selected ' : '') +
                      (disabled ? 'disabled ' : '')
                    }
                    aria-pressed={selected}
                      aria-label={`Vote ${typeof v === 'number' ? v : 'coffee'}`}
                  >
                      <span className="corner top-left">{v}</span>
                      <span className="value">{v}</span>
                      <span className="corner bottom-right">{v}</span>
                  </button>
                );
              })}
              {(() => {
                const selected = !!me && votes[me.uid]?.value === '?';
                const disabled = round?.status === 'revealed';
                return (
                  <button
                    onClick={() => !disabled && round && castVote(sessionId!, round.id, '?')}
                    disabled={disabled}
                    className={
                      `poker-card deck ` +
                      (selected ? 'selected ' : '') +
                      (disabled ? 'disabled ' : '')
                    }
                    aria-pressed={selected}
                    aria-label={`Vote unknown`}
                  >
                    <span className="corner top-left">?</span>
                    <span className="value">?</span>
                    <span className="corner bottom-right">?</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="space-y-4">

          <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 p-4 rounded shadow">
            <div className="font-medium mb-2">Round</div>
            {round?.status === 'revealed' && stats && (
              <div className="mt-4 space-y-1 text-sm">
                <div>Min: {stats.min}</div>
                <div>Max: {stats.max}</div>
                <div>Avg: {stats.avg}</div>
                <div>Mode: {stats.mode}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
