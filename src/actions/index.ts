import { auth, firestore, ensureAnon } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp, getDoc, addDoc, deleteDoc } from 'firebase/firestore';

export async function createRoom(name?: string) {
  const user = await ensureAnon();
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();
  const sessionId = crypto.randomUUID();
  const sessionRef = doc(firestore, 'sessions', sessionId);
  await setDoc(sessionRef, {
    code,
    name: name || null,
    facilitatorUid: user.uid,
    deck: { id: 'fibonacci', values: [1,2,3,5,8,13,21] },
    createdAt: serverTimestamp(),
    status: 'active'
  });
  const participantRef = doc(firestore, 'sessions', sessionId, 'participants', user.uid);
  await setDoc(participantRef, { nickname: 'Facilitator', role: 'facilitator', joinedAt: serverTimestamp(), connected: true, uid: user.uid });
  return sessionId;
}

export async function joinRoomByCode(code: string, nickname: string, role: 'player'|'spectator' = 'player') {
  const user = await ensureAnon();
  // Find session by code
  throw new Error('Not implemented in this placeholder file. Use page JoinRoom for now.');
}

export async function startRound(sessionId: string, story?: { title?: string; link?: string }) {
  const user = auth.currentUser!;
  if (!user) await ensureAnon();
  const roundsCol = collection(firestore, 'sessions', sessionId, 'rounds');
  const roundRef = doc(roundsCol, crypto.randomUUID());
  await setDoc(roundRef, { status: 'voting', story: story || null, startedAt: serverTimestamp() });
  const sessionRef = doc(firestore, 'sessions', sessionId);
  await updateDoc(sessionRef, { activeRoundId: roundRef.id });
}

export async function castVote(sessionId: string, roundId: string, value: number | string) {
  const user = await ensureAnon();
  const voteRef = doc(firestore, 'sessions', sessionId, 'rounds', roundId, 'votes', user.uid);
  await setDoc(voteRef, { value, castAt: serverTimestamp() });
}

export async function revealRound(sessionId: string, roundId: string) {
  const user = await ensureAnon();
  const roundRef = doc(firestore, 'sessions', sessionId, 'rounds', roundId);
  await updateDoc(roundRef, { status: 'revealed', revealedAt: serverTimestamp() });
}

export async function resetRound(sessionId: string, roundId: string) {
  const user = await ensureAnon();
  // Facilitator should delete votes; enforced by rules
  const votesCol = collection(firestore, 'sessions', sessionId, 'rounds', roundId, 'votes');
  const snap = await getDoc(doc(firestore, 'sessions', sessionId));
  if (!snap.exists()) return;
  // Client-side: delete my own vote (others will be deletable if facilitator)
  const myVoteRef = doc(votesCol, user.uid);
  try { await deleteDoc(myVoteRef); } catch {}
}