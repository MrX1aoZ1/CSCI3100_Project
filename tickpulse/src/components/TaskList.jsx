'use client';

import { useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

export default function TaskList() {
  const {
    tasks,
    projects,
    selectedProjectId,
    selectedTaskId,
    selectedView,
    activeFilter,
    dispatch,
    getTodayDateString
  } = useTasks();

  const filteredTasks = tasks.filter(task => {
    let match = true;

    if (selectedView === 'project') {
      const taskProjectId = task.projectId === null ? "null" : task.projectId;
      const selectedProjId = selectedProjectId === null ? "null" : selectedProjectId;
      match = taskProjectId === selectedProjId;
    } else if (selectedView === 'filter') {
      const today = getTodayDateString();
      switch (activeFilter) {
        case 'all':
          match = task.status !== 'abandoned';
          break;
        case 'today':
          match = task.deadline === today && !task.completed;
          break;
        case 'completed':
           match = task.completed;
           break;
        default:
          match = false;
      }
    } else {
      match = false;
    }

    return match;
  });

  console.log('Filtered tasks:', filteredTasks);

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 dark:border-l-red-400';
      case 'medium':
        return 'border-l-yellow-500 dark:border-l-yellow-400';
      case 'low':
        return 'border-l-blue-500 dark:border-l-blue-400';
      default:
        return 'border-l-transparent';
    }
  };

  const handleToggleTask = (taskId, e) => {
    e?.stopPropagation(); // Make stopPropagation optional
    console.log('Toggling task:', taskId);
    dispatch({ type: 'TOGGLE_TASK', payload: taskId });
  };

  const handleDeleteTask = (taskId, e) => {
    e?.stopPropagation(); // Make stopPropagation optional
    console.log('Deleting task:', taskId);
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const handleSelectTask = (taskId) => {
    console.log('Selecting task:', taskId);
    dispatch({ type: 'SELECT_TASK', payload: taskId });
  };

  // Remove the handleMoveTask function since we're removing that functionality
  
  const handleDragStart = (e, taskId) => {
    console.log('Drag start:', taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
     e.currentTarget.classList.remove('opacity-50');
  };

  // Choose one return structure - using the second one with the cleaner UI
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        {filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No tasks found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredTasks.map(task => (
              <li 
                key={task.id}
                className={`relative ${selectedTaskId === task.id ? 'task-item-selected' : ''} 
                  ${task.priority === 'high' ? 'border-l-4 border-l-red-500 dark:border-l-red-400' : ''}
                  ${task.priority === 'medium' ? 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400' : ''}
                  ${task.priority === 'low' ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400' : ''}
                  ${!task.priority || task.priority === 'none' ? 'border-l-4 border-l-transparent' : ''}
                `}
              >
                <div className={`group flex items-center p-3 hover:bg-gray-50 dark:hover:bg-zinc-700/50
                  ${task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/10' : ''}
                  ${task.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                  ${task.priority === 'low' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                `}>
                  
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => handleToggleTask(task.id, e)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700"
                  />
                  
                  {/* Task title */}
                  <div 
                    className={`ml-3 flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <span className="block text-sm font-medium">{task.title}</span>
                    
                    {/* Task metadata (deadline, priority, etc) */}
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      {task.deadline && (
                        <span>
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {task.priority && task.priority !== 'none' && (
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${task.priority === 'high' ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100' : ''}
                          ${task.priority === 'medium' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100' : ''}
                          ${task.priority === 'low' ? 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100' : ''}
                        `}>
                          {task.priority}
                        </span>
                      )}
                      {task.projectId && (
                        <span className="bg-gray-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs">
                          {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete button - visible on hover */}
                  <button
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    title="Delete task"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  
                  {/* "Move to project" dropdown has been removed */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}