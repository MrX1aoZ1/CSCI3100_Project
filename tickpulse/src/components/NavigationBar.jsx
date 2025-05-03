'use client';

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon, CalendarDaysIcon, CheckCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
import { useTasks } from '@/context/TaskContext';
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
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  // Set isClient to true only after mounting on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelectFilter = (filter) => {
    dispatch({ type: 'SET_VIEW', payload: { view: 'filter', filter: filter } });
  };

  return (
    <div className="w-64 h-screen flex flex-col border-r border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">

      {/* Logo/Header */}
      <div className="p-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-black dark:text-white">TickPulse</h1>
      </div>

      {/* Predefined Filters Section */}
      <nav className="px-2 py-4 space-y-1 flex-shrink-0">
        {predefinedFilters.map((item) => { // This map function now includes "All Tasks"
          const Icon = item.icon;
          // Determine isActive based on context state, BUT only apply styling if isClient is true
          const isActive = selectedView === 'filter' && activeFilter === item.filter;
          // Default to inactive style for server render and initial client render
          const activeClasses = 'bg-gray-200 dark:bg-zinc-600 text-black dark:text-white';
          const inactiveClasses = 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700';
          const iconInactiveClasses = 'text-gray-500 dark:text-gray-400';

          return (
            <button
              key={item.name}
              onClick={() => handleSelectFilter(item.filter)}
              // Apply active styles only after client mount and if the item is active
              className={`w-full flex items-center px-3 py-2 rounded text-sm font-medium ${
                isClient && isActive ? activeClasses : inactiveClasses // Apply active style only when isClient is true
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${
                isClient && isActive ? '' : iconInactiveClasses // Apply active icon style only when isClient is true
              }`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Divider (Optional) */}
      <hr className="border-gray-200 dark:border-zinc-600 mx-2"/>

      {/* Project List Section */}
      {/* ProjectList needs similar isClient logic if its highlighting depends on localStorage state */}
      {/* We'll modify ProjectList next */}
      <div className="flex-grow overflow-y-auto pt-2">
        <ProjectList />
      </div>

      {/* Theme Toggle */}
      {/* Theme toggle might also need isClient check if theme is loaded from localStorage */}
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-zinc-700 flex-shrink-0">
         <button
           onClick={toggleTheme}
           className="w-full flex items-center justify-center p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 text-black dark:text-gray-100"
           title="Toggle Theme"
         >
           {/* Conditionally render icons based on theme *after* mount */}
           {isClient ? (theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />) : <MoonIcon className="h-6 w-6" /> /* Default icon for SSR */}
           <span className="ml-2">Toggle Theme</span>
         </button>
      </div>
    </div>
  );
}