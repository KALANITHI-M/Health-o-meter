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

print(f"API Key loaded: {api_key[:10]}...{api_key[-5:] if len(api_key) > 15 else api_key}")
if len(api_key) < 30:
    print("WARNING: API key seems too short. Typical Gemini API keys are longer.")
    print("Please check your API key at: https://makersuite.google.com/app/apikey")

# Configure the Gemini model
try:
    genai.configure(api_key=api_key)
    # Try different model names - gemini-1.5-flash might be deprecated
    model_names = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-002', 
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-1.0-pro'
    ]
    
    model = None
    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            print(f"Successfully configured Gemini model: {model_name}")
            break
        except Exception as model_error:
            print(f"Failed to load model {model_name}: {model_error}")
            continue
    
    if model is None:
        raise Exception("No working Gemini model found")
        
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
        return jsonify({
            "status": "success", 
            "message": "AI is working",
            "test_response": test_response.text
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
    try:
        # Add CORS headers for development
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "Missing query parameter"}), 400

        query = data['query']
        request_type = data.get('type', 'general')
        print(f"Received {request_type} query: {query[:100]}...")
        
        # Handle different types of requests
        if request_type == 'suggestions':
            prompt = f"""As a health AI assistant, analyze the user context and provide personalized suggestions.

{query}

Respond in exactly this format:
NUTRITION: [specific nutrition tip based on the context]
HYDRATION: [hydration reminder appropriate for the time/situation]  
EXERCISE: [exercise suggestion suitable for current conditions]
GENERAL: [general wellness tip relevant to the user]

Keep each suggestion under 50 words and make them actionable."""

        elif request_type == 'health_analysis':
            prompt = f"""As a health AI analyst, carefully analyze the provided health data and identify any concerning patterns or positive behaviors.

{query}

Based on the analysis, provide specific health alerts ONLY if there are actual concerns. Format your response as:

ALERT_TYPE|CATEGORY|SEVERITY|TITLE|MESSAGE|RECOMMENDATIONS

Where:
- ALERT_TYPE: warning, danger, info, or success
- CATEGORY: nutrition, hydration, activity, or general
- SEVERITY: low, medium, high, or critical
- TITLE: Brief alert title (max 30 chars)
- MESSAGE: Clear explanation (max 80 chars)  
- RECOMMENDATIONS: 2-3 specific actions separated by semicolons

If the health patterns look good with no significant concerns, respond with exactly: "NO_ALERTS_NEEDED"

Only create alerts for actual health issues that need attention."""

        else:
            # Regular health question
            if any(keyword in query.lower() for keyword in ["is", "are", "eat", "food", "meal", "breakfast", "lunch", "dinner"]):
                prompt = f"""As a nutrition expert, evaluate this food/meal: "{query}"
                            Provide a brief assessment (1-2 sentences) of its nutritional value.
                            Include an emoji at the beginning of your response to indicate if it's:
                            🟢 (healthy), 🟡 (moderate), or 🔴 (less healthy).
                            Keep your response under 150 characters."""
            else:
                prompt = f"""As a health assistant, answer this health question briefly: "{query}"
                            Provide practical, evidence-based advice in 1-2 sentences.
                            Include an emoji at the beginning that represents your answer.
                            Keep your response under 150 characters."""

        print(f"Sending prompt to Gemini: {prompt[:200]}...")
        
        # Generate response from Gemini
        try:
            print(f"Generating content with model...")
            response = model.generate_content(prompt)
            
            if not response or not response.text:
                return jsonify({"error": "Empty response from AI model"}), 500, headers
                
            ai_response = response.text
            print(f"Gemini response: {ai_response[:200]}...")
            return jsonify({"response": ai_response}), 200, headers
            
        except Exception as api_error:
            error_str = str(api_error)
            print(f"Gemini API error: {error_str}")
            
            # Check for specific error types
            if "404" in error_str and "model" in error_str.lower():
                return jsonify({"error": "AI model not found. Please check model configuration."}), 500, headers
            elif "403" in error_str or "permission" in error_str.lower():
                return jsonify({"error": "API key permission denied. Please check your API key."}), 403, headers
            elif "quota exceeded" in error_str.lower() or "429" in error_str:
                return jsonify({"error": "API quota exceeded"}), 429, headers
            elif "invalid api key" in error_str.lower():
                return jsonify({"error": "Invalid API key. Please check your GEMINI_API_KEY."}), 401, headers
            else:
                return jsonify({"error": f"AI API error: {error_str}"}), 500, headers
    
    except Exception as e:
        print(f"ERROR processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500, headers

if __name__ == '__main__':
    port = 5050
    print(f"Starting Flask server on port {port}")
    app.run(debug=True, port=port)