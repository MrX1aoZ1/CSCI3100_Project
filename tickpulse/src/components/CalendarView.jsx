'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { taskApi } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CalendarView() {
  const { tasks } = useTasks();
  const { showError } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [monthTasks, setMonthTasks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names for display
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to display
    const prevMonthDays = [];
    if (firstDayOfWeek > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthLastDay = prevMonth.getDate();
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(year, month - 1, prevMonthLastDay - i),
          isCurrentMonth: false
        });
      }
    }
    
    // Calculate days for current month
    const currentMonthDays = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Calculate days from next month to display
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDaysDisplayed; // 6 rows of 7 days
    
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    // Combine all days
    setCalendarDays([...prevMonthDays, ...currentMonthDays, ...nextMonthDays]);
  }, [currentDate]);

  // Fetch tasks for the current month
  // ... existing code ...
  useEffect(() => {
    const fetchMonthTasks = async () => {
      setIsLoading(true);
      try {
        const tasksByDate = {};
        
        tasks.forEach(task => {
          if (task.deadline) {
            // Ensure consistent date format (YYYY-MM-DD)
            const dateKey = new Date(task.deadline).toISOString().split('T')[0];
            if (!tasksByDate[dateKey]) {
              tasksByDate[dateKey] = [];
            }
            tasksByDate[dateKey].push(task);
          }
        });
        
        setMonthTasks(tasksByDate);
      } catch (error) {
        console.error('Failed to fetch tasks for calendar:', error);
        showError('Failed to load tasks for calendar view');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthTasks();
  }, [tasks]);
// ... existing code ...

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle day selection
  const handleDayClick = (day) => {
    setSelectedDay(day);
    
    // Format the date as YYYY-MM-DD to match task deadline format
    const dateStr = day.date.toISOString().split('T')[0];
    
    // Get tasks for the selected day
    setDayTasks(monthTasks[dateStr] || []);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get task count for a specific day
  const getTaskCountForDay = (day) => {
    const dateStr = formatDate(day.date);
    return monthTasks[dateStr]?.length || 0;
  };

  // Check if a day has any tasks
  const hasTasksForDay = (day) => {
    return getTaskCountForDay(day) > 0;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendar</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Calendar Header - Day Names */}
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="hidden md:flex justify-center items-center p-2 font-semibold text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isSelected = selectedDay && day.date.toDateString() === selectedDay.date.toDateString();
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                p-2 border rounded-md cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white dark:bg-zinc-800' : 'bg-gray-100 dark:bg-zinc-900 text-gray-400 dark:text-gray-600'}
                ${isToday ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-zinc-700'}
                ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                hover:bg-gray-100 dark:hover:bg-zinc-700
              `}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                  {day.date.getDate()}
                </span>
                {hasTasksForDay(day) && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {getTaskCountForDay(day)}
                  </span>
                )}
              </div>
              
              {/* Task indicators */}
              {hasTasksForDay(day) && (
                <div className="mt-1 space-y-1 max-h-12 overflow-hidden">
                  {(monthTasks[formatDate(day.date)] || []).slice(0, 2).map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="flex items-center space-x-1 text-xs truncate"
                    >
                      <span className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                      <span className="truncate">{task.task_name}</span>
                    </div>
                  ))}
                  {getTaskCountForDay(day) > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{getTaskCountForDay(day) - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Tasks */}
      {selectedDay && (
        <div className="mt-6 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Tasks for {selectedDay.date.toDateString()}
          </h3>
          
          {dayTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No tasks for this day</p>
          ) : (
            <div className="space-y-2">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-200 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800 dark:text-white">{task.task_name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)} bg-opacity-20 dark:bg-opacity-30`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.content && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{task.content}</p>
                  )}
                  <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Category: {task.category_name}</span>
                    <span>Status: {task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}