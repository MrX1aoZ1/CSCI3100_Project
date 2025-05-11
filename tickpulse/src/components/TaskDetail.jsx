'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { taskApi } from '@/context/TaskContext'; // Add this import
import { useToast } from '@/context/ToastContext'; // Add this import
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TaskDetail() {
  const { tasks, dispatch, selectedTaskId, categories } = useTasks(); // 从projects更改
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
  
  // 处理编辑表单提交
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update task status if changed
      if (editForm.status !== selectedTask.status) {
        await taskApi.updateTaskStatus(selectedTask.id, editForm.status);
      }
      
      // Update priority if changed
      if (editForm.priority !== selectedTask.priority) {
        await taskApi.updateTaskPriority(selectedTask.id, editForm.priority);
      }
      
      // Update category if changed
      if (editForm.category_name !== selectedTask.category_name) {
        await taskApi.updateTaskCategory(selectedTask.id, editForm.category_name);
      }
      
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
              内容
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
              name="category_name" // 从projectId更改
              value={editForm.category_name} // 从projectId更改
              onChange={handleEditChange}
              className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-800"
            >
              {categories.map(category => ( // 从projects更改
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-600"
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        // 任务详情视图
        <div>
          <div className="flex justify-between items-start mb-6">
            <h1 className={`text-xl font-bold ${
              selectedTask.status === 'completed' // 从completed更改
                ? 'text-gray-400 dark:text-gray-500 line-through'
                : 'text-gray-800 dark:text-gray-100'
            }`}>
              {selectedTask.task_name} {/* 从title更改 */}
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={handleToggleComplete}
                className={`p-2 rounded-full ${
                  selectedTask.status === 'completed' // 从completed更改
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-400'
                }`}
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleDeleteTask}
                className="p-2 bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedTask.deadline && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">截止日期</h3>
                <p className="text-gray-800 dark:text-gray-200">{selectedTask.deadline}</p>
              </div>
            )}
            
            {selectedTask.priority !== 'none' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">优先级</h3>
                <span className={`inline-block px-2 py-1 text-sm rounded-full ${
                  selectedTask.priority === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    : selectedTask.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                }`}>
                  {selectedTask.priority}
                </span>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">分类</h3>
              <p className="text-gray-800 dark:text-gray-200">
                {categories.find(c => c.id === selectedTask.category_name)?.name || '未分类'} {/* 从projects和projectId更改 */}
              </p>
            </div>
            
            {selectedTask.content && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">内容</h3>
                <div className="prose dark:prose-invert prose-sm max-w-none text-gray-800 dark:text-gray-200">
                  {selectedTask.content}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}