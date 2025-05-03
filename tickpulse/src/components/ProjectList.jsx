'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { FolderIcon, PlusIcon, TrashIcon, PencilIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ProjectList() {
  const { projects, selectedProjectId, dispatch, selectedView } = useTasks();
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isProjectListOpen, setIsProjectListOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [dragOverProjectId, setDragOverProjectId] = useState(null); // State for visual feedback

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddProject = () => {
    const trimmedName = newProjectName.trim();
    if (trimmedName) {
      dispatch({ type: 'ADD_PROJECT', payload: { name: trimmedName } });
      setNewProjectName(''); // Clear input
    }
  };

  const handleAddProjectKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddProject();
    }
  };

   const handleDeleteProject = (e, projectId) => {
     e.stopPropagation();
     if (projectId === 'inbox') {
         alert("Cannot delete the default Inbox project.");
         return;
     }
     if (window.confirm(`Are you sure you want to delete this project? Tasks will be moved to Inbox.`)) {
         dispatch({ type: 'DELETE_PROJECT', payload: projectId });
     }
   };

    const handleStartEdit = (e, project) => {
     e.stopPropagation();
     setEditingProjectId(project.id);
     setEditingName(project.name);
   };

   const handleSaveEdit = (e, projectId) => {
      e.stopPropagation();
     if (editingName.trim() && projectId && projectId !== 'inbox') {
       dispatch({ type: 'RENAME_PROJECT', payload: { projectId: projectId, newName: editingName.trim() } });
     }
     setEditingProjectId(null);
     setEditingName('');
   };

   const handleCancelEdit = () => {
     setEditingProjectId(null);
     setEditingName('');
   };

   const handleEditKeyDown = (e, projectId) => {
     if (e.key === 'Enter') {
       handleSaveEdit(e, projectId);
     } else if (e.key === 'Escape') {
       handleCancelEdit();
     }
   };


  // Update project selection to use separate actions
  const handleSelectProject = (projectId) => {
    if (editingProjectId !== projectId) {
      dispatch({ type: 'SET_VIEW', payload: 'project' });
      dispatch({ type: 'SELECT_PROJECT', payload: String(projectId) });
    }
  };


  // --- Drag and Drop Handlers for Projects ---
  const handleDragOver = (e, projectId) => {
    e.preventDefault(); // Necessary to allow dropping
    if (projectId !== 'inbox') { // Optional: Prevent dropping directly on 'Inbox' if desired, or handle differently
        setDragOverProjectId(projectId);
    }
  };

  const handleDragLeave = (e) => {
    setDragOverProjectId(null); // Clear visual feedback
  };

  const handleDrop = (e, targetProjectId) => {
    e.preventDefault();
    setDragOverProjectId(null); // Clear visual feedback
    const taskId = e.dataTransfer.getData('taskId'); // Get the task ID stored in handleDragStart

    if (taskId && targetProjectId && targetProjectId !== 'inbox') { // Ensure we have IDs and it's not inbox (or handle inbox drop separately if needed)
      dispatch({
        type: 'MOVE_TASK_TO_PROJECT',
        payload: { taskId, newProjectId: targetProjectId }
      });
       // Optional: Select the project where the task was dropped
       // handleSelectProject(targetProjectId);
    } else {
        console.warn("Drop failed: Missing taskId or targetProjectId, or tried dropping on Inbox.");
    }
  };
  // --- End Drag and Drop Handlers ---


  return (
    <div className="flex flex-col h-full px-2">
       {/* Projects Header with Accordion Toggle */}
       <div
         className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
         onClick={() => setIsProjectListOpen(!isProjectListOpen)}
       >
         <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Projects</h3>
         {isProjectListOpen ? <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400"/> : <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400"/>}
       </div>

      {/* Add Project Input (conditionally rendered) */}
      {isProjectListOpen && (
          <div className="flex gap-2 my-2 px-1">
             {/* Input */}
             <input
               type="text"
               placeholder="New project..."
               value={newProjectName}
               onChange={(e) => setNewProjectName(e.target.value)}
               onKeyDown={handleAddProjectKeyDown}
               className="flex-grow p-1.5 border rounded text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-600"
             />
             {/* Button */}
             <button
               onClick={handleAddProject}
               className="p-1.5 border rounded bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex-shrink-0 border-blue-500 dark:border-blue-600"
               title="Add Project"
             >
               <PlusIcon className="h-4 w-4" />
             </button>
           </div>
       )}

      {/* Project List (conditionally rendered and scrollable) */}
      {isProjectListOpen && (
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-zinc-600 dark:hover:scrollbar-thumb-zinc-500">
            {projects.map((project) => {
              // Fix: always compare as string
              const isSelected = isClient ? (selectedView === 'project' && String(project.id) === String(selectedProjectId)) : false;
              const isDraggingOver = dragOverProjectId === project.id; // Check if dragging over this project

              const baseClasses = "flex items-center justify-between p-2 rounded cursor-pointer group text-sm text-black dark:text-gray-100 transition-colors duration-150 ease-in-out";
              const selectedClasses = 'bg-gray-200 dark:bg-zinc-500 font-medium';
              const normalClasses = 'hover:bg-gray-100 dark:hover:bg-zinc-600';
              // Add class for drag-over state (only if not selected)
              const dragOverClasses = isDraggingOver && !isSelected ? 'bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-300 dark:ring-blue-700' : '';

              const conditionalClasses = isSelected ? selectedClasses : normalClasses;

              // Don't allow dropping on the 'Inbox' project itself via drag/drop
              const isDroppable = project.id !== 'inbox';

              return (
              <div
                key={project.id}
                className={`${baseClasses} ${conditionalClasses} ${dragOverClasses}`}
                onClick={() => handleSelectProject(project.id)}
                // --- Add Drop Handlers (only if droppable) ---
                onDragOver={isDroppable ? (e) => handleDragOver(e, project.id) : undefined}
                onDragLeave={isDroppable ? handleDragLeave : undefined}
                onDrop={isDroppable ? (e) => handleDrop(e, project.id) : undefined}
                // --- End Drop Handlers ---
                title={isDroppable ? `Drop task here to move to "${project.name}"` : project.name} // Add title hint
              >
                {/* Edit Input or Display Logic */}
                 {editingProjectId === project.id ? (
                      <input
                       type="text"
                       value={editingName}
                       onChange={(e) => setEditingName(e.target.value)}
                       onBlur={(e) => handleSaveEdit(e, project.id)}
                       onKeyDown={(e) => handleEditKeyDown(e, project.id)}
                       className="flex-grow p-0 m-0 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm text-black dark:text-gray-100 bg-white dark:bg-zinc-600"
                       autoFocus
                       onClick={(e) => e.stopPropagation()}
                     />
                 ) : (
                     <>
                         {/* Project Name and Icon */}
                         <div className="flex items-center space-x-2 overflow-hidden">
                             <FolderIcon className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                             <span className="text-black dark:text-gray-100 truncate" title={project.name}>{project.name}</span>
                         </div>
                         {/* Edit/Delete Buttons */}
                         {project.id !== 'inbox' && (
                             <div className="flex-shrink-0 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                     onClick={(e) => handleStartEdit(e, project)}
                                     className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
                                     title="Rename Project"
                                 >
                                     <PencilIcon className="h-3 w-3" />
                                 </button>
                                 <button
                                     onClick={(e) => handleDeleteProject(e, project.id)}
                                     className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
                                     title="Delete Project"
                                 >
                                     <TrashIcon className="h-3 w-3" />
                                 </button>
                             </div>
                         )}
                     </>
                 )}
              </div>
              );
            })}
          </nav>
      )}
    </div>
  );
}