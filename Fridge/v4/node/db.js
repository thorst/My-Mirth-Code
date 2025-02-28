const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_SIZE || 10,
    queueLimit: 0,
});

module.exports = {
    // params should be an array of arrays, even if you are only inserting one record
    query: async (sql, params) => {
        const connection = await pool.getConnection();
        try {
            // Tempary log the query
            // Log query 
            // const formattedSql = mysql.format(sql, params);
            // console.log("Inserting message: ");
            // console.log(formattedSql);
            // -------------------
            // console.log("Values before insert:", JSON.stringify(params, null, 2));
            // console.log("Is array of arrays?:", Array.isArray(params) && params.every(Array.isArray));
            // -------------------

            const [results] = await connection.query(sql, [params]);
            return results;
        } finally {
            connection.release();
        }
    }
};
