'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import NavigationBar from '@/components/NavigationBar';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TaskProvider } from '@/context/TaskContext';
import CalendarView from '@/components/CalendarView'; // Import the CalendarView component

export default function CalendarPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TaskProvider>
          <div className="flex h-screen bg-gray-50 dark:bg-zinc-950">
            <NavigationBar />
            <main className="flex-1 overflow-auto">
              <CalendarView />
            </main>
          </div>
        </TaskProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}