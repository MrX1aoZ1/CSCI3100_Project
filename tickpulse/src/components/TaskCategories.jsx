'use client';

import { useTasks } from '@/context/TaskContext';
import "@/styles/globals.css";

const categories = [
  { id: 'all', name: 'All Tasks' },
  { id: 'today', name: 'Today\'s Tasks' },
  { id: 'completed', name: 'Completed' },
  { id: 'abandoned', name: 'Abandoned' }
];

export default function TaskCategories() {
  const { activeCategory } = useTasks();

  return (
    <div className="p-4 space-y-2">
      {categories.map(category => (
        <button
          key={category.id}
          className={`w-full p-2 text-left rounded ${
            activeCategory === category.id 
              ? 'bg-gray-200 dark:bg-zinc-500 text-black dark:text-gray-100' 
              : 'hover:bg-gray-100 dark:hover:bg-zinc-600 text-black dark:text-gray-100'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}