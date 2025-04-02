'use client';

import { useTasks } from '@/context/TaskContext';

const categories = [
  { id: 'all', name: '所有任务' },
  { id: 'today', name: '今日任务' },
  { id: 'completed', name: '已完成' },
  { id: 'abandoned', name: '已放弃' }
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
              ? 'bg-blue-100 dark:bg-slate-700' 
              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}