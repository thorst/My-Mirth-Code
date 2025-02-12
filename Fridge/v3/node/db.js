// db.js - Shared MySQL connection pool
require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_LIMIT || 10,
    queueLimit: 0
});

// Promisify for async/await support
const promisePool = pool.promise();

module.exports = promisePool;
