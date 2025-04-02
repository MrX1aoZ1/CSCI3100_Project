'use client';

import TaskCategories from './TaskCategories';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';

export default function TaskModule() {
  return (
    <div className="flex-1 flex divide-x">
      <div className="w-2/10">
        <TaskCategories />
      </div>
      <div className="w-3/10">
        <TaskList />
      </div>
      <div className="w-3/10">
        <TaskDetail />
      </div>
    </div>
  );
}