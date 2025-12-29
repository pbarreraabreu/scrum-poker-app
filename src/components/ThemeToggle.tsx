import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Default to dark when no saved preference
    return true;
  });

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (dark) {
      cls.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      cls.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button onClick={() => setDark(v => !v)} className="px-3 py-1 rounded border text-sm" aria-pressed={dark} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}