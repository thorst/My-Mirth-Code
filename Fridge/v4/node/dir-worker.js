/*
    Worker thread for watching a subdirectory and processing JSON files.
*/

const { parentPort, workerData, threadId } = require("worker_threads");
const fs = require("fs").promises;
const path = require("path");
const db = require("./db");

const dirPath = workerData.dirPath;
const SQL_MAX_RETRIES = parseInt(process.env.SQL_MAX_RETRIES) || 5; // Ensure it's an integer

let lastActivity = {}; // Stores data for batch DB insert

console.log(`Worker watching: ${dirPath} with threadId: ${threadId}`);

(async function processQueue() {
    while (true) {
        try {
            const files = await fs.readdir(dirPath);
            const dbPromises = [];

            for (const fileName of files) {
                const filePath = path.join(dirPath, fileName);

                try {
                    // Read and parse JSON
                    const data = await fs.readFile(filePath, "utf8");
                    const json = JSON.parse(data);
                    //console.log(`Processing ${filePath}`);

                    // Process last activity batch data
                    json.connectors.forEach(conn => {
                        if (conn.connectorId < 0) return; // Skip invalid connectors

                        let key = `${json.channelName}|${conn.connectorName}`;
                        lastActivity[key] = [
                            json.channelId,
                            json.channelName,
                            conn.connectorId,
                            conn.connectorName,
                            conn.transmitDate ? conn.transmitDate / 1000 : null,
                            conn.estimatedDate ? conn.estimatedDate / 1000 : 0,
                            new Date()
                        ];
                    });

                    // Collect async DB insert promises
                    const insertPromises = json.connectors.map(async (conn) => {
                        if (!conn.message) return; // Skip empty messages

                        let mapData = Object.entries({
                            channel: json.mapChannel,
                            response: json.mapResponse,
                            source: conn.mapSource,
                            connector: conn.mapConnector
                        }).flatMap(([mapName, mapV]) =>
                            mapV ? Object.entries(mapV).map(([key, v]) => ({ k: key, v: String(v), map: mapName })) : []
                        );

                        let insertedId = await insertMessage([
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

                        let indexableMapData = buildMapData(insertedId, mapData);
                        if (indexableMapData.length > 0) {
                            await insertMetaData(indexableMapData);
                        }
                    });

                    dbPromises.push(...insertPromises);

                    // Delete file only after all DB operations finish
                    await Promise.all(insertPromises);
                    await fs.unlink(filePath);



                } catch (fileError) {
                    console.error(`Error processing file ${filePath}:`, fileError);
                }
            }

            // Wait for all DB operations to complete before next loop
            if (dbPromises.length > 0) {
                await Promise.all(dbPromises);
            }

        } catch (err) {
            console.error(`Error reading directory: ${err}`);
        }

        // Wait 15 seconds before checking again
        // generate a random number of milliseconds between 10 and 30 seconds
        let randomSleep = Math.floor(Math.random() * 20000) + 10000;

        await new Promise(resolve => setTimeout(resolve, randomSleep));
    }
})();

// Filter keys with "search" in their name
function buildMapData(insertedId, data) {
    return data
        .filter(map => map.k.startsWith("search") || map.k.endsWith("Search"))
        .map(map => [insertedId, map.k, map.v, map.map]);
}

// Retry-based DB insert function
async function insertMessage(data) {
    const sql = `
        INSERT INTO fridge_message_history (
            message_id, channel_id, channel_name, connector_id,
            connector_name, send_state, transmit_time, maps, message, response
        ) VALUES ?;
    `;

    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            const result = await db.query(sql, [data]);
            return result.insertId;
        } catch (e) {
            if (["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(e.code)) {
                console.warn(`Deadlock detected, retrying... Attempt: ${attempt + 1}`);
            } else {
                console.error(`DB Insert Error: ${e}`);
                throw e;
            }
        }
    }
}

// Insert metadata
async function insertMetaData(data) {
    if (!data.length) return;

    const sql = `
        INSERT INTO fridge_message_meta_data (
            fridge_message_history_id, key_string, value_string, map_string
        ) VALUES ?;
    `;

    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            await db.query(sql, data);
            return;
        } catch (e) {
            if (["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(e.code)) {
                console.warn(`Deadlock detected, retrying... Attempt: ${attempt + 1}`);
            } else {
                console.error(`DB Insert Error: ${e}`);
                throw e;
            }
        }
    }
}

// Batch write lastActivity to database every 1 minute
// generate a random interval in millseconds between 50 and 60 seconds
let randomInterval = Math.floor(Math.random() * 10000) + 50000;
setInterval(async () => {
    if (!Object.keys(lastActivity).length) return console.log("No records to write...");

    try {
        //console.log(`Writing ${Object.keys(lastActivity).length} records to database...`);
        await insertLastActivity(lastActivity);
        lastActivity = {}; // Clear batch after writing
    } catch (err) {
        console.error(`Error writing batch to database: ${err}`);
    }
}, randomInterval);

// Batch insert lastActivity
async function insertLastActivity(data) {
    const sql = `
        INSERT INTO last_activity (
            channel_id, channel_name, connector_id, connector_name, actual_transmit, estimated_transmit, updated
        ) VALUES ?
        ON DUPLICATE KEY UPDATE 
            actual_transmit = VALUES(actual_transmit), 
            estimated_transmit = VALUES(estimated_transmit), 
            updated = NOW();
    `;

    const values = Object.values(data);

    for (let attempt = 0; attempt < SQL_MAX_RETRIES; attempt++) {
        try {
            await db.query(sql, values);
            return;
        } catch (e) {
            if (["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(e.code)) {
                console.warn(`Deadlock detected, retrying... Attempt: ${attempt + 1}`);
            } else {
                console.error(`DB Insert Error: ${e}`);
                throw e;
            }
        }
    }
}
