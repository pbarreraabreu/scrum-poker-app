import { useState } from 'react';
import { ensureAnon, firestore } from '../services/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function genCode() { return Math.random().toString(36).slice(2, 7).toUpperCase(); }

export default function CreateRoom() {
  const [name, setName] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    try {
      const authUser = await ensureAnon();
      // Ensure code uniqueness by checking sessions by code (client-side best-effort)
      let code = genCode();
      const q = query(collection(firestore, 'sessions'), where('code', '==', code));
      const snap = await getDocs(q);
      if (!snap.empty) {
        code = genCode();
      }

      const sessionId = crypto.randomUUID();
      const sessionRef = doc(firestore, 'sessions', sessionId);
      await setDoc(sessionRef, {
        code,
        name: name || null,
        facilitatorUid: authUser.uid,
        deck: { id: 'fibonacci', values: [1,2,3,5,8,13,21] },
        createdAt: serverTimestamp(),
        status: 'active'
      });

      const participantRef = doc(firestore, 'sessions', sessionId, 'participants', authUser.uid);
      await setDoc(participantRef, {
        nickname: facilitatorName || 'Facilitator',
        role: 'facilitator',
        joinedAt: serverTimestamp(),
        connected: true,
        uid: authUser.uid
      });

      navigate(`/room/${sessionId}`);
    } catch (err: any) {
      console.error('Create room failed:', err);
      alert(err?.message || 'Failed to create room. Check Firestore rules and Anonymous Auth.');
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
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Sprint Planning" />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">Your name (facilitator)</span>
          <input value={facilitatorName} onChange={e=>setFacilitatorName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Your name" />
        </label>
        <button onClick={createRoom} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </section>
  );
}