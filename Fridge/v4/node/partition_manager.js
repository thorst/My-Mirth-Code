/*
# Run partition management daily at midnight
0 0 * * * /usr/bin / node / path / to / mirth_partition_manager / partition_manager.js >> /var/log / mirth_partition.log 2 >& 1
*/

require("dotenv").config();
const mysql = require("mysql2/promise");

// Load database config from .env
const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function getUniqueChannelNames() {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
        const [rows] = await connection.execute(
            "SELECT DISTINCT channel_name FROM fridge_message_history"
        );
        return new Set(rows.map((row) => row.channel_name));
    } finally {
        await connection.end();
    }
}

async function getExistingPartitions() {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
        const [rows] = await connection.execute(`
      SELECT PARTITION_NAME 
      FROM INFORMATION_SCHEMA.PARTITIONS 
      WHERE TABLE_NAME = 'fridge_message_history' 
      AND TABLE_SCHEMA = DATABASE()
    `);
        return new Set(rows.map((row) => row.PARTITION_NAME).filter((p) => p !== "p_default"));
    } finally {
        await connection.end();
    }
}

async function createPartition(channelName) {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
        const sql = `ALTER TABLE fridge_message_history ADD PARTITION (PARTITION p_${channelName} VALUES IN ('${channelName}'))`;
        await connection.execute(sql);
        console.log(`Partition created for channel: ${channelName}`);
    } catch (err) {
        console.error(`Error creating partition for ${channelName}:`, err.message);
    } finally {
        await connection.end();
    }
}

async function dropPartition(partitionName) {
    const connection = await mysql.createConnection(DB_CONFIG);
    try {
        const sql = `ALTER TABLE fridge_message_history DROP PARTITION ${partitionName}`;
        await connection.execute(sql);
        console.log(`Partition ${partitionName} dropped.`);
    } catch (err) {
        console.error(`Error dropping partition ${partitionName}:`, err.message);
    } finally {
        await connection.end();
    }
}

async function managePartitions() {
    const currentChannels = await getUniqueChannelNames();
    const existingPartitions = await getExistingPartitions();

    // Add missing partitions
    for (const channel of [...currentChannels].filter((ch) => !existingPartitions.has(ch))) {
        await createPartition(channel);
    }

    // Drop partitions that are no longer needed
    for (const partition of [...existingPartitions].filter((p) => !currentChannels.has(p))) {
        await dropPartition(partition);
    }
}

// Execute the partition management
managePartitions().catch(console.error);
