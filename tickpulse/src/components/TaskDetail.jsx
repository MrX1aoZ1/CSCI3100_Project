'use client';

import { useTasks } from '@/context/TaskContext';
import "@/styles/globals.css";

export default function TaskDetail() {
  const { tasks, selectedTaskId, dispatch } = useTasks();
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const handleContentChange = (e) => {
    if (!selectedTask) return;
    
    dispatch({
      type: 'UPDATE_CONTENT',
      payload: {
        id: selectedTask.id,
        content: e.target.value
      }
    });
  };

  return (
    <div className="h-full p-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-zinc-600 dark:hover:scrollbar-thumb-zinc-500">
      {selectedTask ? (
        <div className="flex-1">
          <h2 className="text-xl font-semibold break-words whitespace-normal">
            {selectedTask.title}
          </h2>
          <div className="h-full">
          <textarea
            value={selectedTask.content || ''}
            onChange={handleContentChange}
            className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="输入任务详情..."
          />
          </div>
        </div>
        
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400">
          请从左侧选择任务
        </div>
      )}
    </div>
  );
}