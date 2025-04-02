'use client';

import { createContext, useContext, useReducer } from 'react';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, {
          id: Date.now(),
          title: action.payload,
          completed: false,
          content: ''
        }]
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload ? {...task, completed: !task.completed} : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SELECT_TASK':
      return {...state, selectedTaskId: action.payload};
    case 'UPDATE_CONTENT':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? {...task, content: action.payload.content} : task
        )
      };
    default:
      return state;
  }
};

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    selectedTaskId: null,
    activeCategory: 'all'
  });

  return (
    <TaskContext.Provider value={{...state, dispatch}}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);