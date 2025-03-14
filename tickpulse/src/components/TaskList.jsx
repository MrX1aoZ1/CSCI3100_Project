'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';

export default function TaskList() {
  const { categories, activeCategory, tasks, dispatch } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const currentCategory = categories.find(c => c.id === activeCategory);

  const handleAddTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      dispatch({ type: 'ADD_TASK', payload: newTaskTitle.trim() });
      setNewTaskTitle('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{currentCategory?.name}</h2>
      </div>
      
      <div className="p-4">
        <input
          type="text"
          placeholder="输入任务名称，按回车创建"
          className="w-full p-2 border rounded mb-4 dark:bg-slate-800"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleAddTask}
        />
        
        <div className="space-y-2">
          {tasks.filter(task => {
            if (activeCategory === 'all') return true;
            // 其他分类过滤逻辑（后续扩展）
            return true;
          }).map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task }) {
  const { selectedTaskId, dispatch } = useTasks();
  
  return (
    <div
      onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })}
      className={`p-3 rounded cursor-pointer ${
        selectedTaskId === task.id 
          ? 'bg-blue-100 dark:bg-slate-700' 
          : 'hover:bg-gray-100 dark:hover:bg-slate-800'
      }`}
    >
      {task.title}
    </div>
  );
}