/*
    This script isnt called directly, and instead called from the file-worker.js

*/
/*
    Worker thread for watching a subdirectory and processing JSON files.
*/

const { parentPort, workerData } = require("worker_threads");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const dirPath = workerData.dirPath;
const fileQueue = [];
let lastActivity = {}; // Stores data for batch DB insert

const SQL_MAX_RETRIES = process.env.SQL_MAX_RETRIES || 5; // Pull from .env

console.log(`Worker watching: ${dirPath}`);

// Initialize watcher
const watcher = chokidar.watch(dirPath, {
    persistent: true,
    ignoreInitial: false, // Process existing files on startup
    depth: 1,
    awaitWriteFinish: {
        stabilityThreshold: 1000, // Wait 1s after last change
        pollInterval: 100,
    },
});

// Queue files for processing
watcher.on("add", (filePath) => {
    fileQueue.push(filePath);
});

(async function processQueue() {
    while (true) {
        if (fileQueue.length > 0) {
            const filePath = fileQueue.shift();
            try {
                const data = fs.readFileSync(filePath, "utf8");
                const json = JSON.parse(data);

                console.log(`Processing ${filePath}:`);

                // Populate `lastActivity` batch
                json.connectors.forEach(conn => {
                    if (conn.connectorId < 0) return; // Ignore raw source data
                    let key = json.channelName + "|" + conn.connectorName;
                    lastActivity[key] = [
                        json.channelId,
                        json.channelName,
                        conn.connectorId,
                        conn.connectorName,
                        conn.transmitDate ? conn.transmitDate / 1000 : null,
                        conn.estimatedDate ? conn.estimatedDate / 1000 : 0
                    ];
                });

                // Insert file data into DB
                let inserted_id = await insertMessage([
                    json.channelId,
                    json.channelName,
                    conn.connectorId,
                    conn.connectorName,
                    conn.transmitDate ? conn.transmitDate / 1000 : null,
                    conn.estimatedDate ? conn.estimatedDate / 1000 : 0
                ]).then(() => {
                    // Build map data for connector
                    let mapData = [];

                    // Loop over the connector.mapConnector object
                    mapData.concat(buildMapData(inserted_id, conn.mapConnector, "connector"));
                    mapData.concat(buildMapData(inserted_id, conn.mapSource, "source"));
                    mapData.concat(buildMapData(inserted_id, json.mapChannel, "channel"));
                    mapData.concat(buildMapData(inserted_id, json.mapResponse, "response"));


                    insertMetaData(mapData);
                });

                // Delete processed file
                fs.unlinkSync(filePath);
                console.log(`Deleted: ${filePath}`);
            } catch (err) {
                console.error(`Error processing ${filePath}: ${err}`);
                fileQueue.push(filePath); // Re-queue failed file
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Prevent high CPU usage
        }
    }
})();

function buildMapData(inserted_id, data, map) {
    let mapData = [];
    for (let key in data) {
        if (key.startsWith("search") || key.endsWith("search")) {
            mapData.push([
                inserted_id,
                key,
                data[key],
                map
            ]);
        }
    }
    return mapData;
}

// Retry-based DB insert function
async function insertMessage(data) {
    const sql = `INSERT INTO last_activity (channel_id, channel_name, connector_id, connector_name, actual_transmit, estimated_transmit, updated)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                actual_transmit = VALUES(actual_transmit), 
                estimated_transmit = VALUES(estimated_transmit), 
                updated = NOW();`;


    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            const result = await db.query(sql, data);
            return result.insertId; // <-- Fix here
        } catch (e) {
            if (e.code === "ER_LOCK_DEADLOCK" || e.code === "ER_LOCK_WAIT_TIMEOUT") {
                console.warn(`Deadlock detected, retrying... Attempt: ${attempt + 1}`);
            } else {
                console.error(`DB Insert Error: ${e}`);
                throw e;
            }
        }
    }
}

async function insertMetaData(data) {
    if (Object.keys(data).length === 0) return; // Don't execute empty queries

    const sql = `INSERT INTO fridge_message_meta_data (
                    fridge_message_history_id, key_string, value_string, map_string
                ) VALUES (
                    ?,?,?,?
                );`;


    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            await db.query(sql, data);
            return;
        } catch (e) {
            if (e.code === "ER_LOCK_DEADLOCK" || e.code === "ER_LOCK_WAIT_TIMEOUT") {
                console.warn(`Deadlock detected, retrying... Attempt: ${attempt + 1}`);
            } else {
                console.error(`DB Insert Error: ${e}`);
                throw e;
            }
        }
    }
}

// Batch write lastActivity to database every 1 min
setInterval(async () => {
    if (Object.keys(lastActivity).length > 0) {
        try {
            console.log(`Writing ${Object.keys(lastActivity).length} records to database...`);
            await insertLastActivity(lastActivity);
            lastActivity = {}; // Clear batch after writing
        } catch (err) {
            console.error(`Error writing batch to database: ${err}`);
        }
    }
}, 60000); // 1 min

// Batch insert lastActivity function
async function insertLastActivity(data) {
    const sql = `
        INSERT INTO last_activity (channel_id, channel_name, connector_id, connector_name, actual_transmit, estimated_transmit, updated)
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
            actual_transmit = VALUES(actual_transmit), 
            estimated_transmit = VALUES(estimated_transmit), 
            updated = NOW();
    `;

    const values = Object.values(data);

    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            await db.query(sql, [values]);
            return;
        } catch (e) {
            if (e.code === "ER_LOCK_DEADLOCK" || e.code === "ER_LOCK_WAIT_TIMEOUT") {
                console.warn(`Deadlock detected, retrying... Attempt: ${attempt + 1}`);
            } else {
                console.error(`DB Insert Error: ${e}`);
                throw e;
            }
        }
    }
}
