// ./backend/models/Task.js
const mysql = require('mysql2/promise');

const createCategoryTable = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Category (
                category_name VARCHAR(255) NOT NULL PRIMARY KEY,
                user_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            );
        `;

        await connection.execute(createTableQuery);
        console.log('Category table created or already exists.');
        await connection.end();
    } catch (error) {
        console.error('Error creating Category table:', error);
    }
};

module.exports = createCategoryTable;