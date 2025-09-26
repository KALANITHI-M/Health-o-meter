// Browser compatibility utilities for speech recognition

/**
 * Check if browser supports Speech Recognition API
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
}

/**
 * Get the appropriate Speech Recognition API constructor
 */
export function getSpeechRecognitionAPI() {
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition
  );
}

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'unknown';
    }

    // Check if permission API is supported
    if (navigator.permissions && navigator.permissions.query) {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permissionStatus.state as 'granted' | 'denied' | 'prompt';
    }

    // Fallback: try to get user media to trigger permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    } catch (error) {
      return 'denied';
    }
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return 'unknown';
  }
}

/**
 * Get browser information
 */
export function getBrowserInfo(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return { name: 'Chrome', version: match ? match[1] : 'unknown' };
  }
  
  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return { name: 'Firefox', version: match ? match[1] : 'unknown' };
  }
  
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return { name: 'Safari', version: match ? match[1] : 'unknown' };
  }
  
  if (userAgent.includes('Edge')) {
    const match = userAgent.match(/Edge\/(\d+)/);
    return { name: 'Edge', version: match ? match[1] : 'unknown' };
  }
  
  return { name: 'Unknown', version: 'unknown' };
}

/**
 * Get recommended browser for speech recognition
 */
export function getRecommendedBrowser(): string {
  if (isMobileDevice()) {
    return 'Chrome Mobile';
  }
  return 'Chrome or Edge';
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Add type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}