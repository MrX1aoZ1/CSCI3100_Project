// ./backend/models/Task.js
const mysql = require('mysql2/promise');

const createTaskTable = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task_name VARCHAR(255) NOT NULL,
                content TEXT DEFAULT NULL,
                status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
                deadline DATETIME DEFAULT NULL,
                priority ENUM('null', 'low', 'medium', 'high') DEFAULT 'null',
                user_id INT NOT NULL,
                category_name VARCHAR(255) DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );
        `;

        await connection.execute(createTableQuery);
        console.log('Tasks table created or already exists.');
        await connection.end();
    } catch (error) {
        console.error('Error creating Tasks table:', error);
    }
};

module.exports = createTaskTable;