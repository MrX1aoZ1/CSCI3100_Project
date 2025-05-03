'use client';

import { useState } from 'react';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';
import { useTasks } from '@/context/TaskContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from './ErrorBoundary';

// Update the priorities array to include 'none'
const priorities = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export default function TaskModule() {
  const { selectedTaskId, dispatch, projects } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('none'); // Changed to 'none'
  const [newTaskProjectId, setNewTaskProjectId] = useState("null");

  const handleAddTask = () => {
    const trimmedTitle = newTaskTitle.trim();
    if (trimmedTitle) {
      const payload = {
        title: trimmedTitle,
        deadline: newTaskDeadline === '' ? null : newTaskDeadline,
        priority: newTaskPriority,
        // Fix: assign to 'inbox' if no project selected
        projectId: newTaskProjectId === "null" ? "inbox" : newTaskProjectId,
        completed: false // 确保新任务默认为未完成状态
      };
      // Log the payload before dispatching
      console.log('Dispatching ADD_TASK with payload:', payload);
      dispatch({
        type: 'ADD_TASK',
        payload: payload // Use the defined payload variable
      });
      // Reset input fields
      setNewTaskTitle('');
      setNewTaskDeadline('');
      setNewTaskPriority('none'); // Changed to 'none'
      setNewTaskProjectId("null");
    } else {
      // Optional: Log if title is empty
      console.log('Add task cancelled: Title is empty.');
    }
  };

  const handleAddTaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-zinc-700 items-center flex-shrink-0">
        {/* Title Input */}
        <div className="flex-grow">
          <label htmlFor="newTaskTitleModule" className="sr-only">Task Title</label>
          <input
            type="text"
            id="newTaskTitleModule" // 使用不同的 id 避免冲突
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleAddTaskKeyDown}
            className="w-full p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Deadline Input */}
        <div className="flex-shrink-0">
           <label htmlFor="newTaskDeadlineModule" className="sr-only">Deadline</label>
           <input
             type="date"
             id="newTaskDeadlineModule"
             value={newTaskDeadline}
             onChange={(e) => setNewTaskDeadline(e.target.value)}
             title="Set deadline"
             className="p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           />
        </div>
        {/* Priority Selector */}
        <div className="flex-shrink-0">
           <label htmlFor="newTaskPriorityModule" className="sr-only">Priority</label>
           <select
             id="newTaskPriorityModule"
             value={newTaskPriority}
             onChange={(e) => setNewTaskPriority(e.target.value)}
             title="Set priority"
             className="p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           >
             {priorities.map(p => (
               <option key={p.value} value={p.value}>{p.label}</option>
             ))}
           </select>
        </div>
        {/* Project Selector */}
        <div className="flex-shrink-0">
           <label htmlFor="newTaskProjectModule" className="sr-only">Project</label>
           <select
             id="newTaskProjectModule"
             value={newTaskProjectId}
             onChange={(e) => setNewTaskProjectId(e.target.value)}
             title="Assign to project"
             className="p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           >
             <option value="null">-- No Project --</option>
             {projects.map(project => (
                 <option key={project.id} value={project.id}>
                   {project.name}
                 </option>
             ))}
           </select>
        </div>
        {/* Add Button */}
        <button
          onClick={handleAddTask}
          className="p-2 border rounded bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex-shrink-0 border-blue-500 dark:border-blue-600 disabled:opacity-50"
          title="Add Task"
          disabled={!newTaskTitle.trim()}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      {/* --- End Add Task Bar --- */}


      {/* --- Bottom: Two Columns Area --- */}
      {/* 使用 flex-1 使其填充剩余垂直空间，并使用 flex (row) 排列子元素 */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Column: Task List */}
        {/* 设置宽度，添加右边框 */}
        <div className="w-2/5 border-r border-gray-200 dark:border-zinc-700 overflow-hidden flex flex-col"> {/* 使用 flex flex-col 确保 TaskList 能正确填充 */}
          {/* 渲染已简化的 TaskList */}
          <TaskList />
        </div>

        {/* Right Column: Task Detail */}
        {/* 使用 flex-1 填充剩余水平空间 */}
        <div className="flex-1 overflow-y-auto"> {/* 允许 TaskDetail 内部滚动 */}
          <TaskDetail />
        </div>
      </div>
      {/* --- End Two Columns Area --- */}

    </div>
  );
}