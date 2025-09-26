# Quick Start Guide: Getting the AI Chatbot Working

## Step 1: Start the Flask Server (Already Running)
The Flask server is already running on port 5050. You can verify by opening http://localhost:5050/health in your browser.

## Step 2: Run Your Frontend App
If not already running, start the frontend in a separate terminal window:

```
cd C:\Users\kalanithi\OneDrive\Documents\New folder\health-o-meter-buddy
npm run dev
```

## Step 3: Test the AI Chatbot
1. Go to the Help page in your app
2. Try asking health questions such as:
   - "What are healthy breakfast options?"
   - "How much water should I drink daily?"
   - "Is pizza healthy?"
   - "What are good sources of protein?"

## If You Need to Restart the Flask Server
If you close the terminal or need to restart the server, run:

```
cd C:\Users\kalanithi\OneDrive\Documents\New folder\health-o-meter-buddy\backend
python flask_ai_server.py
```

## Troubleshooting

### 1. "API error" Message
If you see an API error message in the chat:
- Make sure the Flask server is running
- Check the server logs for errors
- The fallback mechanism will provide offline responses

### 2. Flask Server Won't Start
If port 5050 is already in use, edit flask_ai_server.py and change the port number:
```python
port = int(os.environ.get('FLASK_PORT', 5051))  # Change to a different port
```

### 3. Gemini API Key Issues
If you see authentication errors, check your API key in backend/.env:
```
GEMINI_API_KEY=AIzaSyB5TWQJB4zTSv4vIFY6Tlvz3I3lY3Kcs2c
```