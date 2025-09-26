import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

# Configure the Gemini model
try:
    genai.configure(api_key=api_key)
    # Try different model names in order of preference
    model_names = [
        "gemini-pro",
        "gemini-1.0-pro", 
        "models/gemini-pro",
        "gemini-1.5-flash"
    ]
    
    model = None
    for model_name in model_names:
        try:
            model = genai.GenerativeModel('gemini-2.5-pro')
            # Test the model with a simple query
            test_response = model.generate_content("Hello")
            print(f"Successfully configured Gemini model: {model_name}")
            break
        except Exception as model_error:
            print(f"Model {model_name} failed: {model_error}")
            continue
    
    if model is None:
        print("ERROR: No working Gemini model found")
        exit(1)
        
except Exception as e:
    print(f"ERROR configuring Gemini API: {e}")
    exit(1)

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Gemini AI Flask Server is running"})

@app.route('/test-ai', methods=['GET'])
def test_ai():
    """Test endpoint to verify Gemini AI is working"""
    try:
        test_response = model.generate_content("Say 'Hello, AI is working!' in exactly 5 words.")
        # Safely extract text
        if test_response and test_response.candidates:
            ai_text = test_response.candidates[0].content.parts[0].text
        else:
            ai_text = "No response"
        return jsonify({
            "status": "success",
            "message": "AI is working",
            "test_response": ai_text
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"AI test failed: {str(e)}"
        }), 500

@app.route('/api/ai/health-advice', methods=['OPTIONS'])
def handle_preflight():
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    return '', 200, headers

@app.route('/api/ai/health-advice', methods=['POST'])
def health_advice():
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    try:
        # Check if request has JSON data
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400, headers
            
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400, headers
            
        if 'query' not in data:
            return jsonify({"error": "Missing query parameter"}), 400, headers

        query = data['query']
        request_type = data.get('type', 'general')
        print(f"Received {request_type} query: {query[:100]}...")

        # Create appropriate prompts based on request type
        if request_type == 'suggestions':
            prompt = f"""As a health AI assistant, provide 4 brief health suggestions based on this context: {query}

Format your response exactly as:
NUTRITION: [nutrition tip in 15 words or less]
HYDRATION: [hydration tip in 15 words or less]  
EXERCISE: [exercise tip in 15 words or less]
GENERAL: [wellness tip in 15 words or less]"""

        elif request_type == 'health_analysis':
            prompt = f"""Analyze this health data and provide alerts if needed: {query}

If there are health concerns, respond with:
ALERT_TYPE|CATEGORY|SEVERITY|TITLE|MESSAGE|RECOMMENDATIONS

If everything looks good, respond exactly with: NO_ALERTS_NEEDED"""

        else:
            # Regular health question
            prompt = f"""Answer this health question briefly: {query}
Provide practical advice in 1-2 sentences with an appropriate emoji at the start.
Keep under 100 words."""

        print(f"Sending prompt to Gemini...")

        # Generate response with error handling
        try:
            response = model.generate_content(prompt)
            
            if not response:
                raise Exception("Empty response from model")
                
            if not response.candidates:
                raise Exception("No candidates in response")
                
            if not response.candidates[0].content.parts:
                raise Exception("No content parts in response")

            ai_response = response.candidates[0].content.parts[0].text
            print(f"Gemini response received: {len(ai_response)} characters")
            
            return jsonify({"response": ai_response}), 200, headers

        except Exception as api_error:
            error_str = str(api_error).lower()
            print(f"Gemini API error: {api_error}")

            # Provide fallback responses based on request type
            if request_type == 'suggestions':
                fallback_response = """NUTRITION: Eat balanced meals with fruits and vegetables
HYDRATION: Drink 8 glasses of water daily
EXERCISE: Take a 10-minute walk or do light stretching
GENERAL: Get adequate sleep and manage stress levels"""
                return jsonify({"response": fallback_response, "fallback": True}), 200, headers
                
            elif request_type == 'health_analysis':
                return jsonify({"response": "NO_ALERTS_NEEDED", "fallback": True}), 200, headers
                
            else:
                fallback_response = "🍎 Focus on eating whole foods, staying hydrated, and getting regular exercise for optimal health."
                return jsonify({"response": fallback_response, "fallback": True}), 200, headers

    except Exception as e:
        error_msg = str(e)
        print(f"ERROR processing request: {error_msg}")
        return jsonify({"error": f"Server error: {error_msg}"}), 500, headers

if __name__ == '__main__':
    port = 5050
    print(f"Starting Flask server on port {port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"AI test: http://localhost:{port}/test-ai")
    app.run(debug=True, port=port, host='127.0.0.1')