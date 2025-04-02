'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import "@/styles/globals.css";

export default function TaskList() {
  const { tasks, dispatch } = useTasks();
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e) => {
    if (e.key === 'Enter' && newTask.trim()) {
      dispatch({ type: 'ADD_TASK', payload: newTask.trim() });
      setNewTask('');
    }
  };

  return (
    <div className="p-4 border-l">
      <h2 className="text-lg font-semibold mb-4 text-black dark:text-gray-100">所有任务</h2>
      <input
        type="text"
        placeholder="添加新任务..."
        className="w-full p-2 border rounded mb-4 text-black dark:text-gray-100"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={handleAddTask}
      />
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 text-black dark:text-gray-100 rounded">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                className="h-4 w-4"
              />
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
            </div>
            <button
              onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}