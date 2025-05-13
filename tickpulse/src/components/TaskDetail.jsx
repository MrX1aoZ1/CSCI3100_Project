'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { taskApi } from '@/context/TaskContext'; // Add this import
import { useToast } from '@/context/ToastContext'; // Add this import
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TaskDetail({ task }) {
  const { tasks, dispatch, selectedTaskId, categories } = useTasks(); // Use useTasks instead of useTaskContext
  const { showSuccess, showError } = useToast(); // Add this line
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    task_name: '', // 从title更改
    content: '',
    deadline: '',
    priority: 'none',
    category_name: 'inbox', // 从projectId更改
  });
  
  // 获取选中的任务
  const selectedTask = tasks && tasks.find ? tasks.find(task => task.id === selectedTaskId) : null;
  
  // 当选中的任务改变时，更新编辑表单
  useEffect(() => {
    if (selectedTask) {
      setEditForm({
        task_name: selectedTask.task_name || '', // 从title更改
        content: selectedTask.content || '',
        deadline: selectedTask.deadline || '',
        priority: selectedTask.priority || 'none',
        category_name: selectedTask.category_name || 'inbox', // 从projectId更改
      });
    }
  }, [selectedTask]);
  
  // 如果没有选中任务，显示空白状态
  if (!selectedTask) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400 dark:text-gray-500">
        选择一个任务查看详情
      </div>
    );
  }
  
  // 处理任务完成状态切换
  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: selectedTask.id });
  };
  
  // 处理任务删除
  const handleDeleteTask = async () => {
    if (!selectedTask || !selectedTask.id) return;
    
    try {
      // First call the API to delete the task
      await taskApi.deleteTask(selectedTask.id);
      
      // Then update the local state
      dispatch({ type: 'DELETE_TASK', payload: selectedTask.id });
      
      showSuccess('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      showError('Failed to delete task');
    }
  };
  
  // 处理编辑表单变更
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // 处理分类变更（可选，如果有特殊逻辑）
  const handleCategoryChange = (e) => {
    // 可根据需要添加逻辑
  };
  
  // 处理编辑表单提交
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a complete update object with all required fields
      const updateData = {
        task_name: editForm.task_name,
        content: editForm.content,
        deadline: editForm.deadline,
        priority: editForm.priority,
        category_name: editForm.category_name,
      };

      // Update the task with all fields to ensure task_name is included
      await taskApi.updateTask(selectedTask.id, updateData);
      
      // No need for individual updates since we're updating everything at once
      // This prevents the "task_name cannot be null" error
      
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          taskId: selectedTask.id,
          updates: editForm
        }
      });
      setIsEditing(false);
      showSuccess('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      showError('Failed to update task');
    }
  };
  
  // 渲染任务详情或编辑表单
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {isEditing ? (
        // 编辑表单
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标题
            </label>
            <input
              type="text"
              name="task_name" // 从title更改
              value={editForm.task_name} // 从title更改
              onChange={handleEditChange}
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={editForm.content}
              onChange={handleEditChange}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              截止日期
            </label>
            <input
              type="date"
              name="deadline"
              value={editForm.deadline}
              onChange={handleEditChange}
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              优先级
            </label>
            <select
              name="priority"
              value={editForm.priority}
              onChange={handleEditChange}
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800"
            >
              <option value="none">无</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              分类
            </label>
            <select
              name="category_name"
              value={editForm.category_name}
              onChange={(e) => {
                handleEditChange(e);
                handleCategoryChange(e);
              }}
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <CheckIcon className="h-5 w-5 inline-block mr-1" />
              保存
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => setIsEditing(false)}
            >
              <XMarkIcon className="h-5 w-5 inline-block mr-1" />
              取消
            </button>
          </div>
        </form>
      ) : (
        // 任务详情
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedTask.task_name}</h2>
            <div className="flex space-x-2">
              <button
                className="p-2 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
                onClick={() => setIsEditing(true)}
                title="编辑"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                className="p-2 rounded bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                onClick={handleDeleteTask}
                title="删除"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mb-2">
            <span className="font-semibold">内容：</span>
            <span>{selectedTask.content || '无'}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">截止日期：</span>
            <span>{selectedTask.deadline || '无'}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">优先级：</span>
            <span>{selectedTask.priority || '无'}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">分类：</span>
            <span>
              {categories.find(c => c.id === selectedTask.category_name)?.name || '无'}
            </span>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              className={`px-4 py-2 rounded ${
                selectedTask.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={handleToggleComplete}
            >
              <CheckIcon className="h-5 w-5 inline-block mr-1" />
              {selectedTask.status === 'completed' ? '已完成' : 'Mark as Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


