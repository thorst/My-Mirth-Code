# cd /cl/fridge
# /home/eiuser01/.local/bin/pipenv run python table_drop.py
import mysql.connector

def drop_large_table(host, user, password, database, table_name):
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = conn.cursor()
        
        # Disable binary logging for this session
        cursor.execute("SET SESSION sql_log_bin = 0;")
        
        # Drop the table
        cursor.execute(f"DROP TABLE IF EXISTS {table_name};")
        conn.commit()
        
        print(f"Table {table_name} dropped successfully.")
        
        cursor.close()
        conn.close()
    except mysql.connector.Error as e:
        print(f"Error: {e}")

# Example usage
host = 'localhost'
user = ''
password = ''
database = 'mirthext'
table_name = 'fridge_message_history_old'

drop_large_table(host, user, password, database, table_name)