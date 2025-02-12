/*
    This script isnt called directly, and instead called from the file-worker.js

*/
const { workerData, parentPort } = require("worker_threads");
const fs = require("fs");

try {
    // Simulate file processing
    const fileContent = fs.readFileSync(workerData, "utf8");
    console.log(`Processed file: ${workerData}, size: ${fileContent.length} bytes`);

    parentPort.postMessage("done"); // Notify main thread
} catch (err) {
    console.error(`Error processing ${workerData}: ${err.message}`);
}
