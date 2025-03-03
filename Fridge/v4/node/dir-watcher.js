require("dotenv").config();
const { Worker } = require("worker_threads");
const fs = require("fs").promises;
const path = require("path");

const WATCH_DIR = process.env.WATCH_DIR || "/default/path";
const workerPool = new Map(); // Store workers by directory

console.log(`Watching parent directory: ${WATCH_DIR}...`);

async function monitorDirectories() {
    while (true) {
        try {
            const dirEntries = await fs.readdir(WATCH_DIR, { withFileTypes: true });
            const dirs = dirEntries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

            // Start workers for new directories
            dirs.forEach(dir => {
                if (!workerPool.has(dir)) {
                    console.log(`New directory found: ${dir}`);
                    startWorker(dir);
                }
            });

            // Stop workers for deleted directories
            for (const dir of workerPool.keys()) {
                if (!dirs.includes(dir)) {
                    console.log(`Directory removed: ${dir}`);
                    stopWorker(dir);
                }
            }

        } catch (err) {
            console.error(`Error scanning directories: ${err}`);
        }

        // Sleep for 60 seconds
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
}

function startWorker(dirPath) {
    if (workerPool.has(dirPath)) return;

    console.log(`Starting worker for: ${dirPath}`);
    const worker = new Worker("./dir-worker.js", { workerData: { dirPath } });

    workerPool.set(dirPath, worker);

    worker.on("exit", (code) => {
        console.log(`Worker for ${dirPath} exited with code ${code}`);
        workerPool.delete(dirPath);
    });

    worker.on("error", (err) => {
        console.error(`Worker error: ${err}`);
        workerPool.delete(dirPath);
        setTimeout(() => startWorker(dirPath), 5000); // Restart with delay
    });
}

function stopWorker(dirPath) {
    const worker = workerPool.get(dirPath);
    if (worker) {
        console.log(`Stopping worker for: ${dirPath}`);
        worker.terminate();
        workerPool.delete(dirPath);
    }
}

// Start monitoring
monitorDirectories();
