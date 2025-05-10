'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, ClockIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { timerService } from '@/services/timerService';

export default function Timer() {
  const { user } = useAuth();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('normal'); // 'normal', 'pomodoro', 或 'countdown'
  const [pomodoroConfig, setPomodoroConfig] = useState({
    workTime: 25 * 60, // 25分钟工作时间
    breakTime: 5 * 60,  // 5分钟休息时间
    longBreakTime: 15 * 60, // 15分钟长休息时间
    cycles: 4,          // 循环次数
    currentCycle: 1,    // 当前循环
    isBreak: false,     // 是否处于休息状态
    completedPomodoros: 0 // 已完成的番茄数
  });
  const [countdownTime, setCountdownTime] = useState(5 * 60); // 默认5分钟倒计时
  const [customTime, setCustomTime] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [records, setRecords] = useState([]);
  const intervalRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Modify the useEffect for loading records to ensure it runs properly
  useEffect(() => {
    const loadRecords = async () => {
      try {
        // Add console.log to debug
        console.log('Loading timer records for user:', user?.id);
        
        // If using localStorage directly instead of a service
        const storedRecords = localStorage.getItem('timerRecords');
        if (storedRecords) {
          setRecords(JSON.parse(storedRecords));
          console.log('Loaded records from localStorage:', JSON.parse(storedRecords));
        } else {
          // Try to load from service if available
          if (timerService && user) {
            const records = await timerService.getRecords(user.id);
            console.log('Loaded records from service:', records);
            setRecords(records || []);
          }
        }
      } catch (error) {
        console.error('Failed to load timer records:', error);
        setRecords([]);
      }
    };
    
    loadRecords();
  }, [user]);

  // 更新剩余时间显示
  useEffect(() => {
    if (mode === 'pomodoro') {
      const currentPhaseTime = pomodoroConfig.isBreak 
        ? (pomodoroConfig.currentCycle % 4 === 0 ? pomodoroConfig.longBreakTime : pomodoroConfig.breakTime)
        : pomodoroConfig.workTime;
      setTimeLeft(currentPhaseTime - seconds);
    } else if (mode === 'countdown') {
      setTimeLeft(countdownTime - seconds);
    } else {
      setTimeLeft(seconds);
    }
  }, [seconds, mode, pomodoroConfig, countdownTime]);

  // 保存记录
  const saveRecord = async (duration, type = 'work') => {
    if (duration === 0) return;
    
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration,
      mode,
      type
    };
    
    try {
      // Save to localStorage directly for immediate persistence
      const existingRecords = localStorage.getItem('timerRecords');
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(newRecord);
      localStorage.setItem('timerRecords', JSON.stringify(records));
      
      // Also save to service if available
      if (timerService && user) {
        await timerService.saveRecord(newRecord, user?.id);
      }
      
      // Update state
      setRecords(prev => [...prev, newRecord]);
      console.log('Saved new record:', newRecord);
    } catch (error) {
      console.error('Failed to save timer record:', error);
    }
  };

  // 删除记录
  const deleteRecord = async (recordId) => {
    try {
      // Remove from localStorage
      const existingRecords = localStorage.getItem('timerRecords');
      if (existingRecords) {
        const records = JSON.parse(existingRecords);
        const updatedRecords = records.filter(record => record.id !== recordId);
        localStorage.setItem('timerRecords', JSON.stringify(updatedRecords));
      }
      
      // Also delete from service if available
      if (timerService && user) {
        await timerService.deleteRecord(recordId, user?.id);
      }
      
      // Update state
      setRecords(prev => prev.filter(record => record.id !== recordId));
      console.log('Deleted record:', recordId);
    } catch (error) {
      console.error('Failed to delete timer record:', error);
    }
  };

  // 开始计时
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          // 倒计时模式逻辑
          // Inside the startTimer function, modify the countdown logic:
          if (mode === 'countdown') {
            if (prevSeconds >= countdownTime) {
              clearInterval(intervalRef.current);
              setIsActive(false);
              
              // Add a flag to prevent duplicate records
              if (!timerCompleted.current) {
                timerCompleted.current = true;
                saveRecord(countdownTime);
                
                // Play notification sound
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('播放提示音失败:', e));
              }
              
              return prevSeconds;
            }
          }
          
          // 番茄模式逻辑
          if (mode === 'pomodoro') {
            const isLongBreak = pomodoroConfig.currentCycle % 4 === 0 && pomodoroConfig.isBreak;
            const currentPhaseTime = pomodoroConfig.isBreak 
              ? (isLongBreak ? pomodoroConfig.longBreakTime : pomodoroConfig.breakTime)
              : pomodoroConfig.workTime;
              
            if (prevSeconds >= currentPhaseTime) {
              // 保存记录
              if (!pomodoroConfig.isBreak) {
                saveRecord(currentPhaseTime, 'work');
                setPomodoroConfig(prev => ({
                  ...prev,
                  completedPomodoros: prev.completedPomodoros + 1
                }));
              } else {
                saveRecord(currentPhaseTime, 'break');
              }
              
              // 切换工作/休息状态
              setPomodoroConfig(prev => ({
                ...prev,
                isBreak: !prev.isBreak,
                currentCycle: prev.isBreak ? prev.currentCycle + 1 : prev.currentCycle
              }));
              
              // 播放提示音
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log('播放提示音失败:', e));
              
              return 0; // 重置计时器
            }
          }
          
          return prevSeconds + 1;
        });
      }, 1000);
    }
  };

  // 暂停计时
  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
  };

  // 重置计时
  // Add a ref to track if the timer has completed
  const timerCompleted = useRef(false);
  
  // In the resetTimer function, reset the completion flag
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setSeconds(0);
    timerCompleted.current = false;
    
    if (mode === 'pomodoro') {
      setPomodoroConfig(prev => ({
        ...prev,
        currentCycle: 1,
        isBreak: false
      }));
    }
  };

  // 切换模式
  const toggleMode = (newMode) => {
    resetTimer();
    setMode(newMode);
  };

  // 完成计时
  const finishTimer = () => {
    if (seconds > 0) {
      saveRecord(seconds);
    }
    resetTimer();
  };

  // 设置自定义倒计时
  // Add state for seconds input
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  
  // Modify the setCustomCountdown function
  const setCustomCountdown = () => {
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    
    if (minutes > 0 || seconds > 0) {
      setCountdownTime((minutes * 60) + seconds);
      setShowSettings(false);
      resetTimer();
    }
  };

  // 格式化时间显示
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 获取当前阶段显示
  const getPhaseDisplay = () => {
    if (mode !== 'pomodoro') return '';
    
    const { currentCycle, cycles, isBreak, completedPomodoros } = pomodoroConfig;
    const isLongBreak = currentCycle % 4 === 0 && isBreak;
    
    return `${isBreak ? (isLongBreak ? '长休息' : '休息') : '工作'} (${currentCycle}/${cycles}) - 已完成番茄: ${completedPomodoros}`;
  };

  // 获取计时器显示时间
  const getTimerDisplay = () => {
    if (mode === 'normal') {
      return formatTime(seconds);
    } else if (mode === 'pomodoro' || mode === 'countdown') {
      return formatTime(timeLeft > 0 ? timeLeft : 0);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md">
      <div className="mb-4 flex items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mr-4">
          {mode === 'normal' ? '计时器' : mode === 'pomodoro' ? '番茄计时器' : '倒计时'}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => toggleMode('normal')}
            className={`px-3 py-1 text-sm rounded-md ${mode === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}
          >
            普通
          </button>
          <button 
            onClick={() => toggleMode('pomodoro')}
            className={`px-3 py-1 text-sm rounded-md ${mode === 'pomodoro' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}
          >
            番茄
          </button>
          <button 
            onClick={() => toggleMode('countdown')}
            className={`px-3 py-1 text-sm rounded-md ${mode === 'countdown' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}
          >
            倒计时
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-600"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">设置</h3>
          
          {mode === 'pomodoro' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">工作时间 (分钟)</label>
                <input 
                  type="number" 
                  value={pomodoroConfig.workTime / 60}
                  onChange={(e) => setPomodoroConfig(prev => ({...prev, workTime: parseInt(e.target.value) * 60}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">休息时间 (分钟)</label>
                <input 
                  type="number" 
                  value={pomodoroConfig.breakTime / 60}
                  onChange={(e) => setPomodoroConfig(prev => ({...prev, breakTime: parseInt(e.target.value) * 60}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">长休息时间 (分钟)</label>
                <input 
                  type="number" 
                  value={pomodoroConfig.longBreakTime / 60}
                  onChange={(e) => setPomodoroConfig(prev => ({...prev, longBreakTime: parseInt(e.target.value) * 60}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">循环次数</label>
                <input 
                  type="number" 
                  value={pomodoroConfig.cycles}
                  onChange={(e) => setPomodoroConfig(prev => ({...prev, cycles: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
                  min="1"
                />
              </div>
            </div>
          )}
          
          {mode === 'countdown' && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">倒计时时间</label>
              <div className="flex mb-2">
                <div className="flex-1 mr-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">分钟</label>
                  <input 
                    type="number" 
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">秒钟</label>
                  <input 
                    type="number" 
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
                    min="0"
                    max="59"
                  />
                </div>
              </div>
              <button 
                onClick={setCustomCountdown}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                设置
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                当前设置: {Math.floor(countdownTime / 60)} 分 {countdownTime % 60} 秒
              </p>
            </div>
          )}
        </div>
      )}
      
      {mode === 'pomodoro' && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {getPhaseDisplay()}
        </div>
      )}
      
      <div className="relative w-64 h-64 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-zinc-700"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-100">
            {getTimerDisplay()}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-4">
        {!isActive ? (
          <button 
            onClick={startTimer}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            <PlayIcon className="h-6 w-6" />
          </button>
        ) : (
          <button 
            onClick={pauseTimer}
            className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
          >
            <PauseIcon className="h-6 w-6" />
          </button>
        )}
        
        <button 
          onClick={resetTimer}
          className="p-3 bg-gray-300 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-400 dark:hover:bg-zinc-600"
        >
          <ArrowPathIcon className="h-6 w-6" />
        </button>
        
        <button 
          onClick={finishTimer}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          disabled={seconds === 0}
        >
          <ClockIcon className="h-6 w-6" />
        </button>
      </div>
      
      {records.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">计时记录</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">时长</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">模式</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      暂无记录
                    </td>
                  </tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(record.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatTime(record.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {record.mode === 'pomodoro' ? '番茄工作法' : 
                         record.mode === 'countdown' ? '倒计时' : '普通计时'}
                        {record.type && ` (${record.type === 'work' ? '工作' : '休息'})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <button 
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


