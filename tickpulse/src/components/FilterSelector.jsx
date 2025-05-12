import React from 'react';
import { useTasks } from '@/context/TaskContext';

const FILTERS = [
  { key: 'all', label: '所有任务' },
  { key: 'today', label: '今日任务' },
  { key: 'completed', label: '已完成任务' }
];

export default function FilterSelector({ vertical = false }) {
  const { selectedView, activeFilter, dispatch } = useTasks();

  const handleFilterSelect = (filter) => {
    dispatch({ type: 'SET_VIEW', payload: 'filter' });
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  return (
    <div className={vertical ? "flex flex-col gap-2 my-4" : "flex gap-2"}>
      {FILTERS.map(filter => (
        <button
          key={filter.key}
          onClick={() => handleFilterSelect(filter.key)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            selectedView === 'filter' && activeFilter === filter.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}