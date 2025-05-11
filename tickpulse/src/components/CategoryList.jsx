'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function CategoryList() {
  const { categories, dispatch, selectedCategoryId, selectedView } = useTasks(); // 从projects, selectedProjectId更改
  const [newCategoryName, setNewCategoryName] = useState(''); // 从newProjectName更改
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleSelectCategory = (categoryId) => { // 从handleSelectProject更改
    dispatch({ type: 'SELECT_CATEGORY', payload: categoryId }); // 从SELECT_PROJECT更改
    dispatch({ type: 'SET_VIEW', payload: 'category' }); // 从'project'更改
  };

  const handleAddCategory = () => { // 从handleAddProject更改
    if (newCategoryName.trim()) {
      dispatch({ 
        type: 'ADD_CATEGORY', // 从ADD_PROJECT更改
        payload: { name: newCategoryName.trim() } 
      });
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = (e, categoryId) => { // 从handleDeleteProject更改
    e.stopPropagation();
    if (categoryId === 'inbox') return; // Cannot delete inbox
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId }); // 从DELETE_PROJECT更改
  };

  const handleStartEdit = (e, categoryId, name) => {
    e.stopPropagation();
    if (categoryId === 'inbox') return; // Cannot edit inbox
    setEditingId(categoryId);
    setEditName(name);
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (editName.trim() && editingId) {
      dispatch({ 
        type: 'RENAME_CATEGORY', // 从RENAME_PROJECT更改
        payload: { 
          categoryId: editingId, // 从projectId更改
          newName: editName.trim() 
        } 
      });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  return (
    <div>
      <ul className="space-y-1">
        {categories.map(category => ( // 从projects更改
          <li 
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer ${
              selectedView === 'category' && selectedCategoryId === category.id // 从'project'和selectedProjectId更改
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center">
              <FolderIcon className="h-5 w-5 mr-2" />
              {editingId === category.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm"
                  autoFocus
                />
              ) : (
                <span>{category.name}</span>
              )}
            </div>
            
            {editingId === category.id ? (
              <div className="flex space-x-1">
                <button 
                  onClick={handleSaveEdit}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              category.id !== 'inbox' && (
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={(e) => handleStartEdit(e, category.id, category.name)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteCategory(e, category.id)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
          </li>
        ))}
      </ul>
      
      {isAdding ? (
        <div className="mt-2 px-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="分类名称..."
            className="w-full bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm"
            autoFocus
          />
          <div className="flex space-x-1 mt-1">
            <button
              onClick={handleAddCategory}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded"
            >
              添加
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 text-xs py-1 rounded"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 w-full flex items-center px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          添加分类
        </button>
      )}
    </div>
  );
}

updateTaskCategory: async (id, category_name) =>
  fetchWithAuth(`/tasks/${id}/category`, {
    method: 'PUT',
    body: JSON.stringify({ category_name: category }), // Must be category_name!
  })