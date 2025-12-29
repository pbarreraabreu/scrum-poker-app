import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-gray-50 dark:bg-gray-900 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Scrum Poker Logo" className="w-16 h-14 md:w-24 md:h-16 object-contain" />
        </Link>
        <nav className="flex items-center gap-4">          
          <NavLink to="/create" className={({isActive}) => isActive ? 'text-teal-700 dark:text-teal-300 font-medium' : 'text-gray-700 dark:text-gray-200'}>Create Room</NavLink>
          <NavLink to="/join" className={({isActive}) => isActive ? 'text-teal-700 dark:text-teal-300 font-medium' : 'text-gray-700 dark:text-gray-200'}>Join Room</NavLink>          
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}