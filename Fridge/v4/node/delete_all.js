/*
    To run:
        node delete_all.js

*/

require("dotenv").config();
const mysql = require('mysql2/promise');

(async () => {
    // Database connection settings
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true // Allow multiple SQL statements
    };

    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log("Connected to database.");

        // Step 1: Fetch all history and meta tables
        const [tables] = await connection.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND (table_name LIKE '%_history' OR table_name LIKE '%_meta')
        `);

        if (tables.length === 0) {
            console.log("No matching tables found.");
            return;
        }

        console.log(`Found ${tables.length} tables to delete.`);

        // Step 2: Optimize performance
        await connection.execute(`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;`);
        await connection.execute(`SET SESSION sql_log_bin = 0;`);
        await connection.execute(`SET FOREIGN_KEY_CHECKS = 0;`);

        // Step 3: Delete each table
        for (const { table_name } of tables) {
            console.log(`Dropping table: ${table_name}`);
            await connection.execute(`DROP TABLE \`${table_name}\`;`);
        }

        console.log("All tables deleted successfully.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
        console.log("Database connection closed.");
    }
})();
