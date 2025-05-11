'use client';

import { useState, useEffect, useRef } from 'react';
import { useTasks } from '@/context/TaskContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { SunIcon, MoonIcon, CalendarDaysIcon, CheckCircleIcon, InboxIcon, PlayIcon, PauseIcon, ArrowPathIcon, ClockIcon, StopIcon } from '@heroicons/react/24/outline';
import CategoryList from './CategoryList'; // Changed from ProjectList

// Define predefined filters, adding "All Tasks"
const predefinedFilters = [
  { name: '所有任务', filter: 'all', icon: InboxIcon }, // Added "All Tasks"
  { name: '今日任务', filter: 'today', icon: CalendarDaysIcon },
  { name: '已完成', filter: 'completed', icon: CheckCircleIcon },
];

export default function NavigationBar() {
  const { theme, toggleTheme } = useTheme();
  const { dispatch, selectedView, activeFilter } = useTasks();
  const router = useRouter();

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak', 'stopwatch', 'countdown'
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSeconds, setCustomSeconds] = useState(0);
  const timerRef = useRef(null);
  const [progress, setProgress] = useState(100); // For circular progress animation

  // Timer durations in seconds
  const timerDurations = {
    pomodoro: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
    stopwatch: 0, // Starts from 0
    countdown: customMinutes * 60 + customSeconds, // Custom countdown
  };

  // Initialize timer when mode changes
  useEffect(() => {
    if (timerMode === 'countdown') {
      setTime(customMinutes * 60 + customSeconds);
    } else {
      setTime(timerDurations[timerMode]);
    }
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Reset progress based on timer mode
    if (timerMode === 'stopwatch') {
      setProgress(0);
    } else {
      setProgress(100);
    }
  }, [timerMode, customMinutes, customSeconds]);

  // Update progress for animation
  useEffect(() => {
    if (timerMode === 'stopwatch') {
      // For stopwatch, progress increases
      if (time > 0) {
        const maxTime = 60 * 60; // Cap at 1 hour for visual purposes
        setProgress(Math.min((time / maxTime) * 100, 100));
      } else {
        setProgress(0);
      }
    } else {
      // For countdown timers, progress decreases
      const totalTime = timerMode === 'countdown' 
        ? customMinutes * 60 + customSeconds 
        : timerDurations[timerMode];
      
      if (totalTime > 0) {
        setProgress((time / totalTime) * 100);
      } else {
        setProgress(0);
      }
    }
  }, [time, timerMode]);

  // Timer controls
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          if (timerMode === 'stopwatch') {
            // Stopwatch counts up
            return prevTime + 1;
          } else {
            // Other timers count down
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              // Play notification sound
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log('Audio play failed:', e));
              return 0;
            }
            return prevTime - 1;
          }
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    if (timerMode === 'countdown') {
      setTime(customMinutes * 60 + customSeconds);
    } else if (timerMode === 'stopwatch') {
      setTime(0);
      setProgress(0);
    } else {
      setTime(timerDurations[timerMode]);
      setProgress(100);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Function to handle filter selection
  const handleFilterSelect = (filter) => {
    console.log(`Setting filter to: ${filter}`);
    dispatch({ type: 'SET_VIEW', payload: 'filter' });
    dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
    router.push('/'); // Add this line to navigate back to main view
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  // Handle calendar view
  const handleCalendarView = () => {
    router.push('/calendar');
  };

  return (
    <div className="w-64 h-full bg-gray-100 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 flex flex-col">
      {/* App Logo/Title */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">TickPulse</h1>
      </div>

      {/* Timer Section */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        {/* Circular Timer Display */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-zinc-700"></div>
            
            {/* Progress Circle */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={timerMode === 'pomodoro' ? '#ef4444' : timerMode === 'shortBreak' ? '#22c55e' : timerMode === 'longBreak' ? '#3b82f6' : timerMode === 'stopwatch' ? '#f59e0b' : '#8b5cf6'} 
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            
            {/* Timer Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatTime(time)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Timer Mode Buttons */}
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          <button 
            onClick={() => setTimerMode('pomodoro')}
            className={`px-2 py-1 text-xs rounded ${timerMode === 'pomodoro' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
          >
            番茄钟
          </button>
          <button 
            onClick={() => setTimerMode('shortBreak')}
            className={`px-2 py-1 text-xs rounded ${timerMode === 'shortBreak' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
          >
            短休息
          </button>
          <button 
            onClick={() => setTimerMode('longBreak')}
            className={`px-2 py-1 text-xs rounded ${timerMode === 'longBreak' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
          >
            长休息
          </button>
          <button 
            onClick={() => setTimerMode('stopwatch')}
            className={`px-2 py-1 text-xs rounded ${timerMode === 'stopwatch' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
          >
            正计时
          </button>
          <button 
            onClick={() => setTimerMode('countdown')}
            className={`px-2 py-1 text-xs rounded ${timerMode === 'countdown' 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
          >
            倒计时
          </button>
        </div>
        
        {/* Custom Countdown Settings */}
        {timerMode === 'countdown' && (
          <div className="flex justify-center space-x-2 mb-3">
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="60"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                className="w-12 p-1 text-sm text-center border rounded dark:bg-zinc-800 dark:text-gray-200"
              />
              <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">分</span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="59"
                value={customSeconds}
                onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 0)}
                className="w-12 p-1 text-sm text-center border rounded dark:bg-zinc-800 dark:text-gray-200"
              />
              <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">秒</span>
            </div>
          </div>
        )}
        
        {/* Timer Controls */}
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <button 
              onClick={startTimer}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
            >
              <PlayIcon className="h-5 w-5" />
            </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
            >
              <PauseIcon className="h-5 w-5" />
            </button>
          )}
          <button 
            onClick={resetTimer}
            className="p-2 bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          {timerMode === 'stopwatch' && isRunning && (
            <button 
              onClick={() => {
                pauseTimer();
                // Could add lap functionality here
              }}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <StopIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto">
        {/* Calendar View Button */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
          <button
            onClick={handleCalendarView}
            className="w-full flex items-center px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
          >
            <CalendarDaysIcon className="h-5 w-5 mr-2" />
            日历视图
          </button>
        </div>
        
        {/* Filters Section */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">筛选器</h2>
          <ul>
            {predefinedFilters.map((item) => (
              <li key={item.filter}>
                <button
                  onClick={() => handleFilterSelect(item.filter)}
                  className={`w-full flex items-center px-2 py-2 text-sm rounded-md mb-1
                    ${selectedView === 'filter' && activeFilter === item.filter
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                    }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Section */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">分类</h2>
          <CategoryList />
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded"
        >
          登出
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="h-5 w-5 mr-2" />
              浅色模式
            </>
          ) : (
            <>
              <MoonIcon className="h-5 w-5 mr-2" />
              深色模式
            </>
          )}
        </button>
      </div>
    </div>
  );
}