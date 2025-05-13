// ./backend/models/User.js
const mysql = require('mysql2/promise');

// create User table
const createUserTable = async () => {
    try {
        // Connect to MySQL without specifying a database
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
        });

        // Create the database if it doesn't exist
        const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE}\``;
        await connection.execute(createDatabaseQuery);
        console.log(`Database ${process.env.MYSQL_DATABASE} created or already exists.`);

        // Close the current connection and reconnect with the database specified
        await connection.end();

        const dbConnection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE, // Specify the database here
        });

        // Create the Users table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                license_key VARCHAR(255) NOT NULL
            );
        `;
        await dbConnection.execute(createTableQuery);
        console.log('Users table created or already exists.');

        await dbConnection.end();
    } catch (error) {
        console.error('Error creating Users table:', error);
    }
};

module.exports = createUserTable;