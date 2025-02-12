import os
import threading
import mysql.connector
import json
import fcntl
import time
from datetime import datetime
import shutil

# Configuration constants
CONFIG_FILE = 'db_config.json'
LOCK_FILE = '/tmp/fridge_digest.lock'
SQL_MAX_RETRIES = 3
DIR_MAX_LOOPS = 3
RETRY_DELAY = 1  # seconds
FILE_AGE_THRESHOLD = 4  # seconds
BATCH_SIZE = 100

# Load configuration from a JSON file
def load_config(config_file):
    with open(config_file, 'r') as file:
        return json.load(file)

# Check if a file is older than a given threshold
def is_file_old_enough(filepath, threshold):
    file_mtime = os.path.getmtime(filepath)
    file_age = time.time() - file_mtime
    return file_age > threshold

# Process files in a directory and insert data into the database
def process_directory(directory, config, last_activity_dict):
    db_config = config['db_config']
    error_directory = config['error_directory']
    os.makedirs(error_directory, exist_ok=True)

    try:
        # Connect to the database
        connection = mysql.connector.connect(
            host=db_config['host'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password'],
            charset='utf8mb4'
        )
        cursor = connection.cursor()

        for dirloop in range(DIR_MAX_LOOPS):
            files = os.listdir(directory)
            if not files:
                break

            bulk_insert_data = []
            
            for filename in files:
                filepath = os.path.join(directory, filename)
                if not os.path.isfile(filepath) or not is_file_old_enough(filepath, FILE_AGE_THRESHOLD):
                    continue

                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if not content.strip():
                        continue

                    try:
                        msg = json.loads(content)
                    except json.JSONDecodeError:
                        shutil.move(filepath, os.path.join(error_directory, filename))
                        continue
                    
                    # Convert the maps to one JSON object
                    mapLoop = {
                        "channel": msg.get("mapChannel"),
                        "response": msg.get("mapResponse"),
                        "source": msg.get("connectors")[0].get("mapSource"),
                        "connector": msg.get("connectors")[0].get("mapConnector")
                    }
                    maps = []
                    for map_name, mapV in mapLoop.items():
                        if mapV is None:
                            continue
                        for key, v in mapV.items():
                            maps.append({
                                "k": key,
                                "v": str(v),
                                "map": map_name
                            })

                    # Prepare data for bulk insert
                    for conn in msg["connectors"]:
                        if conn["connectorId"] > 0:
                            break
                        
                        bulk_insert_data.append((
                            msg["messageId"], msg["channelId"], msg["channelName"],
                            conn["connectorId"], conn["connectorName"],
                            conn["processingState"],
                            conn["transmitDate"] / 1000,
                            json.dumps(maps), conn["message"],
                            conn["response"]
                        ))

                    # Update last activity dictionary
                    for conn in msg["connectors"]:
                        key = f"{msg['channelName']}|{conn['connectorName']}"
                        last_activity_dict[key] = (
                            msg['channelId'], msg['channelName'], conn['connectorId'], conn['connectorName'],
                            conn['transmitDate'] / 1000 if "transmitDate" in conn and conn["transmitDate"] != 0 else None,
                            conn['estimatedDate'] / 1000 if "estimatedDate" in conn and conn["estimatedDate"] != 0 else 0
                        )
                
                os.remove(filepath)

            if bulk_insert_data:
                execute_bulk_insert(connection, cursor, bulk_insert_data)

    except mysql.connector.Error as e:
        print("Error:", e)
    finally:
        if connection:
            cursor.close()
            connection.close()

# Execute bulk insert into the database
def execute_bulk_insert(connection, cursor, bulk_insert_data):
    for attempt in range(SQL_MAX_RETRIES):
        try:
            sql = """
            INSERT INTO fridge_message_history (
                message_id, channel_id, channel_name, connector_id,
                connector_name, send_state, transmit_time, maps, message, response
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
            cursor.executemany(sql, bulk_insert_data)
            connection.commit()
            break
        except mysql.connector.Error as e:
            if e.errno in [1213, 1206]:  # Deadlock or lock wait timeout
                time.sleep(RETRY_DELAY * (2 ** attempt))
            else:
                raise

# Execute bulk update of last activity into the database
def execute_bulk_last_activity(connection, cursor, last_activity_dict):
    bulk_data = list(last_activity_dict.values())
    for attempt in range(SQL_MAX_RETRIES):
        try:
            sql = """
            INSERT INTO last_activity (channel_id, channel_name, connector_id, connector_name, actual_transmit, estimated_transmit, updated)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE 
                actual_transmit = VALUES(actual_transmit), 
                estimated_transmit = VALUES(estimated_transmit), 
                updated = NOW();
            """
            cursor.executemany(sql, bulk_data)
            connection.commit()
            break
        except mysql.connector.Error as e:
            if e.errno in [1213, 1206]:  # Deadlock or lock wait timeout
                time.sleep(RETRY_DELAY * (2 ** attempt))
            else:
                raise

# Main function to coordinate the processing
def main():
    with open(LOCK_FILE, 'w') as lock_file:
        try:
            fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except IOError:
            return

        config = load_config(CONFIG_FILE)
        process_dir = config['process_directory']
        last_activity_dict = {}
        threads = []

        # Create and start threads for each subdirectory
        for child_directory in os.listdir(process_dir):
            directory_path = os.path.join(process_dir, child_directory)
            if os.path.isdir(directory_path):
                thread = threading.Thread(target=process_directory, args=(directory_path, config, last_activity_dict))
                threads.append(thread)
                thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        try:
            # Connect to the database and update last activity
            connection = mysql.connector.connect(
                host=config['db_config']['host'],
                database=config['db_config']['database'],
                user=config['db_config']['user'],
                password=config['db_config']['password'],
                charset='utf8mb4'
            )
            cursor = connection.cursor()
            execute_bulk_last_activity(connection, cursor, last_activity_dict)
        finally:
            if connection:
                cursor.close()
                connection.close()

if __name__ == "__main__":
    main()