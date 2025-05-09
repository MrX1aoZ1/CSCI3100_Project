'use client';

import TaskCategories from './TaskCategories';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';
import "@/styles/globals.css";

export default function TaskModule() {
  return (
    <div className="flex-1 flex divide-x">
      <div className="w-2/12">
        <TaskCategories />
      </div>
      <div className="w-5/12">
        <TaskList />
      </div>
      <div className="w-5/12">
        <TaskDetail />
      </div>
    </div>
  );
}