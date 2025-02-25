const mysql = require('mysql2/promise');
require("dotenv").config();

async function bulkInsert() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,

    });

    const now = new Date();
    const data = [
        [1, 'John Doe', 'john@example.com', now],
        [2, 'Jane Smith', 'jane@example.com', now],
        [3, 'Sam Brown', 'sam@example.com', now]
    ];

    const sql = `INSERT INTO users (id, name, email, updated) VALUES ? 
                ON DUPLICATE KEY UPDATE updated = VALUES(updated)`;

    try {
        const [result] = await connection.query(sql, [data]);
        console.log('Rows inserted or updated:', result.affectedRows, " with id: ", result.insertId);
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await connection.end();
    }
}

bulkInsert();
