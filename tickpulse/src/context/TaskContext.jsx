'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useToast } from './ToastContext';
import { v4 as uuidv4 } from 'uuid';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000';


const TaskContext = createContext();

/**
 * @typedef {object} TaskState
 * @property {Array<object>} tasks - The list of tasks.
 * @property {Array<object>} projects - The list of projects.
 * @property {Array<object>} categories - The list of categories.
 * @property {string|null} selectedTaskId - The ID of the currently selected task.
 * @property {string|null} selectedProjectId - The ID of the currently selected project.
 * @property {string|null} selectedCategoryId - The ID of the currently selected category.
 * @property {string} selectedView - The current view type ('project', 'filter', 'category').
 * @property {string} activeFilter - The currently active filter ('all', 'today', 'completed').
 */

/**
 * @typedef {object} TaskContextProps
 * @property {TaskState} state - The current state of tasks and related data.
 * @property {Function} dispatch - The dispatch function to update the state.
 * @property {Function} refreshTasks - Function to refresh tasks from the backend.
 * @property {object} taskApi - API utility for task-related operations.
 */

/**
 * Provides task-related state and actions to its children components.
 * Manages tasks, projects, categories, and UI selections.
 * Handles data fetching, local storage persistence, and API interactions.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The TaskProvider component.
 */
export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { showError } = useToast(); // Hook for displaying error notifications
  
  // Effect to load state from localStorage on component mount
  useEffect(() => {
    const savedState = loadState(); // Attempt to load saved state from localStorage
    if (savedState) {
      dispatch({ type: 'HYDRATE_STATE', payload: savedState }); // Restore saved state
    }
    
    /**
     * Fetches initial tasks and categories from the backend.
     * This is typically done when the application loads or user logs in.
     */
    const fetchInitialData = async () => {
      try {
        // Fetch tasks from the API
        const tasks = await taskApi.getTasks();
        if (Array.isArray(tasks)) {
          dispatch({ type: 'SET_TASKS', payload: tasks }); // Update state with fetched tasks
        }
        
        // Fetch categories from the API
        const categories = await taskApi.getAllCategories();
        if (Array.isArray(categories)) {
          // Transform categories to a consistent format
          const transformedCategories = categories.map(cat => ({
            id: cat.category_name || cat.category_id?.toString() || `unnamed-${uuidv4()}`, // Ensure unique ID
            name: cat.category_name || 'Unnamed Category'
          }));
          
          // Ensure 'Inbox' category exists
          if (!transformedCategories.find(c => c.id === 'inbox')) {
            transformedCategories.unshift({ id: 'inbox', name: 'Inbox' });
          }
          
          dispatch({
            type: 'SET_CATEGORIES',
            payload: transformedCategories // Update state with fetched categories
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        showError('Failed to load tasks and categories'); // Display error to user
      }
    };
    
    // Check if user is authenticated (token exists) before fetching data
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchInitialData(); // Fetch data if authenticated
    }
  }, [showError]); // Dependency: showError (though typically stable, good practice)

  // Effect to save state to localStorage whenever the state changes
  useEffect(() => {
    saveState(state); // Persist current state to localStorage
  }, [state]); // Dependency: state
  
  /**
   * Function to refresh the list of tasks from the backend.
   * Useful after operations that might change tasks on the server outside of direct client actions.
   */
  const refreshTasks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return; // Do not attempt if not authenticated
      
      const tasks = await taskApi.getTasks(); // Fetch latest tasks
      if (Array.isArray(tasks)) {
        dispatch({ type: 'SET_TASKS', payload: tasks }); // Update state with refreshed tasks
      }
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      showError('Failed to refresh tasks'); // Display error to user
    }
  };
  
  return (
    // Provide task state, dispatch function, and refreshTasks function to consuming components
    <TaskContext.Provider value={{ ...state, dispatch, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

/**
 * Custom hook to access the TaskContext.
 * Provides an easy way for components to consume task-related state and actions.
 * @throws {Error} If used outside of a TaskProvider.
 * @returns {TaskContextProps} The task context value.
 */
export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}


async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 403) {
      // Clear invalid token
      localStorage.removeItem('accessToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${await response.text()}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * @namespace taskApi
 * @description An object containing functions for interacting with the task-related backend API endpoints.
 */
export const taskApi = {
  getTasks: async () => fetchWithAuth('/api/tasks'),
  getTaskById: async (id) => fetchWithAuth(`/api/tasks/${id}`),
  createTask: async (taskData) =>
    fetchWithAuth('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  updateTask: async (id, updates) =>
    fetchWithAuth(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTask: async (id) =>
    fetchWithAuth(`/api/tasks/${id}`, { method: 'DELETE' }),
  updateTaskStatus: async (id, status) =>
    fetchWithAuth(`/api/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  updateTaskPriority: async (id, priority) =>
    fetchWithAuth(`/api/tasks/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority }),
    }),
  updateTaskDeadline: async (id, deadline) =>
    fetchWithAuth(`/api/tasks/${id}/deadline`, {
      method: 'PUT',
      body: JSON.stringify({ deadline }),
    }),
  updateTaskCategory: async (id, category_name) =>
    fetchWithAuth(`/api/tasks/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category_name }),
    }),
  updateTaskContent: async (id, content) =>
    fetchWithAuth(`/api/tasks/${id}/content`, { // Corrected path from /tasks to /api/tasks for consistency
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  // Category related API calls
  getAllCategories: async () => {
    try {
      return await fetchWithAuth('/api/tasks/category');
    } catch (error) {
      // Check if it's the specific 404 error "No categories found"
      if (error.message && error.message.includes('404') && error.message.includes('No categories found')) {
        console.warn('API returned 404 for categories (No categories found), treating as empty list.');
        return []; // Return an empty array if no categories are found for the user
      }
      // For any other error, re-throw it to be handled by the caller
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  createCategory: async (categoryName) =>
    fetchWithAuth('/api/tasks/category', { // Changed to match backend route
      method: 'POST',
      body: JSON.stringify({ category_name: categoryName }),
    }),
  updateCategory: async (id, categoryName) =>
    fetchWithAuth(`/api/tasks/category/${id}`, { // Changed to match backend route
      method: 'PUT',
      body: JSON.stringify({ category_name: categoryName }),
    }),
  deleteCategory: async (id) =>
    fetchWithAuth(`/api/tasks/category/${id}`, { method: 'DELETE' }), // Changed to match backend route
};

// Initial state for the reducer
const initialState = {
  tasks: [],
  categories: [{ id: 'inbox', name: 'Inbox' }], // Changed from projects to categories
  selectedCategoryId: 'inbox', 
  selectedTaskId: null,
  selectedView: 'filter', // Changed from 'category' to 'filter'
  activeFilter: 'all', // Set default filter to 'all'
};

// --- Helper Functions ---

// Function to save state to local storage (Client-side only)
const saveState = (state) => {
  try {
    // Ensure localStorage is accessed only on the client
    if (typeof window !== 'undefined') {
      const stateToSave = {
        tasks: state.tasks,
        categories: state.categories, // Changed from projects to categories
        selectedCategoryId: state.selectedCategoryId, // Changed from selectedProjectId
        selectedTaskId: state.selectedTaskId,
        selectedView: state.selectedView,
        activeFilter: state.activeFilter,
      };
      const serializedState = JSON.stringify(stateToSave);
      localStorage.setItem('tickpulseState', serializedState);
    }
  } catch (err) {
    console.error("Could not save state to local storage", err);
  }
};

// Function to load state (will be called within useEffect)
const loadState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem('tickpulseState');
    if (serializedState === null) {
      return undefined; // Let reducer use initialState
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state from local storage", err);
    return undefined; // Use initialState in case of error
  }
};

// --- Single Reducer Definition ---
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return {
        ...initialState,
        ...(action.payload || {}),
        categories: action.payload?.categories?.find(c => c.id === 'inbox')
                  ? action.payload.categories
                  : [...(action.payload?.categories || []), { id: 'inbox', name: 'Inbox' }].filter((c, i, arr) => arr.findIndex(t => t.id === c.id) === i),
      };

    case 'ADD_TASK': {
      if (action.payload.id) {
        return {
          ...state,
          tasks: [...state.tasks, action.payload]
        };
      }
      
      const newId = uuidv4();
      const newTask = {
        id: newId,
        task_name: action.payload.title,
        content: action.payload.content || '',
        deadline: action.payload.deadline,
        priority: action.payload.priority || 'low',
        category_name: action.payload.categoryName,
        status: 'pending',
        completed: false,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: [...state.tasks, newTask]
      };
    }

    case 'TOGGLE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload
          ? { 
              ...task, 
              completed: !task.completed,
              status: !task.completed ? 'completed' : 'pending' // Update status to match database
            }
          : task
      );
      return {
        ...state,
        tasks: updatedTasks
      };
    }

    case 'DELETE_TASK': {
      const updatedTasks = state.tasks.filter(task => task.id !== action.payload);
      return {
        ...state,
        tasks: updatedTasks
      };
    }

    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? { ...task, ...action.payload.updates }
          : task
      );
      return {
        ...state,
        tasks: updatedTasks
      };
    }

    case 'SET_CATEGORIES': {
      return {
        ...state,
        categories: action.payload
      };
    }

    case 'ADD_CATEGORY': {
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    }

    case 'DELETE_CATEGORY': {
      const updatedCategories = state.categories.filter(category => category.id !== action.payload);
      return {
        ...state,
        categories: updatedCategories
      };
    }

    case 'RENAME_CATEGORY': {
      const updatedCategories = state.categories.map(category =>
        category.id === action.payload.categoryId
          ? { ...category, name: action.payload.newName }
          : category
      );
      return {
        ...state,
        categories: updatedCategories
      };
    }

    case 'SELECT_TASK': {
      return {
        ...state,
        selectedTaskId: action.payload
      };
    }

    case 'SELECT_CATEGORY': {
      return {
        ...state,
        selectedCategoryId: action.payload
      };
    }

    case 'SET_VIEW':
      return { ...state, selectedView: action.payload };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };
    default:
      return state;
  }
};

// --- Context Definition ---
