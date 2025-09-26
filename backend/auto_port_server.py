import os
import sys
import socket
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Find an available port
def find_available_port(start_port=5050, max_attempts=10):
    for port_offset in range(max_attempts):
        port = start_port + port_offset
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                logger.info(f"Found available port: {port}")
                return port
            except socket.error:
                logger.warning(f"Port {port} is already in use, trying next port...")
    
    # If we get here, we couldn't find an available port
    logger.error(f"Could not find an available port after {max_attempts} attempts")
    return None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get API key from environment variable
API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyAjSNnvpAdGWc8ININNUNb_b9H36AeURD0')

# Configure the Gemini API
genai.configure(api_key=API_KEY)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Gemini AI Flask Server is running"})

@app.route('/api/ai/health-advice', methods=['POST'])
def health_advice():
    try:
        data = request.get_json()
        logger.info(f"Received request: {data}")
        
        if not data or 'query' not in data:
            return jsonify({"error": "Query parameter is required"}), 400

        query = data['query']
        logger.info(f"Processing query: {query}")
        
        # Check if query is a question or a food item
        is_question = ('?' in query or 
                       any(query.lower().startswith(w) for w in ['how', 'what', 'when', 'why', 'where', 'can', 'should', 'is', 'are', 'do', 'does']))
        
        # Prepare the prompt based on query type
        if is_question:
            prompt = f"""You are a friendly health coach who gives helpful, science-based advice. 
            Please answer this health question concisely in 2-3 sentences. Include one emoji in your response.
            
            Health Question: {query}"""
        else:
            prompt = f"""You are a nutrition expert who evaluates foods. For this food item, provide:
            1. A brief health rating (healthy, moderate, or less healthy)
            2. 1-2 specific nutrition facts about this food
            3. A quick tip for how to make it healthier or incorporate it into a balanced diet
            
            Keep your response under 3 sentences total and include one relevant emoji.
            
            Food to evaluate: {query}"""

        logger.info("Connecting to Gemini API...")
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Generate content
        response = model.generate_content(prompt)
        text = response.text
        
        logger.info(f"Gemini response received: {text[:50]}...")
        return jsonify({"text": text})
    
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Find an available port
    port = find_available_port(5050, 10)
    
    if port is None:
        logger.error("Could not find an available port. Exiting.")
        sys.exit(1)
    
    # Write port to a file for frontend to read
    with open(os.path.join(os.path.dirname(__file__), 'ai_server_port.txt'), 'w') as f:
        f.write(str(port))
    
    # Print info for user
    print("\n" + "="*80)
    print(f"GEMINI AI SERVER RUNNING ON PORT {port}")
    print(f"API URL: http://localhost:{port}/api/ai/health-advice")
    print(f"Health Check: http://localhost:{port}/health")
    print("="*80 + "\n")
    
    # Start the server
    logger.info(f"Starting Flask server on port {port}")
    app.run(debug=True, port=port, host='0.0.0.0')