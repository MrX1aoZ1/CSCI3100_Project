'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define priority options
const priorities = [
    { value: 'none', label: 'None' }, // Added 'none' option
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export default function TaskDetails() {
  // Destructure projects along with other needed values
  const { tasks, projects, selectedTaskId, dispatch } = useTasks();
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  // Local state for editing
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('none'); // Changed default to 'none'
  const [projectId, setProjectId] = useState(null); // Added state for project

  // Update local state when selected task changes
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || '');
      setContent(selectedTask.content || '');
      // Format date for input type="date" (YYYY-MM-DD)
      setDeadline(selectedTask.deadline ? selectedTask.deadline.split('T')[0] : '');
      setPriority(selectedTask.priority || 'none'); // Changed default to 'none'
      setProjectId(selectedTask.projectId || null); // Added project state update
    } else {
      // Clear fields if no task is selected
      setTitle('');
      setContent('');
      setDeadline('');
      setPriority('none'); // Changed default to 'none'
      setProjectId(null); // Added project reset
    }
  }, [selectedTask]);

  const handleClose = () => {
    dispatch({ type: 'SELECT_TASK', payload: null });
  };

  // Generic update handler
  const handleUpdate = (field, value) => {
     if (!selectedTask) return;

     let updatePayload = { [field]: value };

     // Special handling for deadline if needed (e.g., ensuring correct format)
     if (field === 'deadline') {
         // Ensure empty string becomes null, or handle date formatting if necessary
         updatePayload[field] = value === '' ? null : value;
     }

     dispatch({
       type: 'UPDATE_TASK',
       payload: {
         taskId: selectedTask.id,
         updates: updatePayload
       }
     });
   };


  if (!selectedTask) {
    return (
      <div className="flex-1 bg-white dark:bg-zinc-800 p-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a task to see details
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-zinc-800 p-6 flex flex-col relative overflow-y-auto">
       <button
         onClick={handleClose}
         className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
         title="Close Details"
       >
         <XMarkIcon className="h-6 w-6" />
       </button>

      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Task Details</h2>

      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleUpdate('title', title)} // Update on blur
          className="w-full p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content Textarea */}
      <div className="mb-4">
         <label htmlFor="taskContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
         <textarea
           id="taskContent"
           rows="4"
           value={content}
           onChange={(e) => setContent(e.target.value)}
           onBlur={() => handleUpdate('content', content)} // Update on blur
           className="w-full p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
         ></textarea>
       </div>


      {/* --- Deadline Input --- */}
      <div className="mb-4">
        <label htmlFor="taskDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
        <input
          type="date" // Use date input type
          id="taskDeadline"
          value={deadline}
          onChange={(e) => {
              setDeadline(e.target.value); // Update local state immediately
              handleUpdate('deadline', e.target.value); // Dispatch update on change
          }}
          className="w-full p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {/* --- End Deadline Input --- */}

      {/* --- Priority Selector --- */}
      <div className="mb-4">
        <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
        <select
          id="taskPriority"
          value={priority}
          onChange={(e) => {
              setPriority(e.target.value); // Update local state immediately
              handleUpdate('priority', e.target.value); // Dispatch update on change
          }}
          className="w-full p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {priorities.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      {/* --- End Priority Selector --- */}

      {/* Replace the read-only project display with a dropdown */}
      <div className="mb-4">
        <label htmlFor="taskProject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
        <select
          id="taskProject"
          value={projectId || "null"}
          onChange={(e) => {
            const newProjectId = e.target.value === "null" ? null : e.target.value;
            setProjectId(newProjectId);
            handleUpdate('projectId', newProjectId);
          }}
          className="w-full p-2 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="null">-- No Project --</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}