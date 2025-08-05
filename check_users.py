import sqlite3

def check_users():
    try:
        # Connect to the database
        conn = sqlite3.connect('storycrafter.db')
        cursor = conn.cursor()
        
        # Get all users
        cursor.execute("SELECT id, email, hashed_password FROM users")
        users = cursor.fetchall()
        
        # Print users
        print("\nRegistered Users:")
        print("----------------")
        if users:
            for user in users:
                print(f"ID: {user[0]}")
                print(f"Email: {user[1]}")
                print(f"Hashed Password: {user[2][:20]}...")  # Only show first 20 chars of hash
                print("----------------")
            print(f"\nTotal users: {len(users)}")
        else:
            print("No users found in the database.")
            
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_users() 