import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100 shadow rounded p-8 text-center">
        <h1 className="text-3xl font-bold mb-3">Plan faster with Scrum Poker</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Create a room, invite your team, and estimate with a Fibonacci deck.</p>
        <div className="flex justify-center gap-4">
          <Link to="/create" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded">Create Room</Link>
          <Link to="/join" className="border border-teal-600 text-teal-700 px-6 py-3 rounded">Join Room</Link>
        </div>
      </div>
    </section>
  );
}