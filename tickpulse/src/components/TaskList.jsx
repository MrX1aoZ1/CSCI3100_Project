'use client';

import { useTasks } from '@/context/TaskContext';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { taskApi } from '@/context/TaskContext'; // Import taskApi
import { useToast } from '@/context/ToastContext'; // Import useToast

export default function TaskList() {
  const { 
    tasks, 
    dispatch, 
    selectedTaskId, 
    selectedView, 
    activeFilter, 
    selectedCategoryId, // 从selectedProjectId更改
    categories // 从projects更改
  } = useTasks();
  
  const { showSuccess, showError } = useToast(); // Add useToast hook
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // 获取当前视图的标题
  const getViewTitle = () => {
    if (selectedView === 'category') { // 从'project'更改
      const category = categories.find(c => c.id === selectedCategoryId); // 从project更改
      return category ? category.name : 'Tasks';
    } else if (selectedView === 'filter') {
      switch (activeFilter) {
        case 'all': return 'All Mission';
        case 'today': return 'Today Mission';
        case 'completed': return 'Finished Mission';
        default: return 'Tasks';
      }
    }
    return 'Tasks';
  };
  
  // 过滤和排序任务
  useEffect(() => {
    let result = [...tasks];
    if (selectedView === 'category') {
        result = result.filter(task => task.category_name === selectedCategoryId);
    } else if (selectedView === 'filter') {
        if (activeFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            result = result.filter(task => task.deadline === today && task.status !== 'completed');
        } else if (activeFilter === 'completed') {
            result = result.filter(task => task.status === 'completed');
        }
    }
    setFilteredTasks(result);
}, [tasks, selectedView, selectedCategoryId, activeFilter, sortConfig]); // 从selectedProjectId更改
  
  // Handle task selection
  const handleTaskSelect = (taskId) => {
    dispatch({ type: 'SELECT_TASK', payload: taskId });
  };
  
  // Handle task completion toggle
  const handleToggleComplete = async (e, taskId) => {
    e.stopPropagation(); // Prevent task selection when clicking the checkbox
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // Call API to update task status
      await taskApi.updateTaskStatus(taskId, newStatus);
      
      // Update local state
      dispatch({ type: 'TOGGLE_TASK', payload: taskId });
      showSuccess(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      showError('Failed to update task status');
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation(); // Prevent task selection when clicking delete
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Call API to delete task
        await taskApi.deleteTask(taskId);
        
        // Update local state
        dispatch({ type: 'DELETE_TASK', payload: taskId });
        showSuccess('Task deleted successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
        showError('Failed to delete task');
      }
    }
  };

  // Add this filter bar above the task list
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{getViewTitle()}</h2>
        {/* Filter Bar */}
        <div className="flex space-x-2 mt-2">
          {[
            { key: 'all', label: 'All Mission' },
            { key: 'today', label: 'Today Mission' },
            { key: 'completed', label: 'Finished Mission' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => {
                dispatch({ type: 'SET_VIEW', payload: 'filter' });
                dispatch({ type: 'SET_FILTER', payload: filter.key });
              }}
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
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No tasks
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredTasks.map(task => (
              <li 
                key={task.id}
                onClick={() => handleTaskSelect(task.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  task.id === selectedTaskId 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={(e) => handleToggleComplete(e, task.id)}
                      className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border ${
                        task.status === 'completed' // 从task.completed更改
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-zinc-600'
                      } flex items-center justify-center`}
                    >
                      {task.status === 'completed' && <CheckIcon className="h-3 w-3" />} {/* 从task.completed更改 */}
                    </button>
                    <div>
                      <h3 className={`text-sm font-medium ${
                        task.status === 'completed' // 从task.completed更改
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {task.task_name} {/* 从task.title更改 */}
                      </h3>
                      {task.deadline && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Due date: {task.deadline}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.priority !== 'none' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}