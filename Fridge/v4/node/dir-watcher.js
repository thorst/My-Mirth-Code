/*
    About:
        This script watches a directory for new files and processes them. It uses chokidar to watch the directory 
        for new files and triggers a callback when a new file is detected. The script is designed to be run in 
        the background and can be started/stopped using nohup or PM2.

        It uses multiple threads to load data into the database, so it can handle multiple files at once.
        This is all done outside of the mirth engine, so it wont increase its performance.

    How to run:
        Initialize:
            copy code to server

        For testing WITHOUT ability to close the terminal:
            node dir-watcher.js                                                     ;To start the script with console log
            node dir-watcher.js > watch_output.log 2>&1                             ;To start the script, with saved log
            CTRL+C                                                                  ;To stop the script
        For testing WITH ability to close the terminal:
            nohup node file-watcher.js > /var/log/file_watcher.log 2>&1 &           ;Allows you to close the terminal and keep the script running, it should output the pid, take note
            ps aux | grep watch_files.js                                            ;Check if the script is running
            kill -9 12345                                                           ;Kill the script by PID
        In prod wiht PM2:
            // This is a more traditional command to start up
            pm2 start dir-watcher.js --name "fridge-dir-watcher" --time

            // Im trying to hardcode heap space but this may not be needed, so for now stick with the above command
            pm2 start "node --max-old-space-size=4096 dir-watcher.js" --name "fridge-dir-watcher" --max-memory-restart 4096M --time
       

           
            pm2 save && pm2 startup                                                 ;Make it auto-start on reboot:
            pm2 list                                                                ;Check if the script is running
            pm2 stop fridge-dir-watcher                                             ;Stop the script
            pm2 restart fridge-dir-watcher                                          ;Restart the script (say after you update)
            pm2 reload fridge-dir-watcher                                           ;Reload the script, no downtime
            pm2 restart fridge-dir-watcher --update-env                             ;Restart the script with updated env variables, if you change the package.json
            pm2 delete fridge-dir-watcher                                           ;Delete the script
            pm2 monit                                                               ;Monitor the scripts rerouces
            pm2 logs fridge-dir-watcher                                             ;watch the logs for this script
            pm2 show fridge-dir-watcher                                             ;View the details of the script
            pm2 info fridge-dir-watcher                                             ;View the details of the script
            /home/<user>/.pm2/logs                                                  ;Location of the logs

        >cat /proc/sys/fs/inotify/max_user_instances                               ;Check the max number of watchers, default is 128 how many separate inotify instances a single user can create
        >cat /proc/sys/fs/inotify/max_user_watches                                 ;Check the max number of watchers, default is 8192


    Alternatives:
        - supervisorctl
        - systemd

*/

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
            const dirs = dirEntries.filter(dirent => dirent.isDirectory()).map(dirent => path.join(WATCH_DIR, dirent.name));

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
