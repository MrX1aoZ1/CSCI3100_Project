// ./backend/models/Task.js
const mysql = require('mysql2/promise');

const createTimerTable = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const createTimerQuery = `
            CREATE TABLE IF NOT EXISTS Timer (
                timer_id INT AUTO_INCREMENT PRIMARY KEY,
                timer_duration TIME,
                date DATETIME,
                user_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );
        `;

        await connection.execute(createTimerQuery);
        console.log('Timers table created or already exists.');
        await connection.end();
    } catch (error) {
        console.error('Error creating Timers table:', error);
    }
};

module.exports = createTimerTable;