// Smart API Configuration for Gemini AI
// This file automatically detects and uses the correct port for the Gemini AI Flask server

import axios from 'axios';

// Default ports to try (in order of preference)
const API_PORTS = [5050, 5051, 5052, 5053, 5054, 5055];
const EXPRESS_API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Function to detect which port the AI server is running on
const detectAIServerPort = async (): Promise<string> => {
  // Just use a fixed port for now - no detection
  console.log('Using fixed port 5050 for Flask server');
  return 'http://localhost:5050';
  
  /* Disabled auto-detection due to CORS issues
  // Try to read from the port file first (most reliable)
  try {
    const response = await fetch('/ai_server_port.txt');
    if (response.ok) {
      const port = await response.text();
      console.log(`Found AI server port from file: ${port}`);
      return `http://localhost:${port}`;
    }
  } catch (error) {
    console.log('Could not read port file, trying health checks');
  }

  // Try health checks on each potential port
  for (const port of API_PORTS) {
    try {
      console.log(`Checking if AI server is running on port ${port}...`);
      const response = await axios.get(`http://localhost:${port}/health`, { timeout: 500 });
      if (response.data?.status === 'ok') {
        console.log(`AI server detected on port ${port}`);
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // Port not responding, try next one
    }
  }

  // If all else fails, return the default
  console.log('Could not detect AI server, using default port 5050');
  return 'http://localhost:5050';
  */
};

// Public API interface
let aiBaseUrl: string | null = null;

export const getAIBaseUrl = async (): Promise<string> => {
  if (!aiBaseUrl) {
    aiBaseUrl = await detectAIServerPort();
  }
  return aiBaseUrl;
};

export const getHealthAdvice = async (query: string): Promise<string> => {
  try {
    const baseUrl = await getAIBaseUrl();
    const response = await axios.post(
      `${baseUrl}/api/ai/health-advice`,
      { query },
      { timeout: 10000 }
    );
    
    if (response.data && response.data.text) {
      return response.data.text;
    } else {
      throw new Error('Invalid response from AI server');
    }
  } catch (error) {
    console.error('AI API error:', error);
    throw error;
  }
};