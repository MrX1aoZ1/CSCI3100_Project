'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { taskApi } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline';

export default function CategoryList() {
  const { categories = [], dispatch, selectedCategoryId, selectedView } = useTasks();
  const { showSuccess, showError } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await taskApi.getAllCategories();
      if (Array.isArray(fetchedCategories)) {
        const transformedCategories = fetchedCategories.map(cat => ({
          id: cat.category_id ? cat.category_id.toString() : `temp-${Math.random()}`,
          name: cat.category_name || 'Unnamed Category'
        }));
        if (!transformedCategories.find(c => c.id === 'inbox')) {
          transformedCategories.unshift({ id: 'inbox', name: 'Inbox' });
        }
        dispatch({
          type: 'SET_CATEGORIES',
          payload: transformedCategories
        });
      }
    } catch (error) {
      showError('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCategory = (categoryId) => {
    dispatch({ type: 'SELECT_CATEGORY', payload: categoryId });
    dispatch({ type: 'SET_VIEW', payload: 'category' });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setIsLoading(true);
      const response = await taskApi.createCategory(newCategoryName.trim());
      if (response && response.category_id) {
        dispatch({
          type: 'ADD_CATEGORY',
          payload: {
            id: response.category_id.toString(),
            name: newCategoryName.trim()
          }
        });
      } else {
        dispatch({
          type: 'ADD_CATEGORY',
          payload: {
            id: newCategoryName.trim(),
            name: newCategoryName.trim()
          }
        });
      }
      setNewCategoryName('');
      setIsAdding(false);
      showSuccess('Category created successfully');
      fetchCategories();
    } catch (error) {
      showError('Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (e, categoryId) => {
    e.stopPropagation();
    if (categoryId === 'inbox') {
      showError('Cannot delete the default Inbox category');
      return;
    }
    if (window.confirm(`Are you sure you want to delete this category? Tasks will be moved to Inbox.`)) {
      try {
        dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
        showSuccess('Category deleted successfully');
      } catch (error) {
        showError('Failed to delete category');
      }
    }
  };

  const handleStartEdit = (e, categoryId, name) => {
    e.stopPropagation();
    if (categoryId === 'inbox') {
      showError('Cannot edit the default Inbox category');
      return;
    }
    setEditingId(categoryId);
    setEditName(name);
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    if (!editName.trim() || !editingId) return;
    try {
      setIsLoading(true);
      dispatch({
        type: 'RENAME_CATEGORY',
        payload: {
          categoryId: editingId,
          newName: editName.trim()
        }
      });
      setEditingId(null);
      setEditName('');
      showSuccess('Category renamed successfully');
    } catch (error) {
      showError('Failed to rename category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-2">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Categories</span>
        <button
          className="ml-auto text-blue-500 hover:text-blue-700"
          onClick={() => setIsAdding(true)}
          title="Add Category"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      {isAdding && (
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="New category name"
            autoFocus
          />
          <button
            className="ml-2 text-green-500"
            onClick={handleAddCategory}
            disabled={isLoading}
          >
            Add
          </button>
          <button
            className="ml-1 text-gray-400"
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </button>
        </div>
      )}
      <ul className="space-y-2">
        {(Array.isArray(categories) ? categories : []).map(category => (
          <li
            key={category.id}
            onClick={() => handleSelectCategory(category.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer group ${
              selectedView === 'category' && selectedCategoryId === category.id
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
                  onChange={e => setEditName(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-sm"
                  autoFocus
                  onBlur={handleSaveEdit}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveEdit(e);
                    if (e.key === 'Escape') handleCancelEdit(e);
                  }}
                />
              ) : (
                <span>{category.name}</span>
              )}
            </div>
            <div className="flex-shrink-0 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => handleStartEdit(e, category.id, category.name)} className="text-gray-400 hover:text-blue-500">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={e => handleDeleteCategory(e, category.id)} className="text-gray-400 hover:text-red-500">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

updateTaskCategory: async (id, category_name) =>
  fetchWithAuth(`/tasks/${id}/category`, {
    method: 'PUT',
    body: JSON.stringify({ category_name: category }), // Must be category_name!
  })