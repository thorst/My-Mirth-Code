import os
import threading
import MySQLdb
import json
import fcntl
import time
from datetime import datetime, timedelta, time as dt_time
import shutil

# Configuration
CONFIG_FILE = 'db_config.json'
LOCK_FILE = '/tmp/fridge_digest.lock'
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds
FILE_AGE_THRESHOLD = 1  # seconds

def load_config(config_file):
    with open(config_file, 'r') as file:
        return json.load(file)

def is_file_old_enough(filepath, threshold):
    file_mtime = os.path.getmtime(filepath)
    file_age = time.time() - file_mtime
    return file_age > threshold

def process_directory(directory, config):
    db_config = config['db_config']
    error_directory = config['error_directory']
    os.makedirs(error_directory, exist_ok=True)
    
    try:
        connection = MySQLdb.connect(
            host=db_config['host'],
            db=db_config['database'],
            user=db_config['user'],
            passwd=db_config['password'],
            charset='utf8mb4'
        )
        cursor = connection.cursor()
        
        while True:
            files = os.listdir(directory)
            if not files:
                break
            
            for filename in files:
                filepath = os.path.join(directory, filename)
                if not os.path.isfile(filepath):
                    continue
                
                if not is_file_old_enough(filepath, FILE_AGE_THRESHOLD):
                    # print(f"Skipping file not old enough: {filename}")
                    continue
                
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if not content.strip():
                        print(f"Skipping empty file: {filename}")
                        continue
                    
                    try:
                        msg = json.loads(content)
                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON from file {filename}: {e}")
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
                    
                    # Retry logic for handling deadlocks
                    for attempt in range(MAX_RETRIES):
                        try:
                            # Build query to insert the message into the fridge
                            sql = """
                            INSERT INTO fridge_message_history (
                                message_id, channel_id, channel_name, connector_id, 
                                connector_name, send_state, transmit_time, maps, message, response
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                            """
                            cursor.execute(sql, (
                                msg["messageId"], msg["channelId"], msg["channelName"], 
                                msg["connectors"][0]["connectorId"], msg["connectors"][0]["connectorName"], 
                                msg["connectors"][0]["processingState"], 
                                msg["connectors"][0]["transmitDate"] / 1000, 
                                json.dumps(maps), msg["connectors"][0]["message"], 
                                msg["connectors"][0]["response"]
                            ))
                            
                            for conn in msg["connectors"]:
                                field_list = "channel_id, channel_name, connector_id, connector_name, updated"
                                value_list = "%s, %s, %s, %s, NOW()"
                                duplicate_list = ""
                                
                                values = [
                                    msg['channelId'], msg['channelName'], conn['connectorId'], conn['connectorName']
                                ]
                                
                                if "transmitDate" in conn and conn["transmitDate"] != 0:
                                    field_list += ", actual_transmit"
                                    value_list += ", %s"
                                    duplicate_list += " actual_transmit = VALUES(actual_transmit), "
                                    values.append(conn['transmitDate'] / 1000)
                                
                                if "estimatedDate" in conn and conn["estimatedDate"] != 0:
                                    field_list += ", estimated_transmit"
                                    value_list += ", %s"
                                    duplicate_list += " estimated_transmit = VALUES(estimated_transmit), "
                                    values.append(conn['estimatedDate'] / 1000)
                                
                                sql = f"""
                                INSERT INTO last_activity ({field_list}) 
                                VALUES ({value_list}) 
                                ON DUPLICATE KEY UPDATE {duplicate_list} updated = NOW();
                                """
                                cursor.execute(sql, values)
                            
                            # Commit the transaction
                            connection.commit()
                            break  # Exit the retry loop if successful
                        except MySQLdb.Error as e:
                            if e.args[0] == 1213:  # Deadlock error code
                                print(f"Deadlock detected. Retrying... (Attempt {attempt + 1}/{MAX_RETRIES})")
                                time.sleep(RETRY_DELAY)
                            else:
                                raise  # Re-raise the exception if it's not a deadlock
                    
                # Delete the file after processing
                os.remove(filepath)
        
    except MySQLdb.Error as e:
        print("Error: {}".format(e))
    finally:
        if connection:
            cursor.close()
            connection.close()

def main():
    # Create a lock file to prevent multiple instances
    with open(LOCK_FILE, 'w') as lock_file:
        try:
            fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except IOError:
            current_time = datetime.now().time()
            if not (dt_time(0, 0) <= current_time <= dt_time(2, 30)):
                print("Another instance is already running. Exiting.")
            return
        
        config = load_config(CONFIG_FILE)
        process_dir = config['process_directory']  # Renamed variable to avoid conflict
        threads = []
        
        for child_directory in os.listdir(process_dir):
            directory_path = os.path.join(process_dir, child_directory)
            if os.path.isdir(directory_path):
                thread = threading.Thread(target=process_directory, args=(directory_path, config))
                threads.append(thread)
                thread.start()
        
        for thread in threads:
            thread.join()

if __name__ == "__main__":
    main()