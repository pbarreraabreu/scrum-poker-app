import { useEffect, useState } from 'react';
import { ensureAnon, firestore } from '../services/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function JoinRoom() {
  const [code, setCode] = useState('');
  const [codeLocked, setCodeLocked] = useState(false);
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'player'|'spectator'>('player');
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
    const user = await ensureAnon();

    const q = query(collection(firestore, 'sessions'), where('code', '==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) { setLoading(false); return alert('Room not found'); }
    const sessionDoc = snap.docs[0];
    const sessionId = sessionDoc.id;

    const participantRef = doc(firestore, 'sessions', sessionId, 'participants', user.uid);
    await setDoc(participantRef, {
      nickname: nickname || 'Guest',
      role,
      joinedAt: serverTimestamp(),
      connected: true,
      uid: user.uid
    }, { merge: true });

    navigate(`/room/${sessionId}`);
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 shadow rounded p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Join a Room</h2>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">Room code</span>
          <input value={code} onChange={e=>setCode(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 uppercase disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="ABCDE" disabled={codeLocked} readOnly={codeLocked} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">Nickname</span>
          <input value={nickname} onChange={e=>setNickname(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700 dark:text-gray-300">Role</span>
          <select value={role} onChange={e=>setRole(e.target.value as any)} className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
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