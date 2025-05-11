'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import Timer from '@/components/Timer';
import withAuth from '@/components/WithAuth';

function TimerPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="flex h-screen bg-white dark:bg-zinc-800">
            <NavigationBar />
            <main className="flex-1 p-8 overflow-y-auto">
              <Timer />
            </main>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default withAuth(TimerPage);