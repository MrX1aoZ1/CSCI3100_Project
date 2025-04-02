'use client';

import { useTheme } from '@/context/ThemeContext';
import { ListBulletIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import "@/styles/globals.css";

export default function NavigationBar() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="w-16 border-r flex flex-col items-center py-4 space-y-6">
      <div className="flex-1 space-y-4">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded">
          <ListBulletIcon className="h-6 w-6 text-gray-600 dark:text-gray-100" />
        </button>
      </div>
      <button 
        onClick={toggleTheme}
        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded"
      >
        {darkMode ? (
          <SunIcon className="h-6 w-6 text-yellow-500" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-600" />
        )}
      </button>
    </nav>
  );
}