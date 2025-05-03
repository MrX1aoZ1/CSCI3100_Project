'use client';

import { TaskProvider } from '@/context/TaskContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import NavigationBar from '@/components/NavigationBar';
import TaskModule from '@/components/TaskModule';
import "@/styles/globals.css";

export default function Home() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TaskProvider>
          <div className="flex h-screen bg-white dark:bg-zinc-800">
            <NavigationBar />
            <TaskModule />
          </div>
        </TaskProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}