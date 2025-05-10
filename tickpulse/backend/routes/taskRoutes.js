// ./backend/routes/taskRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskPriority, updateTaskDeadline, updateTaskCategory, updateTaskContent } = require('../controllers/taskController');

const router = express.Router();    

router.get('/', protect, getTasks); // Get all tasks
router.get('/:id', protect, getTaskById); // Get task by ID
router.post('/', protect, createTask); // Create a new task
router.put('/:id', protect, updateTask); // Update a task by ID
router.delete('/:id', protect, deleteTask); // Delete a task by ID
router.put('/:id/status', protect, updateTaskStatus); // Update task status
router.put('/:id/priority', protect, updateTaskPriority); // Update task priority
router.put('/:id/deadline', protect, updateTaskDeadline);  // Update task deadline
router.put('/:id/category', protect, updateTaskCategory); // Update task category
router.put('/:id/content', protect, updateTaskContent); // Update task content

module.exports = router;