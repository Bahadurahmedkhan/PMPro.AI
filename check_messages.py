import sqlite3
from datetime import datetime

def check_messages():
    try:
        # Connect to the database
        conn = sqlite3.connect('storycrafter.db')
        cursor = conn.cursor()
        
        # Get all users
        cursor.execute("SELECT id, email FROM users")
        users = cursor.fetchall()
        
        print("\nChat Messages by User:")
        print("---------------------")
        
        for user in users:
            print(f"\nUser {user[0]} ({user[1]}):")
            print("---------------------")
            
            # Get messages for this user
            cursor.execute("""
                SELECT message, is_user, timestamp 
                FROM chat_messages 
                WHERE user_id = ? 
                ORDER BY timestamp
            """, (user[0],))
            
            messages = cursor.fetchall()
            
            if messages:
                for msg in messages:
                    sender = "User" if msg[1] else "Bot"
                    timestamp = msg[2]
                    print(f"\n{sender} at {timestamp}:")
                    print(f"{msg[0][:100]}..." if len(msg[0]) > 100 else msg[0])
                print(f"\nTotal messages: {len(messages)}")
            else:
                print("No messages found.")
            
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_messages() 