'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { SunIcon, MoonIcon, CalendarDaysIcon, CheckCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
import ProjectList from './ProjectList';

// Define predefined filters, adding "All Tasks"
const predefinedFilters = [
  { name: '所有任务', filter: 'all', icon: InboxIcon }, // Added "All Tasks"
  { name: '今日任务', filter: 'today', icon: CalendarDaysIcon },
  { name: '已完成', filter: 'completed', icon: CheckCircleIcon },
];

export default function NavigationBar() {
  const { theme, toggleTheme } = useTheme();
  const { dispatch, selectedView, activeFilter } = useTasks();

  const router = useRouter();

  // Function to handle filter selection
  const handleFilterSelect = (filter) => {
    console.log(`Setting filter to: ${filter}`);
    dispatch({ type: 'SET_VIEW', payload: 'filter' });
    dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  return (
    <div className="w-64 h-full bg-gray-100 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 flex flex-col">
      {/* App Logo/Title */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">TickPulse</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto">
        {/* Filters Section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Filters</h2>
          <ul>
            {predefinedFilters.map((item) => (
              <li key={item.filter}>
                <button
                  onClick={() => handleFilterSelect(item.filter)}
                  className={`w-full flex items-center px-2 py-2 text-sm rounded-md mb-1
                    ${selectedView === 'filter' && activeFilter === item.filter
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                    }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Projects Section */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Projects</h2>
          <ProjectList />
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded"
        >
          登出
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="h-5 w-5 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <MoonIcon className="h-5 w-5 mr-2" />
              Dark Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}