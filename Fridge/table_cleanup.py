# cd /cl/fridge
# /home/eiuser01/.local/bin/pipenv run python table_cleanup.py
import MySQLdb
import time

def delete_records_in_batches(host, user, password, database, table_name, batch_size, pause_duration, max_retries):
    try:
        conn = MySQLdb.connect(
            host=host,
            user=user,
            passwd=password,
            db=database
        )
        cursor = conn.cursor()
        
        # Disable binary logging for this session
        cursor.execute("SET SESSION sql_log_bin = 0;")
        
        while True:
            retries = 0
            while retries < max_retries:
                try:
                    cursor.execute(f"""
                        DELETE {table_name} 
                        FROM {table_name}
                        JOIN (SELECT fridge_message_history_id FROM {table_name} LIMIT %s) AS subquery
                        ON {table_name}.fridge_message_history_id = subquery.fridge_message_history_id
                    """, (batch_size,))
                    deleted_rows = cursor.rowcount
                    conn.commit()
                    
                    print(f"Deleted {deleted_rows} rows")
                    
                    if deleted_rows < batch_size:
                        break
                    
                    time.sleep(pause_duration)  # Pause between batches
                    retries = 0  # Reset retries after a successful batch
                except MySQLdb.Error as e:
                    if "Deadlock found when trying to get lock" in str(e):
                        retries += 1
                        print(f"Deadlock encountered. Retrying {retries}/{max_retries}...")
                        time.sleep(pause_duration)
                    else:
                        raise e

            if retries == max_retries:
                print("Max retries reached. Exiting.")
                break

        cursor.close()
        conn.close()
        print("Deletion complete.")
    except MySQLdb.Error as e:
        print(f"Error: {e}")

# Example usage
host = 'localhost'
user = ''
password = ''
database = 'mirthext'
table_name = 'fridge_message_history_old'
batch_size = 20000  # Adjust batch size as needed
pause_duration = 1  # Pause duration in seconds
max_retries = 5  # Maximum number of retries for deadlocks

delete_records_in_batches(host, user, password, database, table_name, batch_size, pause_duration,max_retries )