/*
    This script isnt called directly, and instead called from the file-worker.js

*/
const { parentPort, workerData } = require("worker_threads");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const dirPath = workerData.dirPath;
const fileQueue = []; // Queue for files
let lastActivity = {};   // Stores data to be written once per minute


console.log(`Worker watching: ${dirPath}`);

const watcher = chokidar.watch(dirPath, {
    persistent: true,
    ignoreInitial: true, // Process existing files on startup
    depth: 1, // Only watch direct files
    awaitWriteFinish: {
        stabilityThreshold: 1000,// Waits 1 seconds after last change
        pollInterval: 100, // Checks every 100ms
    },
});

// Add files to queue
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

                console.log(`Processing ${filePath}:`, json);

                // Loop over each connector and push data to the last activity array
                json.connectors.forEach(function (conn) {

                    // Im sticking the raw source data into connector id -1, so we can ignore it
                    //  as far as last activity is concerend
                    if (conn.connectorId < 0) {
                        return;
                    }

                    // Update the last activity with an array of the parameters for a parameterized query
                    let key = json.channelName + "|" + conn.connectorName;
                    lastActivity[key] = [
                        json.channelId,
                        json.channelName,
                        conn.connectorId,
                        conn.connectorName,
                        conn.hasOwnProperty('transmitDate') && conn['transmitDate'] !== 0 ? conn['transmitDate'] / 1000 : null,
                        conn.hasOwnProperty('estimatedDate') && conn['estimatedDate'] !== 0 ? conn['estimatedDate'] / 1000 : 0
                    ];
                });

                // Simulate DB insert
                await insertIntoDatabase(json);

                fs.unlinkSync(filePath); // Delete after processing
                console.log(`Deleted: ${filePath}`);
            } catch (err) {
                console.error(`Error processing ${filePath}: ${err}`);
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to avoid high CPU usage
        }
    }


})();

// Simulated database insert function
function insertIntoDatabase(data) {
    return new Promise((resolve) => setTimeout(resolve, 50)); // Fake DB delay
}

// Simulated batch database insert function
function insertLastActivity(data) {
    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            const sql = `
                INSERT INTO last_activity (channel_id, channel_name, connector_id, connector_name, actual_transmit, estimated_transmit, updated)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    actual_transmit = VALUES(actual_transmit), 
                    estimated_transmit = VALUES(estimated_transmit), 
                    updated = NOW();
            `;

            // Data is an object of arrays, each array is a parameter set for the query
            connection.query(sql, data);
            connection.commit();
            break;
        } catch (e) {
            if (e.code === 'ER_LOCK_DEADLOCK' || e.code === 'ER_LOCK_WAIT_TIMEOUT') {
                // Try again
            } else {
                throw e;
            }
        }
    }
}

// Function to write batch data to the database every 1 minute
setInterval(async () => {
    if (lastActivity.length > 0) {
        try {
            console.log(`Writing ${lastActivity.length} records to database...`);
            await insertLastActivity(lastActivity);
            lastActivity = {}; // Clear batch after writing
        } catch (err) {
            console.error(`Error writing batch to database: ${err}`);
        }
    }
}, 60000); // Run every 60 seconds
