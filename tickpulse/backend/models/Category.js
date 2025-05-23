// ./backend/models/Category.js
const mysql = require('mysql2/promise');

/**
 * Creates the Category table in the database if it doesn't already exist.
 * This table stores categories associated with users.
 * @async
 * @function createCategoryTable
 * @returns {Promise<void>} A promise that resolves when the table is created or if it already exists.
 * @throws {Error} If there is an error connecting to the database or executing the query.
 */
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
                category_id INT AUTO_INCREMENT PRIMARY KEY,
                category_name VARCHAR(255) NOT NULL,
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