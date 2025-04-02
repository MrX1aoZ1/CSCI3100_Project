'use client';

import { useTasks } from '@/context/TaskContext';

export default function TaskDetail() {
  const { tasks, selectedTaskId } = useTasks();
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  return (
    <div className="p-4 border-l h-full">
      {selectedTask ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
          <textarea
            value={selectedTask.content}
            onChange={(e) => dispatch({
              type: 'UPDATE_CONTENT',
              payload: { id: selectedTask.id, content: e.target.value }
            })}
            className="w-full h-64 p-2 border rounded"
            placeholder="输入任务详情..."
          />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400">
          请选择任务查看详情
        </div>
      )}
    </div>
  );
}