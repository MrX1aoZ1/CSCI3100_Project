const mysql = require('mysql2/promise');

const connectDB = async () => {
    try {
        // Connect to MySQL without specifying a database
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
        });

        console.log('Connected to MySQL server');

        // Create the database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE}\``);
        console.log(`Database '${process.env.MYSQL_DATABASE}' ensured`);

        // Close the initial connection
        await connection.end();

        // Reconnect to the newly ensured database
        const dbConnection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log(`Connected to database '${process.env.MYSQL_DATABASE}'`);
        return dbConnection;
    } catch (error) {
        console.error('MySQL connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;