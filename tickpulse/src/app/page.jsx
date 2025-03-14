'use client';

// import TaskSidebar from '@/components/TaskSidebar';
// import NavBar from '@/components/NavBar';
import TaskList from '@/components/TaskList';
import TaskDetail from '@/components/TaskDetail';
import { TaskProvider } from '@/context/TaskContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function Home() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="flex h-screen">
          {/* <NavBar /> */}
          <MainContent />
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}

function MainContent() {
  return (
    <div className="flex-1 flex">
      <div className="w-1/5 border-r">
        {/* <TaskSidebar /> */}
      </div>
      <div className="flex-1 flex divide-x">
        <div className="w-3/10">
          <TaskList />
        </div>
        <div className="w-3/10">
          <TaskDetail />
        </div>
      </div>
    </div>
  );
}