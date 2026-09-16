import { useEffect, useState } from 'react';
import { ensureAnon, firestore } from '../services/firebase';
import { deleteField, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { ParticipantRole, RoomCodeLookup } from '../types';

const DISPLAY_NAME_STORAGE_KEY = 'scrumPoker.displayName';
const ROOM_CODE_PATTERN = /^[A-Z0-9]{5}$/;

function cleanNickname(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 40) : 'Guest';
}

function isJoinRole(value: string): value is Extract<ParticipantRole, 'player' | 'spectator'> {
  return value === 'player' || value === 'spectator';
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function JoinRoom() {
  const [code, setCode] = useState('');
  const [codeLocked, setCodeLocked] = useState(false);
  const [nickname, setNickname] = useState(() => localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || '');
  const [role, setRole] = useState<Extract<ParticipantRole, 'player' | 'spectator'>>('player');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Prefill code from query string ?code=XXXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code');
    if (c) {
      setCode(c.toUpperCase());
      setCodeLocked(true);
    }
  }, []);

  const join = async () => {
    setLoading(true);
    try {
      const user = await ensureAnon();
      const normalizedCode = code.trim().toUpperCase();
      if (!ROOM_CODE_PATTERN.test(normalizedCode)) {
        alert('Enter a valid 5-character room code');
        return;
      }

      const roomCodeSnap = await getDoc(doc(firestore, 'roomCodes', normalizedCode));
      if (!roomCodeSnap.exists()) {
        alert('Room not found');
        return;
      }

      const sessionId = (roomCodeSnap.data() as RoomCodeLookup).sessionId;
      if (!sessionId) {
        alert('Room lookup is incomplete. Please check the room code and try again.');
        return;
      }

      const participantRef = doc(firestore, 'sessions', sessionId, 'participants', user.uid);
      const displayName = cleanNickname(nickname);
      await setDoc(participantRef, {
        nickname: displayName,
        role,
        joinedAt: serverTimestamp(),
        connected: true,
        lastSeen: serverTimestamp(),
        leftAt: deleteField(),
        uid: user.uid,
        joinCode: normalizedCode
      }, { merge: true });
      localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName);

      navigate(`/room/${sessionId}`);
    } catch (err: unknown) {
      console.error('Join room failed:', err);
      alert(getErrorMessage(err, 'Room not found'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 shadow rounded p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Join a Room</h2>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">Room code</span>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase().slice(0, 5))} maxLength={5} className="mt-1 w-full border rounded px-3 py-2 uppercase disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="ABCDE" disabled={codeLocked} readOnly={codeLocked} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">Nickname</span>
          <input value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={40} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">Role</span>
          <select
            value={role}
            onChange={e => {
              if (isJoinRole(e.target.value)) setRole(e.target.value);
            }}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="player">Player</option>
            <option value="spectator">Spectator</option>
          </select>
        </label>
        <button onClick={join} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </section>
  );
}
