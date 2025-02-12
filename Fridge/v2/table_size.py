# cd /cl/fridge
# /home/eiuser01/.local/bin/pipenv run python table_size.py

import mysql.connector

def analyze_and_get_table_size(host, user, password, database, table_name):
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        cursor = conn.cursor()
        
        # Analyze table
        cursor.execute(f"ANALYZE TABLE {table_name};")
        analyze_result = cursor.fetchall()
        print("Analyze Table Result:", analyze_result)
        
        # Get table size in GB
        cursor.execute(f"""
            SELECT 
                table_name AS "Table",
                ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS "Size in GB"
            FROM 
                information_schema.tables
            WHERE 
                table_schema = %s 
                AND table_name = %s;
        """, (database, table_name))
        size_result = cursor.fetchall()
        
        # Extract and print the size in GB
        if size_result:
            table_size_gb = size_result[0][1]
            print("Table Size in GB:", table_size_gb)
        
        cursor.close()
        conn.close()
    except mysql.connector.Error as e:
        print(f"Error: {e}")

# Example usage
host = 'localhost'
user = ''
password = ''
database = 'mirthext'
table_name = 'fridge_message_history'

analyze_and_get_table_size(host, user, password, database, table_name)