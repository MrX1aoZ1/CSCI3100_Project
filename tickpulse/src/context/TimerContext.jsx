'use client';

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state for the timer
const initialState = {
  isRunning: false,
  mode: 'standard', // 'standard' or 'pomodoro'
  timeLeft: 0, // in seconds
  totalTime: 0, // in seconds (for the current session)
  pomodoroSettings: {
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes in seconds
    sessionsBeforeLongBreak: 4,
    currentSession: 1,
    isBreak: false,
  },
  records: [], // Array to store timing records
};

// Helper function to save state to local storage
const saveState = (state) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timerState', JSON.stringify(state));
    }
  } catch (err) {
    console.error("Could not save timer state to local storage", err);
  }
};

// Helper function to load state from local storage
const loadState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem('timerState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load timer state from local storage", err);
    return undefined;
  }
};

// Reducer function to handle timer state changes
const timerReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return {
        ...initialState,
        ...(action.payload || {}),
      };
    
    case 'START_TIMER':
      return {
        ...state,
        isRunning: true,
        timeLeft: state.timeLeft > 0 ? state.timeLeft : 
          (state.mode === 'pomodoro' ? 
            (state.pomodoroSettings.isBreak ? 
              (state.pomodoroSettings.currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
                state.pomodoroSettings.longBreakDuration : state.pomodoroSettings.breakDuration) : 
              state.pomodoroSettings.workDuration) : 
            action.payload || 25 * 60), // Default to 25 minutes if no time specified
        totalTime: state.timeLeft > 0 ? state.totalTime : 
          (state.mode === 'pomodoro' ? 
            (state.pomodoroSettings.isBreak ? 
              (state.pomodoroSettings.currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
                state.pomodoroSettings.longBreakDuration : state.pomodoroSettings.breakDuration) : 
              state.pomodoroSettings.workDuration) : 
            action.payload || 25 * 60),
      };
    
    case 'PAUSE_TIMER':
      return {
        ...state,
        isRunning: false,
      };
    
    case 'RESET_TIMER':
      return {
        ...state,
        isRunning: false,
        timeLeft: state.mode === 'pomodoro' ? 
          (state.pomodoroSettings.isBreak ? 
            (state.pomodoroSettings.currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
              state.pomodoroSettings.longBreakDuration : state.pomodoroSettings.breakDuration) : 
            state.pomodoroSettings.workDuration) : 
          0,
        totalTime: 0,
      };
    
    case 'SET_TIME':
      return {
        ...state,
        timeLeft: action.payload,
        totalTime: action.payload,
      };
    
    case 'TICK':
      const newTimeLeft = Math.max(0, state.timeLeft - 1);
      return {
        ...state,
        timeLeft: newTimeLeft,
        isRunning: newTimeLeft > 0 ? state.isRunning : false,
      };
    
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        isRunning: false,
        timeLeft: action.payload === 'pomodoro' ? state.pomodoroSettings.workDuration : 0,
        totalTime: action.payload === 'pomodoro' ? state.pomodoroSettings.workDuration : 0,
        pomodoroSettings: {
          ...state.pomodoroSettings,
          isBreak: false,
          currentSession: 1,
        }
      };
    
    case 'COMPLETE_POMODORO_SESSION':
      const isBreak = !state.pomodoroSettings.isBreak;
      let currentSession = state.pomodoroSettings.currentSession;
      
      if (!isBreak) {
        // Moving from break to work means a new session
        currentSession = currentSession + 1;
      }
      
      // Add record for completed session
      const newRecord = {
        id: uuidv4(),
        date: new Date().toISOString(),
        duration: state.totalTime - state.timeLeft, // Actual time spent
        type: state.pomodoroSettings.isBreak ? 'break' : 'work',
      };
      
      return {
        ...state,
        isRunning: false,
        timeLeft: isBreak ? 
          (currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
            state.pomodoroSettings.longBreakDuration : state.pomodoroSettings.breakDuration) : 
          state.pomodoroSettings.workDuration,
        totalTime: isBreak ? 
          (currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
            state.pomodoroSettings.longBreakDuration : state.pomodoroSettings.breakDuration) : 
          state.pomodoroSettings.workDuration,
        pomodoroSettings: {
          ...state.pomodoroSettings,
          isBreak,
          currentSession,
        },
        records: [...state.records, newRecord],
      };
    
    case 'UPDATE_POMODORO_SETTINGS':
      return {
        ...state,
        pomodoroSettings: {
          ...state.pomodoroSettings,
          ...action.payload,
        },
        timeLeft: state.pomodoroSettings.isBreak ? 
          (state.pomodoroSettings.currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
            action.payload.longBreakDuration || state.pomodoroSettings.longBreakDuration : 
            action.payload.breakDuration || state.pomodoroSettings.breakDuration) : 
          action.payload.workDuration || state.pomodoroSettings.workDuration,
        totalTime: state.pomodoroSettings.isBreak ? 
          (state.pomodoroSettings.currentSession % state.pomodoroSettings.sessionsBeforeLongBreak === 0 ? 
            action.payload.longBreakDuration || state.pomodoroSettings.longBreakDuration : 
            action.payload.breakDuration || state.pomodoroSettings.breakDuration) : 
          action.payload.workDuration || state.pomodoroSettings.workDuration,
      };
    
    case 'CLEAR_RECORDS':
      return {
        ...state,
        records: [],
      };
    
    default:
      return state;
  }
};

// Create context
const TimerContext = createContext();

// Provider component
export function TimerProvider({ children }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const [isClient, setIsClient] = useState(false);
  
  // Initialize state from localStorage on client-side
  useEffect(() => {
    setIsClient(true);
    const savedState = loadState();
    if (savedState) {
      dispatch({ type: 'HYDRATE_STATE', payload: savedState });
    }
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    if (isClient) {
      saveState(state);
    }
  }, [state, isClient]);
  
  // Timer tick effect
  useEffect(() => {
    let interval;
    
    if (state.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [state.isRunning]);
  
  // Check for completed sessions
  useEffect(() => {
    if (state.isRunning && state.timeLeft === 0 && state.mode === 'pomodoro') {
      // Play sound notification
      if (typeof window !== 'undefined') {
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (error) {
          console.error('Failed to play notification sound:', error);
        }
      }
      
      // Complete the session
      dispatch({ type: 'COMPLETE_POMODORO_SESSION' });
    }
  }, [state.isRunning, state.timeLeft, state.mode]);
  
  // Format time as MM:SS
  const formatTime = useCallback((timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Get records for a specific date
  const getRecordsForDate = useCallback((date) => {
    const dateString = date.toISOString().split('T')[0];
    return state.records.filter(record => record.date.startsWith(dateString));
  }, [state.records]);
  
  // Get total time spent for a specific date
  const getTotalTimeForDate = useCallback((date) => {
    const records = getRecordsForDate(date);
    return records.reduce((total, record) => total + record.duration, 0);
  }, [getRecordsForDate]);
  
  return (
    <TimerContext.Provider value={{
      ...state,
      dispatch,
      formatTime,
      getRecordsForDate,
      getTotalTimeForDate,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

// Custom hook to use the timer context
export const useTimer = () => useContext(TimerContext);