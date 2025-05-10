'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';

export default function ProjectList() {
  const [newProject, setNewProject] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { projects, dispatch, selectedView, activeProject } = useTasks();
  const pathname = usePathname();
  const router = useRouter();

  const handleAddProject = () => {
    if (newProject.trim()) {
      dispatch({
        type: 'ADD_PROJECT',
        payload: { id: Date.now().toString(), name: newProject.trim() }
      });
      setNewProject('');
      setIsAdding(false);
    }
  };

  const handleProjectSelect = (projectId) => {
    dispatch({ type: 'SET_VIEW', payload: 'project' });
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
    
    // Add navigation back to home page if we're on a different page
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <div>
      <ul className="mb-2">
        {projects.map(project => (
          <li key={project.id}>
            <button
              onClick={() => handleProjectSelect(project.id)}
              className={`w-full flex items-center px-2 py-2 text-sm rounded-md mb-1
                ${selectedView === 'project' && activeProject === project.id
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                }`}
            >
              <FolderIcon className="h-5 w-5 mr-2" />
              {project.name}
            </button>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            placeholder="Project name..."
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-600 rounded-l-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200"
            onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            autoFocus
          />
          <button
            onClick={handleAddProject}
            className="px-2 py-1 bg-blue-500 text-white text-sm rounded-r-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New project...
        </button>
      )}
    </div>
  );
}