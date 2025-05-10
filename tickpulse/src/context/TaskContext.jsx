'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { taskApi, projectApi } from '@/services/api';
import { useToast } from './ToastContext';

// Import useState along with other hooks

import { v4 as uuidv4 } from 'uuid';

// --- Initial State ---
// Define the default structure of your state
const initialState = {
  tasks: [],
  projects: [{ id: 'inbox', name: 'Inbox' }],
  selectedProjectId: 'inbox', // Default selected project
  selectedTaskId: null,
  selectedView: 'project', // Default view type ('project' or 'filter')
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
        projects: state.projects,
        selectedProjectId: state.selectedProjectId,
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
  // This check is now technically redundant because we call it inside useEffect,
  // but it's good practice to keep it for clarity.
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
      // Ensure all keys from initialState are present
      return {
        ...initialState, // Start with default structure
        ...(action.payload || {}), // Spread loaded state, overwriting defaults if present
        // Ensure projects always includes 'inbox' if it was somehow removed/not saved
        projects: action.payload?.projects?.find(p => p.id === 'inbox')
                  ? action.payload.projects
                  : [...(action.payload?.projects || []), { id: 'inbox', name: 'Inbox' }].filter((p, i, arr) => arr.findIndex(t => t.id === p.id) === i), // Ensure inbox exists and is unique
      };

    case 'ADD_TASK': {
      const newId = uuidv4();
      const newTask = {
        id: newId,
        title: action.payload.title,
        content: action.payload.content || '',
        deadline: action.payload.deadline,
        priority: action.payload.priority || 'none',
        projectId: action.payload.projectId,
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
          ? { ...task, completed: !task.completed }
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

    case 'DELETE_TASK':
      // ... existing DELETE_TASK logic ...
       return {
         ...state,
         tasks: state.tasks.filter(task => task.id !== action.payload),
         // If the deleted task was selected, deselect it
         selectedTaskId: state.selectedTaskId === action.payload ? null : state.selectedTaskId
       };

    case 'UPDATE_TASK':
       // ... existing UPDATE_TASK logic ...
       return {
         ...state,
         tasks: state.tasks.map(task =>
           task.id === action.payload.taskId ? { ...task, ...action.payload.updates } : task
         )
       };

    case 'SELECT_TASK':
      console.log('Reducer handling SELECT_TASK:', action.payload);
      const nextSelectedTaskId = action.payload;
      // Avoid re-selecting the same task if already selected (optional)
      // if (nextSelectedTaskId === state.selectedTaskId) {
      //   return state;
      // }
      return { ...state, selectedTaskId: nextSelectedTaskId };

    case 'MOVE_TASK_TO_PROJECT':
      console.log('Reducer handling MOVE_TASK_TO_PROJECT:', action.payload);
      const { taskId, newProjectId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === taskId
            ? { ...task, projectId: newProjectId }
            : task
        )
        // Optionally deselect task after moving
        // selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId
      };

    case 'ADD_PROJECT': {
      // ... existing ADD_PROJECT logic ...
       const newProject = { id: uuidv4(), name: action.payload.name };
       return {
         ...state,
         projects: [...state.projects, newProject],
         // Optionally select the new project
         // selectedProjectId: newProject.id,
         // selectedView: 'project'
       };
    }

    case 'DELETE_PROJECT': {
      // ... existing DELETE_PROJECT logic ...
       const projectIdToDelete = action.payload;
       if (projectIdToDelete === 'inbox') return state; // Cannot delete inbox

       const tasksToMove = state.tasks.filter(task => task.projectId === projectIdToDelete);
       const remainingTasks = state.tasks.filter(task => task.projectId !== projectIdToDelete);
       const movedTasks = tasksToMove.map(task => ({ ...task, projectId: 'inbox' }));

       return {
         ...state,
         projects: state.projects.filter(project => project.id !== projectIdToDelete),
         tasks: [...remainingTasks, ...movedTasks],
         // If the deleted project was selected, switch to inbox
         selectedProjectId: state.selectedProjectId === projectIdToDelete ? 'inbox' : state.selectedProjectId,
         selectedView: state.selectedProjectId === projectIdToDelete ? 'project' : state.selectedView,
         activeFilter: state.selectedProjectId === projectIdToDelete ? null : state.activeFilter, // Reset filter if project view changes
         selectedTaskId: tasksToMove.some(t => t.id === state.selectedTaskId) ? null : state.selectedTaskId // Deselect task if it was in deleted project
       };
    }

    case 'RENAME_PROJECT':
      // ... existing RENAME_PROJECT logic ...
       if (action.payload.projectId === 'inbox') return state; // Cannot rename inbox
       return {
         ...state,
         projects: state.projects.map(project =>
           project.id === action.payload.projectId ? { ...project, name: action.payload.newName } : project
         )
       };

    case 'SELECT_PROJECT':
      return {
        ...state,
        selectedProjectId: action.payload,
        selectedView: 'project', // Optionally ensure view is set
        selectedTaskId: null,    // Optionally deselect any task
      };

    case 'SET_VIEW':
      // ... existing SET_VIEW logic ...
       return {
         ...state,
         selectedView: action.payload.view,
         selectedProjectId: action.payload.view === 'project' ? action.payload.projectId : state.selectedProjectId, // Keep project ID if switching to filter
         activeFilter: action.payload.view === 'filter' ? action.payload.filter : null,
         selectedTaskId: null // Deselect task when changing view
       };
    default:
      return state;
  }
};

// --- Context ---
const TaskContext = createContext();

// --- Provider Component ---
export const TaskProvider = ({ children }) => {
  // Initialize reducer with the default initialState ALWAYS
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // State to track if hydration is complete (uses useState)
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage only on the client, after initial render
  useEffect(() => {
    const loadedState = loadState();
    if (loadedState) {
      dispatch({ type: 'HYDRATE_STATE', payload: loadedState });
    }
    setIsHydrated(true); // Mark hydration as complete
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save state to localStorage whenever it changes (only after initial hydration)
  useEffect(() => {
    if (isHydrated) { // Only save state after the initial state has been potentially hydrated
        saveState(state);
    }
  }, [state, isHydrated]); // Depend on state and isHydrated flag

  // Helper function for today's date string
  // Remove the duplicate placeholder declaration below
  // const getTodayDateString = () => { /* ... */ }; // <-- 删除这一行

   const getTodayDateString = () => {
     const today = new Date();
     const year = today.getFullYear();
     const month = String(today.getMonth() + 1).padStart(2, '0');
     const day = String(today.getDate()).padStart(2, '0');
     return `${year}-${month}-${day}`;
   };


  // Prevent rendering children until hydration is complete to avoid mismatches
  // This is a common pattern to ensure client/server consistency when using localStorage
  if (!isHydrated) {
     // Optionally return a loading indicator or null
     // Returning null might cause a brief flash, but ensures no mismatch
     return null;
     // Or return a basic loading skeleton:
     // return <div>Loading...</div>;
  }


  return (
    <TaskContext.Provider value={{ ...state, dispatch, getTodayDateString }}>
      {children}
    </TaskContext.Provider>
  );
};

// --- Custom Hook ---
export const useTasks = () => useContext(TaskContext);