import requests
import json

def test_ai_server():
    """Test the corrected AI server"""
    
    # Try different ports
    ports = [5050, 5051, 5052]
    
    for port in ports:
        try:
            print(f"\n=== Testing port {port} ===")
            
            # Test health endpoint
            health_url = f"http://localhost:{port}/health"
            health_response = requests.get(health_url, timeout=5)
            print(f"Health check: {health_response.status_code} - {health_response.text}")
            
            # Test AI test endpoint
            test_url = f"http://localhost:{port}/test-ai"
            test_response = requests.get(test_url, timeout=10)
            print(f"AI test: {test_response.status_code} - {test_response.text}")
            
            # Test AI health advice endpoint
            advice_url = f"http://localhost:{port}/api/ai/health-advice"
            test_data = {
                "query": "Is eating an apple good for health?",
                "type": "general"
            }
            
            advice_response = requests.post(
                advice_url, 
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            print(f"AI advice: {advice_response.status_code}")
            if advice_response.status_code == 200:
                response_data = advice_response.json()
                print(f"Response: {response_data}")
                print(f"✅ Server working on port {port}!")
                return port
            else:
                print(f"Error response: {advice_response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"Connection failed on port {port}: {e}")
    
    print("❌ No working server found")
    return None

if __name__ == "__main__":
    working_port = test_ai_server()
    if working_port:
        print(f"\n🎉 Found working AI server on port {working_port}")
    else:
        print("\n😞 No working AI server found")