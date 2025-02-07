# Run with
# /home/eiuser01/.local/bin/pipenv run python killFridge.py

import os
import psutil

# Path to the lock file
LOCK_FILE = '/tmp/fridge_digest.lock'

def kill_existing_instances(script_name):
    current_pid = os.getpid()
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        if proc.info['pid'] != current_pid and script_name in proc.info['cmdline']:
            print(f"Killing existing instance with PID {proc.info['pid']}")
            proc.terminate()
            proc.wait()

def cleanup_lock_file(lock_file):
    if os.path.exists(lock_file):
        os.remove(lock_file)
        print(f"Lock file {lock_file} removed.")

def main():
    script_name = 'fridgeDigest.py'  # Name of your main script
    kill_existing_instances(script_name)
    cleanup_lock_file(LOCK_FILE)

if __name__ == "__main__":
    main()