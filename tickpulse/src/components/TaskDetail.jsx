'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import MarkdownEditor from './MarkdownEditor';

export default function TaskDetail() {
  const { tasks, selectedTaskId, dispatch } = useTasks();
  const [content, setContent] = useState('');

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    setContent(selectedTask?.content || '');
  }, [selectedTask]);

  const handleContentChange = (newValue) => {
    if (!selectedTask) return;
    dispatch({ 
      type: 'UPDATE_CONTENT', 
      payload: { id: selectedTask.id, content: newValue } 
    });
  };

  return (
    <div className="h-full flex flex-col border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {selectedTask?.title || '任务详情'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {selectedTask ? (
          <MarkdownEditor 
            value={content}
            onChange={handleContentChange}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            请从左侧选择任务
          </div>
        )}
      </div>
    </div>
  );
}