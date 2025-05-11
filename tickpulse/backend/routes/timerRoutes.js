const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Save timer history
router.post('/timer-history', authenticateToken, async (req, res) => {
  try {
    const { history } = req.body;
    const userId = req.user.id;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ message: 'Invalid timer history data' });
    }
    
    // Insert each timer session into the database
    for (const session of history) {
      await db.query(
        `INSERT INTO timer_sessions 
        (user_id, timer_type, timer_mode, start_time, duration, completed, completion_time, pause_time, reset_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          session.type,
          session.mode,
          session.startTime,
          session.duration,
          session.completed ? 1 : 0,
          session.completionTime || null,
          session.pauseTime || null,
          session.resetTime || null
        ]
      );
    }
    
    res.status(201).json({ message: 'Timer history saved successfully' });
  } catch (error) {
    console.error('Error saving timer history:', error);
    res.status(500).json({ message: 'Failed to save timer history' });
  }
});

// Get timer history for the current user
router.get('/timer-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await db.query(
      `SELECT * FROM timer_sessions 
      WHERE user_id = ? 
      ORDER BY start_time DESC 
      LIMIT 50`,
      [userId]
    );
    
    res.status(200).json({ history: rows });
  } catch (error) {
    console.error('Error fetching timer history:', error);
    res.status(500).json({ message: 'Failed to fetch timer history' });
  }
});

module.exports = router;