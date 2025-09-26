import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment variable
API_KEY = os.environ.get('GEMINI_API_KEY')

if not API_KEY:
    print("No API key found!")
    exit()

# Configure the Gemini API
genai.configure(api_key=API_KEY)

print(f"API Key: {API_KEY[:10]}...{API_KEY[-5:]}")

# List available models first
try:
    print("\n=== Available models ===")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"- {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")

# Test different model names
model_names = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',  
    'gemini-pro',
    'gemini-1.0-pro',
    'models/gemini-1.5-flash',
    'models/gemini-pro'
]

for model_name in model_names:
    try:
        print(f"\n=== Testing model: {model_name} ===")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say 'Hello World' in 2 words")
        print(f"✅ SUCCESS: {response.text}")
        break  # Use the first working model
    except Exception as e:
        print(f"❌ FAILED: {str(e)[:100]}...")

print("\nModel testing complete!")