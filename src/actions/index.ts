import { collection, deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, ensureAnon, firestore } from '../services/firebase';
import { isValidVote, type VoteValue } from '../utils/voting';

function genCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function cleanOptionalText(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed.slice(0, maxLength) : '';
}

export async function createRoom(name?: string) {
  const user = await ensureAnon();
  let code = genCode();
  let roomCodeRef = doc(firestore, 'roomCodes', code);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const snap = await getDoc(roomCodeRef);
    if (!snap.exists()) break;
    code = genCode();
    roomCodeRef = doc(firestore, 'roomCodes', code);
  }

  const sessionId = crypto.randomUUID();
  const sessionRef = doc(firestore, 'sessions', sessionId);
  await setDoc(sessionRef, {
    code,
    name: cleanOptionalText(name, 80) || null,
    facilitatorUid: user.uid,
    deck: { id: 'fibonacci', values: [1, 2, 3, 5, 8, 13, 21] },
    createdAt: serverTimestamp(),
    status: 'active',
  });
  await setDoc(roomCodeRef, {
    sessionId,
    createdAt: serverTimestamp(),
    status: 'active',
  });

  const participantRef = doc(firestore, 'sessions', sessionId, 'participants', user.uid);
  await setDoc(participantRef, {
    nickname: 'Facilitator',
    role: 'facilitator',
    joinedAt: serverTimestamp(),
    connected: true,
    lastSeen: serverTimestamp(),
    leftAt: deleteField(),
    uid: user.uid,
  }, { merge: true });
  return sessionId;
}

export async function startRound(sessionId: string) {
  const user = auth.currentUser;
  if (!user) await ensureAnon();
  const roundsCol = collection(firestore, 'sessions', sessionId, 'rounds');
  const roundRef = doc(roundsCol, crypto.randomUUID());
  await setDoc(roundRef, { status: 'voting', story: null, startedAt: serverTimestamp() });
  const sessionRef = doc(firestore, 'sessions', sessionId);
  await updateDoc(sessionRef, { activeRoundId: roundRef.id });
}

export async function castVote(sessionId: string, roundId: string, value: VoteValue) {
  if (!isValidVote(value)) {
    throw new Error('Invalid vote value');
  }

  const user = await ensureAnon();
  const voteRef = doc(firestore, 'sessions', sessionId, 'rounds', roundId, 'votes', user.uid);
  await setDoc(voteRef, { value, castAt: serverTimestamp() });
}

export async function revealRound(sessionId: string, roundId: string) {
  await ensureAnon();
  const roundRef = doc(firestore, 'sessions', sessionId, 'rounds', roundId);
  await updateDoc(roundRef, { status: 'revealed', revealedAt: serverTimestamp() });
}
