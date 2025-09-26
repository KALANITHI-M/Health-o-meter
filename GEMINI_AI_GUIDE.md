# Gemini AI Integration Guide

This guide will help you set up and run the Gemini AI integration for the Health-o-Meter Buddy app using a Python Flask server.

## Why Python Flask?

The original Express.js server was having issues with port conflicts and connection problems. This Python Flask implementation provides a reliable alternative that directly connects to the Gemini API.

## Setup Instructions

1. **Prerequisites**:
   - Python 3.9+ installed
   - pip (Python package manager)

2. **Install Dependencies**:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. **Set Environment Variables**:
   The Flask server will use the same GEMINI_API_KEY from your .env file.
   If needed, you can create a new .env file in the backend folder with:
   ```
   GEMINI_API_KEY=your_api_key_here
   FLASK_PORT=5050
   ```

4. **Start the Flask Server**:
   ```
   cd backend
   python flask_ai_server.py
   ```

   Or use the provided batch file:
   ```
   start_ai_server.bat
   ```

5. **Verify the Server**:
   Open your browser and navigate to:
   ```
   http://localhost:5050/health
   ```
   You should see a JSON response: `{"message":"Gemini AI Flask Server is running","status":"ok"}`

## Using the API

The Flask server exposes the following endpoint:

- **Health Advice**: `POST http://localhost:5050/api/ai/health-advice`
  - Request body: `{ "query": "your question or food item" }`
  - Response: `{ "text": "AI-generated response" }`

## Troubleshooting

1. **Port Conflict**:
   If port 5050 is already in use, edit flask_ai_server.py and change the port number.

2. **API Key Issues**:
   Ensure your Gemini API key is valid and has the necessary permissions.

3. **Connection Problems**:
   If the frontend can't connect to the Flask server, check that CORS is properly configured.

4. **Dependencies**:
   If you encounter module not found errors, run `pip install -r requirements.txt` again.

## How It Works

The Flask server:
1. Receives queries from the frontend
2. Determines if it's a question or food evaluation
3. Formats an appropriate prompt for Gemini
4. Calls the Gemini API
5. Returns the formatted response to the frontend

The Help.tsx file has been updated to connect to this Flask server instead of the original Express backend.