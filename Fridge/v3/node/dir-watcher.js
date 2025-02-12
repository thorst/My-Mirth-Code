/*
    About:
        This script watches a directory for new files and processes them. It uses chokidar to watch the directory 
        for new files and triggers a callback when a new file is detected. The script is designed to be run in 
        the background and can be started/stopped using nohup or PM2.

        It uses multiple threads to load data into the database, so it can handle multiple files at once.
        This is all done outside of the mirth engine, so it wont increase its performance.

    How to run:
        For testing WITHOUT ability to close the terminal:
            node dir-watcher.js > watch_output.log 2> watch_error.log       ;To start the script
            CTRL+C                                                          ;To stop the script
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
const path = require("path");
const fs = require("fs");

const WATCH_DIR = process.env.WATCH_DIR || "/default/path";
const workerPool = new Map(); // Store worker per subdirectory

console.log(`Watching parent directory: ${WATCH_DIR}...`);

const watcher = chokidar.watch(WATCH_DIR, {
    ignored: WATCH_DIR,
    persistent: true,
    ignoreInitial: false, // Process existing directories
    depth: 1, // Only watch direct subdirectories
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
    },
});

watcher.on("addDir", (dirPath) => {
    if (workerPool.has(dirPath)) return; // Worker already exists

    console.log(`Starting worker for: ${dirPath}`);
    const worker = new Worker("./dir-worker.js", { workerData: { dirPath } });

    workerPool.set(dirPath, worker);

    worker.on("exit", () => {
        console.log(`Worker for ${dirPath} exited`);
        workerPool.delete(dirPath);
    });

    worker.on("error", (err) => console.error(`Worker error: ${err}`));
});
