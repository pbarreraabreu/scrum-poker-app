import { useState } from 'react';
import { ensureAnon, firestore } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DISPLAY_NAME_STORAGE_KEY = 'scrumPoker.displayName';

function genCode() { return Math.random().toString(36).slice(2, 7).toUpperCase(); }
function cleanOptionalText(value: string, maxLength: number) {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : '';
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function CreateRoom() {
  const [name, setName] = useState('');
  const [facilitatorName, setFacilitatorName] = useState(() => localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    try {
      const authUser = await ensureAnon();
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
        facilitatorUid: authUser.uid,
        deck: { id: 'fibonacci', values: [1,2,3,5,8,13,21] },
        createdAt: serverTimestamp(),
        status: 'active'
      });
      await setDoc(roomCodeRef, {
        sessionId,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      const participantRef = doc(firestore, 'sessions', sessionId, 'participants', authUser.uid);
      const displayName = cleanOptionalText(facilitatorName, 40) || 'Facilitator';
      await setDoc(participantRef, {
        nickname: displayName,
        role: 'facilitator',
        joinedAt: serverTimestamp(),
        connected: true,
        lastSeen: serverTimestamp(),
        leftAt: deleteField(),
        uid: authUser.uid
      }, { merge: true });
      localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName);

      navigate(`/room/${sessionId}`);
    } catch (err: unknown) {
      console.error('Create room failed:', err);
      alert(getErrorMessage(err, 'Failed to create room. Check Firestore rules and Anonymous Auth.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 shadow rounded p-6">
        <h2 className="text-2xl font-semibold mb-4">Create a Room</h2>
        <label className="block mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">Room name (optional)</span>
          <input value={name} onChange={e=>setName(e.target.value)} maxLength={80} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Sprint Planning" />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">Your name (facilitator)</span>
          <input value={facilitatorName} onChange={e=>setFacilitatorName(e.target.value)} maxLength={40} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Your name" />
        </label>
        <button onClick={createRoom} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </section>
  );
}
