const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith('Bearer')) {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Connect to the database
            const connection = await connectDB();

            // Query the user by ID
            const [rows] = await connection.query('SELECT * FROM Users WHERE id = ?', [decoded.id]);

            // Close the database connection
            await connection.end();

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach the user to the request object (excluding the password)
            const user = rows[0];
            delete user.password; // Remove the password field
            req.user = user;

            next();
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Token failed', error: error.message });
    }
};

module.exports = { protect };