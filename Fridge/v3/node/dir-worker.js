/*
    This script isnt called directly, and instead called from the file-worker.js

*/
/*
    Worker thread for watching a subdirectory and processing JSON files.
*/

const { parentPort, workerData, threadId } = require("worker_threads");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const dirPath = workerData.dirPath;
const fileQueue = [];
let lastActivity = {}; // Stores data for batch DB insert

const SQL_MAX_RETRIES = process.env.SQL_MAX_RETRIES || 5; // Pull from .env

console.log(`Worker watching: ${dirPath} with threadId: ${threadId}`);

// Initialize watcher
const watcher = chokidar.watch(dirPath, {
    persistent: true,
    ignoreInitial: false, // Process existing files on startup
    depth: 0,
    awaitWriteFinish: {
        stabilityThreshold: 1000, // Wait 1s after last change
        pollInterval: 100,
    },
});

// Queue files for processing
// watcher.on("add", (filePath) => {
//     fileQueue.push(filePath);
// });
watcher.on("add", async (filePath) => {
    //console.log("File Added: ", filePath, " on thread ", threadId);
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

                // Process lastActivity
                json.connectors.forEach(conn => {
                    // Ignore the raw source connector, thats made up
                    if (conn.connectorId < 0) return;

                    let key = json.channelName + "|" + conn.connectorName;
                    const now = new Date();
                    lastActivity[key] = [
                        json.channelId,
                        json.channelName,
                        conn.connectorId,
                        conn.connectorName,
                        conn.transmitDate ? conn.transmitDate / 1000 : null,
                        conn.estimatedDate ? conn.estimatedDate / 1000 : 0,
                        now
                    ];
                });

                // Collect async DB insert promises
                const dbPromises = json.connectors.map(async (conn) => {
                    //console.log(`working on conn: ${conn.connectorId}`);

                    if (!conn.message) {
                        //console.log(`Message empty, skipping.`);
                        return;
                    }



                    // Make one dictionary with all map data
                    let mapData = Object.entries({
                        channel: json.mapChannel,
                        response: json.mapResponse,
                        source: conn.mapSource,
                        connector: conn.mapConnector
                    }).flatMap(([mapName, mapV]) =>
                        mapV ? Object.entries(mapV).map(([key, v]) => ({ k: key, v: String(v), map: mapName })) : []
                    );

                    // Insert message
                    let inserted_id = await insertMessage([
                        json.messageId,
                        json.channelId,
                        json.channelName,
                        conn.connectorId,
                        conn.connectorName,
                        conn.processingState,
                        conn.transmitDate / 1000,
                        JSON.stringify(mapData),
                        conn.message,
                        conn.response
                    ]);

                    //  conn.estimatedDate ? conn.estimatedDate / 1000 : 0

                    // Insert indexable map data
                    let indexableMapData = buildMapData(inserted_id, mapData);
                    if (indexableMapData.length > 0) {
                        //console.log(`Inserting indexable map data: ${filePath}`);
                        await insertMetaData(indexableMapData);
                    }
                });

                // Wait for all database operations to finish
                await Promise.all(dbPromises);

                // Delete processed file only after all DB operations are done
                //console.log(`Deleting: ${filePath}`);
                fs.unlinkSync(filePath);
                //console.log(`Deleted: ${filePath}`);

            } catch (err) {
                console.log(`Error processing ${filePath}: ${err}`);
                fileQueue.push(filePath); // Re-queue failed file
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Prevent high CPU usage
        }
    }
})();



/*
    Filter to only include keys with search in the name
*/
function buildMapData(inserted_id, data) {

    let mapData = [];
    data.forEach((map) => {
        if (map.k.startsWith("search") || map.k.endsWith("Search")) {
            mapData.push([
                inserted_id,
                map.k,
                map.v,
                map.map
            ]);
        }
    });

    return mapData;
}

// Retry-based DB insert function VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
async function insertMessage(data) {
    const sql = ` INSERT INTO fridge_message_history (
                message_id, channel_id, channel_name, connector_id,
                connector_name, send_state, transmit_time, maps, message, response
            )   VALUES ? ;`;


    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {


            const result = await db.query(sql, [data]);
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

//VALUES (  ?,?,?,?  )
async function insertMetaData(data) {
    if (Object.keys(data).length === 0) return; // Don't execute empty queries

    const sql = `INSERT INTO fridge_message_meta_data (
                    fridge_message_history_id, key_string, value_string, map_string
                ) VALUES ?;`;

    //console.log(data);

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
    } else {
        console.log(`No records to write...`);
    }
}, 60000); // 1 min == 60000   15000 == 15 sec

// Batch insert lastActivity function VALUES (?, ?, ?, ?, ?, ?, NOW())
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
    //console.log(values);
    // const flattenedValues = values.flat(); // Flatten nested arrays into a single array, the mysql2 library doesn't support nested arrays
    // console.log(flattenedValues);
    // const values = Object.values(data).map(row => [
    //     row[0], // channel_id
    //     row[1], // channel_name
    //     row[2], // connector_id
    //     row[3], // connector_name
    //     row[4] , // actual_transmit
    //     row[5] , // estimated_transmit
    //     new Date().toISOString().slice(0, 19).replace("T", " ") // updated
    // ]);

    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            await db.query(sql, values);
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
