// ./backend/controllers/taskController.js
const mysql = require('mysql2/promise');
const connectDB = require('../config/db'); // Assuming you have a connectDB function to establish a connection

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        console.log('getTasks called');
        const connection = await connectDB();
        const [tasks] = await connection.query(
            'SELECT * FROM tasks WHERE user_id = ?',
            [req.user.id]
        );
        res.status(200).json(tasks);
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const connection = await connectDB();
        const [tasks] = await connection.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?', 
            [req.params.id, req.user.id]);
        
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(tasks[0]);
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { task_name, content, status, deadline, priority, category_name } = req.body;
    console.log('Creating task with data:', req.body); // Add this line for debugging

    const user_id = req.user.id;
    console.log('User ID:', user_id); // Add this line for debugging

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            `INSERT INTO Tasks (task_name, content, status, deadline, priority, user_id, category_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [task_name, content, status, deadline, priority, user_id, category_name]
        );
       
        console.log('Task created with ID:', result.insertId); // Add this line for debugging
        res.status(201).json({ id: result.insertId, task_name, content, status, deadline, priority, user_id, category_name });
        await connection.end();
    } catch (error) {
        console.error('Error creating task:', error); // Enhance error logging
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { task_name, content, status, deadline, priority, category_name } = req.body;

    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            `UPDATE tasks 
             SET task_name = ?, content = ?, status = ?, deadline = ?, priority = ?, user_id = ?, category_name = ? 
             WHERE id = ? 
             AND user_id = ?`,
            [task_name, content, status, deadline, priority, user_id, category_name, req.params.id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ id: req.params.id, task_name, content, status, deadline, priority, user_id, category_name });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?', 
            [req.params.id, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found or unauthorized' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
    const { status } = req.body;
    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?', [status, req.params.id, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ id: req.params.id, status });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task priority
// @route   PUT /api/tasks/:id/priority
// @access  Private
const updateTaskPriority = async (req, res) => {
    const { priority } = req.body;
    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            'UPDATE tasks SET priority = ? WHERE id = ? AND user_id = ? ', 
            [priority, req.params.id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ id: req.params.id, priority });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task deadline
// @route   PUT /api/tasks/:id/deadline 
// @access  Private
const updateTaskDeadline = async (req, res) => {
    const { deadline } = req.body;
    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            'UPDATE tasks SET deadline = ? WHERE id = ? AND user_id = ? ', 
            [deadline, req.params.id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ id: req.params.id, deadline });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task category
// @route   PUT /api/tasks/:id/category
// @access  Private
const updateTaskCategory = async (req, res) => {
    const { category_name } = req.body;
    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            'UPDATE tasks SET category_name = ? WHERE id = ? AND user_id = ? ', 
            [category_name, req.params.id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ id: req.params.id, category_name });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task content
// @route   PUT /api/tasks/:id/content
// @access  Private
const updateTaskContent = async (req, res) => {
    const { content } = req.body;
    const user_id = req.user.id;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            'UPDATE tasks SET content = ? WHERE id = ? AND user_id = ? ', 
            [content, req.params.id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ id: req.params.id, content });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskDeadline,
    updateTaskCategory,
    updateTaskContent,
};