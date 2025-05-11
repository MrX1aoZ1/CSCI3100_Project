'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useToast } from './ToastContext';
import { v4 as uuidv4 } from 'uuid';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000';

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
        priority: taskData.priority || 'low', // Changed from 'none' to 'low' to match ENUM values
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
  updateTaskCategory: async (id, category_name) =>
    fetchWithAuth(`/api/tasks/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category_name })
    })
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

// --- Reducer ---
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE_STATE':
      // Merge loaded state with initial state structure, prioritizing loaded values
      return {
        ...initialState, // Start with default structure
        ...(action.payload || {}), // Spread loaded state, overwriting defaults if present
        // Ensure categories always includes 'inbox' if it was somehow removed/not saved
        categories: action.payload?.categories?.find(c => c.id === 'inbox')
                  ? action.payload.categories
                  : [...(action.payload?.categories || []), { id: 'inbox', name: 'Inbox' }].filter((c, i, arr) => arr.findIndex(t => t.id === c.id) === i),
      };

    case 'ADD_TASK': {
      // If payload is already a complete task object (from API response)
      if (action.payload.id) {
        return {
          ...state,
          tasks: [...state.tasks, action.payload]
        };
      }
      
      // Otherwise create a new task with generated ID
      const newId = uuidv4();
      const newTask = {
        id: newId,
        task_name: action.payload.title, // Changed from title to task_name
        content: action.payload.content || '',
        deadline: action.payload.deadline,
        priority: action.payload.priority || 'low', // Changed from 'none' to 'low' to match ENUM values
        category_name: action.payload.categoryName, // Changed from projectId to category_name
        status: 'pending', // Added status field to match database
        completed: false, // Keep for frontend compatibility
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

    case 'SET_VIEW': {
      console.log('Setting view to:', action.payload);
      return {
        ...state,
        selectedView: action.payload
      };
    }

    case 'SET_ACTIVE_FILTER': {
      console.log('Setting active filter to:', action.payload);
      return {
        ...state,
        activeFilter: action.payload
      };
    }

    // Keep only one DELETE_TASK case
    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        // If the deleted task was selected, clear the selection
        selectedTaskId: state.selectedTaskId === action.payload ? null : state.selectedTaskId
      };
    }

    // Keep only one TOGGLE_TASK case
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

    case 'UPDATE_TASK_CATEGORY': {
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, category_name: action.payload.newCategoryName }
            : task
        )
      };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId ? { 
            ...task, 
            ...action.payload.updates,
            // Map frontend field names to database field names if needed
            ...(action.payload.updates.title && { task_name: action.payload.updates.title }),
            ...(action.payload.updates.projectId && { category_name: action.payload.updates.projectId }),
          } : task
        )
      };

    case 'SELECT_TASK':
      console.log('Reducer handling SELECT_TASK:', action.payload);
      return { ...state, selectedTaskId: action.payload };

    case 'MOVE_TASK_TO_CATEGORY': // Changed from MOVE_TASK_TO_PROJECT
      console.log('Reducer handling MOVE_TASK_TO_CATEGORY:', action.payload);
      const { taskId, newCategoryName } = action.payload; // Changed from newProjectId
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, category_name: newCategoryName } // Changed from projectId
            : task
        )
      };

    case 'ADD_CATEGORY': { // Changed from ADD_PROJECT
      const newCategory = { id: uuidv4(), name: action.payload.name };
      return {
        ...state,
        categories: [...state.categories, newCategory], // Changed from projects
      };
    }

    case 'DELETE_CATEGORY': { // Changed from DELETE_PROJECT
      const categoryIdToDelete = action.payload;
      if (categoryIdToDelete === 'inbox') return state; // Cannot delete inbox

      const tasksToMove = state.tasks.filter(task => task.category_name === categoryIdToDelete); // Changed from projectId
      const remainingTasks = state.tasks.filter(task => task.category_name !== categoryIdToDelete); // Changed from projectId
      const movedTasks = tasksToMove.map(task => ({ ...task, category_name: 'inbox' })); // Changed from projectId

      return {
        ...state,
        categories: state.categories.filter(category => category.id !== categoryIdToDelete), // Changed from projects
        tasks: [...remainingTasks, ...movedTasks],
        selectedCategoryId: state.selectedCategoryId === categoryIdToDelete ? 'inbox' : state.selectedCategoryId, // Changed from selectedProjectId
        selectedView: state.selectedCategoryId === categoryIdToDelete ? 'category' : state.selectedView, // Changed from 'project'
        activeFilter: state.selectedCategoryId === categoryIdToDelete ? null : state.activeFilter,
        selectedTaskId: tasksToMove.some(t => t.id === state.selectedTaskId) ? null : state.selectedTaskId
      };
    }

    case 'RENAME_CATEGORY': // Changed from RENAME_PROJECT
      return {
        ...state,
        categories: state.categories.map(category => // Changed from projects
          category.id === action.payload.categoryId // Changed from projectId
            ? { ...category, name: action.payload.newName }
            : category
        )
      };

    case 'SELECT_CATEGORY': // Changed from SELECT_PROJECT
      return {
        ...state,
        selectedCategoryId: action.payload, // Changed from selectedProjectId
        selectedTaskId: null // Deselect task when changing categories
      };

    default:
      return state;
  }
};

// --- Context Creation ---
const TaskContext = createContext();

// --- Provider Component ---
export function TaskProvider({ children }) {
  const { showError, showSuccess } = useToast();
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = loadState();
      if (savedState) {
        dispatch({ type: 'HYDRATE_STATE', payload: savedState });
      }
      setIsLoading(false);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveState(state);
    }
  }, [state, isLoading]);

  // Fetch tasks from API on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const tasks = await taskApi.getTasks();
        
        // Transform backend data to match frontend structure
        const transformedTasks = tasks.map(task => ({
          id: task.id,
          task_name: task.task_name,
          content: task.content,
          deadline: task.deadline,
          priority: task.priority || 'none',
          category_name: task.category_name || 'inbox',
          status: task.status || 'pending'
        }));
        
        dispatch({ 
          type: 'HYDRATE_STATE', 
          payload: { 
            ...state, 
            tasks: transformedTasks,
            categories: [
              { id: 'inbox', name: 'Inbox' },
              ...Array.from(new Set(transformedTasks.map(t => t.category_name)))
                .filter(name => name && name !== 'inbox')
                .map(name => ({ id: name, name }))
            ]
          } 
        });
        
        showSuccess('Tasks loaded successfully');
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        showError('Failed to load tasks. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      fetchTasks();
    }
  }, []);

  // Helper function to get today's date string in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Filter tasks based on current view and selection
  const getFilteredTasks = () => {
    let filteredTasks = [...state.tasks];
    
    if (state.selectedView === 'category') { // Changed from 'project'
      // Filter by selected category
      filteredTasks = filteredTasks.filter(task => 
        task.category_name === state.selectedCategoryId // Changed from projectId
      );
    } else if (state.selectedView === 'filter') {
      // Apply active filter
      switch (state.activeFilter) {
        case 'today':
          const today = getTodayDateString();
          filteredTasks = filteredTasks.filter(task => 
            task.deadline === today && task.status !== 'completed' // Changed from !task.completed
          );
          break;
        case 'completed':
          filteredTasks = filteredTasks.filter(task => 
            task.status === 'completed' // Changed from task.completed
          );
          break;
        // Add more filters as needed
      }
    }
    
    return filteredTasks;
  };

  // Provide the context value
  const contextValue = {
    ...state,
    dispatch,
    isLoading,
    getTodayDateString,
    getFilteredTasks,
    // Ensure tasks is always an array, even if it's undefined in state
    tasks: Array.isArray(state.tasks) ? state.tasks : [],
    // Ensure categories is always an array, even if it's undefined in state
    categories: state.categories || [],
    // Provide renamed properties for backward compatibility
    projects: state.categories || [], // Map categories to projects
    selectedProjectId: state.selectedCategoryId, // Map selectedCategoryId to selectedProjectId
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// --- Custom Hook ---
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}