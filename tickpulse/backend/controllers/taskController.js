const mysql = require('mysql2/promise');
const connectDB = require('../config/db'); // Assuming you have a connectDB function to establish a connection

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        console.log('getTasks called');
        const connection = await connectDB();
        const [tasks] = await connection.query('SELECT * FROM tasks');
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
        const [tasks] = await connection.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
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
    const { task_name, content, status, deadline, priority, user_id, category_name } = req.body;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            `INSERT INTO Tasks (task_name, content, status, deadline, priority, user_id, category_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [task_name, content, status, deadline, priority, user_id, category_name]
        );
        res.status(201).json({ id: result.insertId, task_name, content, status, deadline, priority, user_id, category_name });
        await connection.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    const { task_name, content, status, deadline, priority, user_id, category_name } = req.body;

    try {
        const connection = await connectDB();
        const [result] = await connection.query(
            `UPDATE tasks 
             SET task_name = ?, content = ?, status = ?, deadline = ?, priority = ?, user_id = ?, category_name = ? 
             WHERE id = ?`,
            [task_name, content, status, deadline, priority, user_id, category_name, req.params.id]
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
    try {
        const connection = await connectDB();
        const [result] = await connection.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
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

    try {
        const connection = await connectDB();
        const [result] = await connection.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);

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

    try {
        const connection = await connectDB();
        const [result] = await connection.query('UPDATE tasks SET priority = ? WHERE id = ?', [priority, req.params.id]);

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

    try {
        const connection = await connectDB();
        const [result] = await connection.query('UPDATE tasks SET deadline = ? WHERE id = ?', [deadline, req.params.id]);

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

    try {
        const connection = await connectDB();
        const [result] = await connection.query('UPDATE tasks SET category_name = ? WHERE id = ?', [category_name, req.params.id]);

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

    try {
        const connection = await connectDB();
        const [result] = await connection.query('UPDATE tasks SET content = ? WHERE id = ?', [content, req.params.id]);

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