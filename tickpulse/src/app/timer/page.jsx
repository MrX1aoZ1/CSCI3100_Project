'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';  // Keep the original import name
import NavigationBar from '@/components/NavigationBar';
import { TimerProvider } from '@/context/TimerContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TaskProvider } from '@/context/TaskContext';  // Add this import

export default function TimerPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TaskProvider>  {/* Add TaskProvider here */}
            {/* Remove ProtectedRoute wrapper for testing */}
            <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
              <NavigationBar />
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">专注时间</h1>
                  <TimerProvider>
                    <Timer />
                  </TimerProvider>
                </div>
              </div>
            </div>
          </TaskProvider>  {/* Close TaskProvider */}
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

