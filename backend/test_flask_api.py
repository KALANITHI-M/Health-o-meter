import requests
import json

# Test the Flask AI server
url = "http://localhost:5050/api/ai/health-advice"
data = {
    "query": "Test health suggestions",
    "type": "suggestions"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")