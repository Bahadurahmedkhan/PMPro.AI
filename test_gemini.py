import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini():
    try:
        print("Testing Gemini API connection...")
        
        # Get API key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set. Provide it via environment or .env file.")
        print(f"Using API key: {api_key[:10]}...")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Test simple prompt
        print("\nTesting with simple prompt...")
        response = model.generate_content("Say hello!")
        print("\nResponse:", response.text)
        
        # Test with system prompt
        print("\nTesting with combined prompt...")
        system_prompt = "You are a helpful assistant that answers questions clearly and concisely."
        user_prompt = "What is 2+2?"
        full_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
        response = model.generate_content(full_prompt)
        print("\nResponse:", response.text)
        
        # Test with user story prompt
        print("\nTesting with user story prompt...")
        system_prompt = """You are an expert AI assistant that converts product requirements into user stories.
        Format the response as:
        Title: (short description)
        User Story: As a [user], I want to [action] so that [benefit]."""
        user_prompt = "Add a logout button to the dashboard"
        full_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
        response = model.generate_content(full_prompt)
        print("\nResponse:", response.text)
        
        print("\nAll tests passed successfully!")
        
    except Exception as e:
        print(f"\nError during testing: {str(e)}")

if __name__ == "__main__":
    test_gemini() 