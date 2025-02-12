/*
    About:
        This script watches a directory for new files and processes them. It uses chokidar to watch the directory 
        for new files and triggers a callback when a new file is detected. The script is designed to be run in 
        the background and can be started/stopped using nohup or PM2.

        It uses multiple threads to load data into the database, so it can handle multiple files at once.
        This is all done outside of the mirth engine, so it wont increase its performance.

    How to run:
        For testing WITHOUT ability to close the terminal:
            node watch_files.js                                     ;To start the script
            CTRL+C                                                  ;To stop the script
        For testing WITH ability to close the terminal:
            nohup node file-watcher.js > /var/log/file_watcher.log 2>&1 &   ;Allows you to close the terminal and keep the script running, it should output the pid, take note
            ps aux | grep watch_files.js                                    ;Check if the script is running
            kill -9 12345                                                   ;Kill the script by PID
        In prod wiht PM2:
            pm2 start watch_files.js --name "file-watcher"          ;Start the script:
            pm2 save && pm2 startup                                 ;Make it auto-start on reboot:
            pm2 list                                                ;Check if the script is running
            pm2 stop file-watcher                                   ;Stop the script
            pm2 restart file-watcher                                ;Restart the script (say after you update)
            pm2 delete file-watcher                                 ;Delete the script
            pm2 monit                                               ;Monitor the scripts rerouces

    Alternatives:
        - supervisorctl
        - systemd

*/

require("dotenv").config();
const chokidar = require("chokidar");
const { Worker } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const os = require("os");

const WATCH_DIR = process.env.WATCH_DIR || "/default/path"; // Load from .env
const MAX_WORKERS = parseInt(process.env.MAX_WORKERS) || os.cpus().length; // Limit workers
const workerPool = new Set();
const fileQueue = []; // Queue for pending files

console.log(`Watching for file changes in ${WATCH_DIR}...`);

// Initialize Chokidar watcher
const watcher = chokidar.watch(WATCH_DIR, {
    persistent: true,
    ignoreInitial: false,
    depth: 2, // Watch parent + child directories
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
    },
});

// Detect new files and queue them
watcher.on("add", (filePath) => {
    console.log(`New file detected: ${path.basename(filePath)}`);
    fileQueue.push(filePath);
});

// Function to process files using a worker thread
(async function processNextFile() {
    while (true) {
        if (fileQueue.length > 0 && workerPool.size < MAX_WORKERS) {

            const filePath = fileQueue.shift(); // Get the next file
            console.log(`Processing: ${filePath}`);

            const worker = new Worker("./file-worker.js", { workerData: filePath });
            workerPool.add(worker);

            worker.on("message", (msg) => {
                if (msg === "done") {
                    console.log(`Processed: ${filePath}, deleting...`);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Error deleting ${filePath}: ${err}`);
                    });
                }
            });

            worker.on("exit", () => {
                workerPool.delete(worker);
                processNextFile(); // Start processing next file in queue
            });

            worker.on("error", (err) => console.error(`Worker error: ${err}`));
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to avoid high CPU usage
        }
    }
})();


