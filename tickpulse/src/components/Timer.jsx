'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

const TIMER_TYPES = {
  POMODORO: 'pomodoro',
  NORMAL: 'normal',
  COUNTDOWN: 'countdown'
};

export default function Timer() {
  const { theme } = useTheme();
  const { showSuccess } = useToast();
  const [timerType, setTimerType] = useState(TIMER_TYPES.POMODORO);
  const [time, setTime] = useState(25 * 60); // Default 25 minutes for Pomodoro
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState('work'); // 'work' or 'break'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioRef = useRef(null); // Ref for the audio element

  // Handle timer type change & Initialize audio
  useEffect(() => {
    resetTimer();
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio('/alert.mp3'); // Assuming alert.mp3 is in the public folder
    }
  }, [timerType]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (timerType === TIMER_TYPES.NORMAL) {
          // Normal timer counts up
          setTime(prevTime => prevTime + 1);
        } else {
          // Pomodoro and Countdown timers count down
          setTime(prevTime => {
            if (prevTime <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timerType]);

  const handleTimerComplete = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);

    // Play sound
    if (audioRef.current && (timerType === TIMER_TYPES.POMODORO || timerType === TIMER_TYPES.COUNTDOWN)) {
      audioRef.current.play().catch(error => console.error("Error playing sound:", error));
    }

    if (timerType === TIMER_TYPES.POMODORO) {
      if (pomodoroPhase === 'work') {
        // Work phase completed
        setCompletedPomodoros(prev => prev + 1);
        showSuccess('Work session completed! Take a break.');
        setPomodoroPhase('break');
        // Set break time (5 min or 15 min after 4 pomodoros)
        const isLongBreak = (completedPomodoros + 1) % 4 === 0;
        setTime(isLongBreak ? 15 * 60 : 5 * 60);
      } else {
        // Break phase completed
        showSuccess('Break time over! Ready to work?');
        setPomodoroPhase('work');
        setTime(25 * 60); // Reset to work time
      }
    } else if (timerType === TIMER_TYPES.COUNTDOWN) {
      showSuccess('Countdown completed!');
    }
  };

  const startTimer = () => {
    if (timerType === TIMER_TYPES.COUNTDOWN && time === 0) {
      // If countdown timer is at 0, set it from inputs first
      setTime(inputMinutes * 60 + inputSeconds);
    }
    setIsRunning(true);
    startTimeRef.current = Date.now();
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    
    switch (timerType) {
      case TIMER_TYPES.POMODORO:
        setTime(25 * 60); // 25 minutes
        setPomodoroPhase('work');
        break;
      case TIMER_TYPES.NORMAL:
        setTime(0);
        break;
      case TIMER_TYPES.COUNTDOWN:
        setTime(inputMinutes * 60 + inputSeconds);
        break;
    }
  };

  const handleSetCountdown = () => {
    setTime(inputMinutes * 60 + inputSeconds);
    // Ensure timer is reset if it was running
    if (isRunning) {
        setIsRunning(false);
        clearInterval(intervalRef.current);
    }
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for the animation
  const calculateProgress = () => {
    let totalTime;
    if (timerType === TIMER_TYPES.NORMAL) {
      // For normal timer, we'll use a 60-minute cycle for the animation
      totalTime = 60 * 60;
      return (time % totalTime) / totalTime * 100;
    } else if (timerType === TIMER_TYPES.POMODORO) {
      totalTime = pomodoroPhase === 'work' ? 25 * 60 : (completedPomodoros % 4 === 0 ? 15 * 60 : 5 * 60);
      return (1 - time / totalTime) * 100;
    } else {
      // For countdown, use the initial set time
      totalTime = inputMinutes * 60 + inputSeconds;
      return totalTime > 0 ? (1 - time / totalTime) * 100 : 0;
    }
  };

  // Get color based on timer type and phase
  const getTimerColor = () => {
    if (timerType === TIMER_TYPES.POMODORO) {
      return pomodoroPhase === 'work' ? 'rgb(225, 73, 73)' : 'rgb(76, 145, 149)';
    } else if (timerType === TIMER_TYPES.NORMAL) {
      return 'rgb(76, 145, 149)';
    } else {
      return 'rgb(107, 114, 142)';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Timer</h1>
      
      {/* Timer Type Selector */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setTimerType(TIMER_TYPES.POMODORO)}
          className={`px-4 py-2 rounded-md ${
            timerType === TIMER_TYPES.POMODORO
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setTimerType(TIMER_TYPES.NORMAL)}
          className={`px-4 py-2 rounded-md ${
            timerType === TIMER_TYPES.NORMAL
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setTimerType(TIMER_TYPES.COUNTDOWN)}
          className={`px-4 py-2 rounded-md ${
            timerType === TIMER_TYPES.COUNTDOWN
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Countdown
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative w-64 h-64 mb-8">
        {/* Circular progress background */}
        <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-zinc-700"></div>
        
        {/* Animated progress circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * calculateProgress()) / 100}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-800 dark:text-white">
            {formatTime(time)}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex space-x-4">
        <button
          onClick={startTimer}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Start
        </button>
        <button
          onClick={pauseTimer}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Pause
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reset
        </button>
      </div>

      {/* Countdown Inputs */}
      {timerType === TIMER_TYPES.COUNTDOWN && (
        <div className="flex space-x-2 mt-4">
          <input
            type="number"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Number(e.target.value))}
            className="w-16 p-2 border rounded-md"
            placeholder="Minutes"
          />
          <input
            type="number"
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Number(e.target.value))}
            className="w-16 p-2 border rounded-md"
            placeholder="Seconds"
          />
          <button
            onClick={handleSetCountdown}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}