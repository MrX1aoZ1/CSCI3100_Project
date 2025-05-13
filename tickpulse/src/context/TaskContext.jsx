'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useToast } from './ToastContext';
import { v4 as uuidv4 } from 'uuid';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000';


const TaskContext = createContext();
export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { showError } = useToast();
  
  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      dispatch({ type: 'HYDRATE_STATE', payload: savedState });
    }
    
    // Fetch tasks from the backend when component mounts
    const fetchInitialData = async () => {
      try {
        // Fetch tasks
        const tasks = await taskApi.getTasks();
        if (Array.isArray(tasks)) {
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }
        
        // Fetch categories
        const categories = await taskApi.getAllCategories();
        if (Array.isArray(categories)) {
          const transformedCategories = categories.map(cat => ({
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
        console.error('Failed to fetch initial data:', error);
        showError('Failed to load tasks and categories');
      }
    };
    
    // Check if user is authenticated before fetching data
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchInitialData();
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    saveState(state);
  }, [state]);
  
  // Function to refresh tasks
  const refreshTasks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const tasks = await taskApi.getTasks();
      if (Array.isArray(tasks)) {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      }
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  };
  
  return (
    <TaskContext.Provider value={{ ...state, dispatch, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
// Add the fetchWithAuth function definition
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

export const taskApi = {
  getTasks: async () => fetchWithAuth('/api/tasks'),
  getTaskById: async (id) => fetchWithAuth(`/api/tasks/${id}`),
  createTask: async (taskData) =>
    fetchWithAuth('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        task_name: taskData.title,
        content: taskData.content,
        status: taskData.status || 'pending',
        deadline: taskData.deadline,
        priority: taskData.priority || 'low',
        category_name: taskData.categoryName
      }),
    }),
  deleteTask: async (id) => {
    try {
      const response = await fetchWithAuth(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  },
  updateTask: async (id, updates) =>
    fetchWithAuth(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  updateTaskStatus: async (id, status) =>
    fetchWithAuth(`/api/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  updateTaskPriority: async (id, priority) =>
    fetchWithAuth(`/api/tasks/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority })
    }),
  // Category-related API functions
  getAllCategories: async () => fetchWithAuth('/api/tasks/category'),
  createCategory: async (categoryName) => 
    fetchWithAuth('/api/tasks/category', {
      method: 'POST',
      body: JSON.stringify({ category_name: categoryName })
    }),
  updateTaskCategory: async (id, category_name) =>
    fetchWithAuth(`/api/tasks/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category_name })
    }),
  getTasksByCategory: async (categoryName) =>
    fetchWithAuth(`/api/tasks/category/${categoryName}`)
};

// --- Initial State ---
// Updated to match database schema
const initialState = {
  tasks: [],
  categories: [{ id: 'inbox', name: 'Inbox' }], // Changed from projects to categories
  selectedCategoryId: 'inbox', // Default selected category
  selectedTaskId: null,
  selectedView: 'category', // Changed from 'project' to 'category'
  activeFilter: null, // Default active filter ('all', 'today', 'completed')
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
