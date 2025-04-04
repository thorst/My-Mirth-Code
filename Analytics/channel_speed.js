require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");

(async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.PG_DB_NAME,
        port: 5432, // adjust if needed
    });

    await client.connect();

    const output_file = "/cl/node/statistics/channel_speed.csv";
    const analyze_start_date = "2025-03-28";
    const analyze_end_date = "2025-03-29";
    const guids = [
        "6497da6a-27dc-4eea-80b8-444df5497b68",
        "eb7ed33a-c5bb-431e-956d-497adc1efa27",
        "167cd95a-1873-4315-ba4c-af4078f0c409",
        "221fe1e1-03f1-4032-825b-d7c8148f5b5e",
        "088e59f7-1cb1-43e6-ad4d-e050e076a9f1",
        "1a6fd63d-7569-41ac-8eaa-234eb84d387e",
        "9bdef35e-2f97-4977-ab5c-7a71bc0334cf",
        "4f19f1c5-7e51-4258-ab43-b87430375689",
        "e0980b08-e423-484a-bf41-2a56529e87ff",
        "ba5f031f-e172-466f-b58f-60b9f3825436",
        "255638b8-c7a3-4c03-963d-29c7db296db4",
        "ef4cc4bd-c719-44b9-bb60-383d3a734e86",
        "ba1c3618-f80b-463f-8302-2e863911299d",
    ];

    const res = await client.query(`SELECT channel_id, local_channel_id FROM d_channels`);
    const guidMap = {};
    res.rows.forEach(row => {
        guidMap[row.channel_id] = row.local_channel_id;
    });

    const csvLines = ["guid,connector_name,avg_processing_time"];

    for (const guid of guids) {
        const local_id = guidMap[guid];
        if (!local_id) continue;

        console.log("Working on " + guid + " with local id " + local_id);

        const query = `
            SELECT connector_name,
                   AVG(EXTRACT(EPOCH FROM (response_date - received_date))) AS avg_processing_time
            FROM d_mm${local_id}
            WHERE received_date > $1 AND received_date < $2 AND status = 'S'
            GROUP BY connector_name
        `;
        const { rows } = await client.query(query, [analyze_start_date, analyze_end_date]);

        for (const row of rows) {
            console.log("Row: ", row);
            csvLines.push(`${guid},${row.connector_name},${row.avg_processing_time}`);
        }
    }

    fs.writeFileSync(output_file, csvLines.join("\n"), "utf8");
    console.log("CSV written to", output_file);

    await client.end();
})();
