'use client';

import { useState } from 'react';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';
import { useTasks } from '@/context/TaskContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from './ErrorBoundary';
import { useRef } from 'react';

// Update the priorities array to include 'none'
const priorities = [
    { value: 'none', label: 'None' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export default function TaskModule() {
  const { selectedTaskId, dispatch, projects, selectedProjectId } = useTasks();

  // --- Add state for column widths ---
  const minTaskListWidth = 180;
  const maxTaskListWidth = 600;
  const [taskListWidth, setTaskListWidth] = useState(340); // px, initial task list width
  const resizing = useRef({ active: false, startX: 0, startTaskList: 0 });
  const [showDivider, setShowDivider] = useState(false);

  // --- Mouse event handlers for resizing ---
  const handleMouseDown = (e) => {
    resizing.current = {
      active: true,
      startX: e.clientX,
      startTaskList: taskListWidth,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    setShowDivider(true); // Keep divider visible while dragging
  };

  const handleMouseMove = (e) => {
    if (!resizing.current.active) return;
    const dx = e.clientX - resizing.current.startX;
    // Clamp the width
    const newWidth = Math.max(minTaskListWidth, Math.min(maxTaskListWidth, resizing.current.startTaskList + dx));
    setTaskListWidth(newWidth);
  };

  const handleMouseUp = () => {
    resizing.current.active = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    setShowDivider(false); // Hide divider after dragging
  };

  // Remove all state and handlers related to the old input bar
  // Remove: newTaskTitle, setNewTaskTitle, newTaskDeadline, setNewTaskDeadline, newTaskPriority, setNewTaskPriority, newTaskProjectId, setNewTaskProjectId, handleAddTask, handleAddTaskKeyDown

  // Keep only modal-related state and handlers
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    deadline: '',
    priority: 'none',
    projectId: selectedProjectId || 'inbox',
  });

  const handleOpenModal = () => {
    setForm({
      title: '',
      content: '',
      deadline: '',
      priority: 'none',
      projectId: selectedProjectId || 'inbox',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    dispatch({ type: 'ADD_TASK', payload: form });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Remove the old Add Task Bar here */}

      {/* Floating + Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl"
        onClick={handleOpenModal}
        title="Add Task"
      >
        +
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/10 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border rounded p-2"
                required
              />
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Details"
                className="w-full border rounded p-2"
              />
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="none">No Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2 font-semibold"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Bottom: Two Columns Area --- */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Column: Task List */}
        <div
          style={{ width: taskListWidth, minWidth: minTaskListWidth, maxWidth: maxTaskListWidth }}
          className="h-full border-r border-gray-200 dark:border-zinc-700 overflow-hidden flex flex-col"
        >
          <TaskList />
        </div>
        {/* Divider - absolutely positioned */}
        <div
          style={{
            position: 'absolute',
            left: Math.max(minTaskListWidth, Math.min(maxTaskListWidth, taskListWidth)) - 4,
            top: 0,
            height: '100%',
            width: 8,
            zIndex: 20,
            cursor: 'col-resize',
            background: showDivider ? 'rgba(59,130,246,0.15)' : 'transparent',
            borderLeft: showDivider ? '1px solid #3b82f6' : '1px solid transparent',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setShowDivider(true)}
          onMouseLeave={() => { if (!resizing.current.active) setShowDivider(false); }}
        />
        {/* Right Column: Task Detail */}
        <div className="h-full flex-1 overflow-y-auto">
          <TaskDetail />
        </div>
      </div>
    </div>
  );
}