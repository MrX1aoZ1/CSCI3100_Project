'use client';

import { TaskProvider } from '@/context/TaskContext';
import { ThemeProvider } from '@/context/ThemeContext';
import NavigationBar from '@/components/NavigationBar';
import TaskModule from '@/components/TaskModule';

export default function Home() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="flex h-screen bg-white dark:bg-slate-800">
          <NavigationBar />
          <TaskModule />
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}