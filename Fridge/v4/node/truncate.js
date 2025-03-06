/*
    Truncate
    The purpose of this script is to loop over all the message tables each day and remove messages
    older than 45 days. This is to prevent the database from growing too large. The script is run
    using cron sceduling in PM2.

    A future version of this will allow for the retention period to be set in the database, per channel.

     How to run:
        Initialize:
            copy code to server

        For testing WITHOUT ability to close the terminal:
            node truncate.js                                                     ;To start the script with console log
            node truncate.js > watch_output.log 2>&1                             ;To start the script, with saved log
            CTRL+C                                                                  ;To stop the script
        For testing WITH ability to close the terminal:
            nohup node file-watcher.js > /var/log/file_watcher.log 2>&1 &           ;Allows you to close the terminal and keep the script running, it should output the pid, take note
            ps aux | grep watch_files.js                                            ;Check if the script is running
            kill -9 12345                                                           ;Kill the script by PID
        In prod wiht PM2:
            // This is a more traditional command to start up
            pm2 start truncate.js --cron "0 18 * * *" --name fridge-truncate --time --no-autorestart
          
       

           
            pm2 save && pm2 startup                                                 ;Make it auto-start on reboot:
            pm2 list                                                                ;Check if the script is running
            pm2 stop fridge-truncate                                             ;Stop the script
            pm2 restart fridge-truncate                                          ;Restart the script (say after you update)
            pm2 reload fridge-truncate                                           ;Reload the script, no downtime
            pm2 restart fridge-truncate --update-env                             ;Restart the script with updated env variables, if you change the package.json
            pm2 delete fridge-truncate                                           ;Delete the script
            pm2 monit                                                               ;Monitor the scripts rerouces
            pm2 logs fridge-truncate                                             ;watch the logs for this script
            pm2 show fridge-truncate                                             ;View the details of the script
            pm2 info fridge-truncate                                             ;View the details of the script
            /home/<user>/.pm2/logs                                                  ;Location of the logs
*/

const retention_days = 5;

// Load the configuration
require("dotenv").config();
const mysql = require("mysql2");

let db = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_SIZE || 10,
    queueLimit: 0,
};

// Query the db to get a list of tables
const pool = mysql.createPool(db);
const connection = pool.promise();

(async () => {
    try {
        let sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name LIKE '%_history'";
        let [rows, fields] = await connection.query(sql, [db.database]);
        for (let row of rows) {
            let table = row.table_name;

            let cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - retention_days);
            let cutoffStr = cutoff.toISOString().split("T")[0];
            let deleteSQL = `DELETE FROM \`${table}\` WHERE inserted < '${cutoffStr}'`;
            console.log(`Running: ${deleteSQL}`);
            await connection.query(deleteSQL);
        }
        console.log("Truncation completed successfully.");
    } catch (error) {
        console.error("Error during truncation:", error);
    } finally {
        pool.end();
    }
})();