'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, {
          id: Date.now().toString(),
          title: action.payload,
          content: '',
          category: state.activeCategory,
          createdAt: new Date().toISOString(),
          completed: false,
          abandoned: false
        }]
      };
    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.payload };
    case 'UPDATE_CONTENT':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, content: action.payload.content }
            : task
        )
      };
    case 'CHANGE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  activeCategory: 'all',
  selectedTaskId: null,
  categories: [
    { id: 'all', name: '所有任务' },
    { id: 'today', name: '今日任务' },
    { id: 'completed', name: '已完成' },
    { id: 'abandoned', name: '已放弃' }
  ]
};

export function TaskProvider({ children }) {
  const [storedTasks, setStoredTasks] = useLocalStorage('tasks', []);
  const [state, dispatch] = useReducer(taskReducer, {
    ...initialState,
    tasks: storedTasks
  });

  useEffect(() => {
    setStoredTasks(state.tasks);
  }, [state.tasks]);

  return (
    <TaskContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks必须在TaskProvider内使用');
  return context;
};