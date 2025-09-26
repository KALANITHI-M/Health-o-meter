import os
import json
import socket
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

# Configure the Gemini model (simple configuration)
try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini API configured successfully")
except Exception as e:
    print(f"ERROR configuring Gemini API: {e}")
    exit(1)

def find_available_port(start_port=5050):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + 10):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return start_port  # fallback

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Gemini AI Flask Server is running"})

@app.route('/test-ai', methods=['GET'])
def test_ai():
    """Test endpoint to verify Gemini AI is working"""
    try:
        test_response = model.generate_content("Say 'Hello, AI is working!' in exactly 5 words.")
        return jsonify({
            "status": "success", 
            "message": "AI is working",
            "response": test_response.text
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"AI test failed: {str(e)}"
        }), 500

@app.route('/api/ai/health-advice', methods=['POST'])
def health_advice():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "Missing query parameter"}), 400

        query = data['query']
        request_type = data.get('type', 'general')
        print(f"Received {request_type} query: {query[:100]}...")
        
        # Simple prompt generation based on type
        if request_type == 'suggestions':
            prompt = f"""Based on this health context, provide 4 personalized suggestions: {query}

Format your response exactly like this:
NUTRITION: [specific nutrition tip]
HYDRATION: [hydration reminder]  
EXERCISE: [exercise suggestion]
GENERAL: [general wellness tip]

Keep each suggestion under 50 words and actionable."""

        elif request_type == 'health_analysis':
            prompt = f"""Analyze this health data for any concerning patterns: {query}

If there are actual health concerns, format as:
ALERT_TYPE|CATEGORY|SEVERITY|TITLE|MESSAGE|RECOMMENDATIONS

If no concerns, respond exactly: NO_ALERTS_NEEDED"""

        else:
            # Regular health question
            prompt = f"As a health assistant, answer this briefly: {query}"

        print(f"Sending prompt to Gemini...")
        
        # Generate AI response
        response = model.generate_content(prompt)
        ai_response = response.text.strip()
        
        print(f"Gemini response: {ai_response[:100]}...")
        
        return jsonify({
            "response": ai_response,
            "type": request_type,
            "query": query
        })

    except Exception as e:
        print(f"Error: {e}")
        error_message = str(e)
        
        # Provide appropriate fallbacks
        if request_type == 'suggestions':
            fallback = """NUTRITION: Eat colorful fruits and vegetables daily
HYDRATION: Drink water regularly throughout the day
EXERCISE: Take short walks or stretch breaks
GENERAL: Get 7-8 hours of quality sleep"""
        elif request_type == 'health_analysis':
            fallback = "NO_ALERTS_NEEDED"
        else:
            fallback = "🟢 Stay healthy and consult healthcare professionals for specific concerns."
            
        return jsonify({
            "response": fallback,
            "type": request_type,
            "query": query,
            "fallback": True,
            "error": error_message
        })

if __name__ == '__main__':
    port = find_available_port()
    print(f"Starting Flask server on port {port}")
    
    # Write port to file for frontend to read
    with open('ai_server_port.txt', 'w') as f:
        f.write(str(port))
    
    # Also write to public directory for frontend access
    try:
        with open('../public/ai_server_port.txt', 'w') as f:
            f.write(str(port))
    except:
        print("Could not write to public directory - that's okay")
    
    app.run(debug=True, port=port)