export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-2 items-center justify-between">
        <div>© {new Date().getFullYear()} Scrum Poker</div>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-teal-700 dark:hover:text-teal-300">Privacy</a>
          <a href="#help" className="hover:text-teal-700 dark:hover:text-teal-300">Help</a>
        </div>
      </div>
    </footer>
  );
}