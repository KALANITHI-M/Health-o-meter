// Utility to get the current AI server port
export const getAIServerPort = async (): Promise<number> => {
  try {
    // Try to read port from the port file
    const response = await fetch('/ai_server_port.txt');
    if (response.ok) {
      const portText = await response.text();
      const port = parseInt(portText.trim());
      if (!isNaN(port)) {
        return port;
      }
    }
  } catch (error) {
    console.log('Could not read port file, using default');
  }
  
  // Fallback to default port
  return 5050;
};

export const getAIServerURL = async (): Promise<string> => {
  const port = await getAIServerPort();
  return `http://localhost:${port}`;
};