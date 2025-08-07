#!/usr/bin/env python3

import requests
import json

# Test the chat saving functionality
def test_chat_saving():
    base_url = "http://127.0.0.1:8000"
    
    # First, let's create a user (if it doesn't exist)
    signup_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        # Try to sign up
        signup_response = requests.post(f"{base_url}/signup", json=signup_data)
        print(f"Signup response: {signup_response.status_code}")
        if signup_response.status_code == 200:
            print("User created successfully")
        elif signup_response.status_code == 400:
            print("User already exists, proceeding with login")
        else:
            print(f"Signup failed: {signup_response.text}")
            return
        
        # Login to get token
        login_data = {
            "username": "test@example.com",
            "password": "testpassword123"
        }
        
        login_response = requests.post(f"{base_url}/token", data=login_data)
        print(f"Login response: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return
        
        token_data = login_response.json()
        token = token_data["access_token"]
        user_id = token_data["user_id"]
        print(f"Login successful, user_id: {user_id}")
        
        # Test generating a story (this should create a chat automatically)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        story_data = {
            "prompt": "Create a user story for a login feature"
        }
        
        story_response = requests.post(f"{base_url}/api/generate-story", json=story_data, headers=headers)
        print(f"Story generation response: {story_response.status_code}")
        
        if story_response.status_code == 200:
            story_result = story_response.json()
            print("Story generated successfully!")
            print(f"Story: {story_result['story'][:100]}...")
        else:
            print(f"Story generation failed: {story_response.text}")
            return
        
        # Check if chats were created
        chats_response = requests.get(f"{base_url}/chats/", headers=headers)
        print(f"Chats response: {chats_response.status_code}")
        
        if chats_response.status_code == 200:
            chats = chats_response.json()
            print(f"Found {len(chats)} chats")
            
            for chat in chats:
                print(f"Chat ID: {chat['id']}, Title: {chat['title']}")
                
                # Get messages for this chat
                messages_response = requests.get(f"{base_url}/chats/{chat['id']}/messages/", headers=headers)
                if messages_response.status_code == 200:
                    messages = messages_response.json()
                    print(f"  Found {len(messages)} messages")
                    for msg in messages:
                        print(f"    Message: {msg['message'][:50]}... (User: {msg['is_user']})")
        
        else:
            print(f"Failed to get chats: {chats_response.text}")
            
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    test_chat_saving() 