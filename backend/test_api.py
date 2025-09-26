import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

try:
    # Test with the model name that should work
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = model.generate_content("Say hello in 5 words")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    
    # Try with different model name
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say hello in 5 words")
        print(f"Success with gemini-pro! Response: {response.text}")
    except Exception as e2:
        print(f"Error with gemini-pro: {e2}")