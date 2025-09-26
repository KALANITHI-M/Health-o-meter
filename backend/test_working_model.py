import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Try different models that should work
models_to_try = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro'
]

for model_name in models_to_try:
    try:
        print(f"Trying model: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello in 5 words")
        print(f"✅ SUCCESS with {model_name}! Response: {response.text}")
        break
    except Exception as e:
        print(f"❌ Failed with {model_name}: {e}")
        continue
else:
    print("❌ No working model found")