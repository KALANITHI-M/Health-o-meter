import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { processMealInput, normalizeFoodName } from '@/lib/meal-processing';
import { 
  isSpeechRecognitionSupported,
  getSpeechRecognitionAPI,
  requestMicrophonePermission,
  getBrowserInfo,
  getRecommendedBrowser,
  isMobileDevice
} from '@/lib/utils/browser-checks';

// Add type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;
    msSpeechRecognition: any;
  }
}

interface RecognitionResult {
  transcript: string;
  mealType: 'morning' | 'afternoon' | 'evening' | null;
}

interface VoiceRecognitionProps {
  onResult: (result: RecognitionResult) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled?: boolean;
}

export function VoiceRecognition({ 
  onResult, 
  isListening, 
  setIsListening,
  disabled = false
}: VoiceRecognitionProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const recognitionRef = useRef<any>(null);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean | null>(null);
  const recognitionStartAttemptRef = useRef<boolean>(false);

  // Check browser compatibility on mount
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setRecognitionSupported(supported);
    
    if (!supported) {
      const browserInfo = getBrowserInfo();
      const recommendedBrowser = getRecommendedBrowser();
      setErrorMsg(`Speech recognition not supported in ${browserInfo.name}. Try ${recommendedBrowser} instead.`);
      console.error("Speech Recognition API not available in this browser");
      return;
    }
    
    // Check microphone permission status
    const checkPermission = async () => {
      try {
        const permState = await requestMicrophonePermission();
        setPermissionState(permState);
        
        if (permState === 'denied') {
          setErrorMsg("Microphone access was denied. Please enable it in browser settings.");
        }
      } catch (err) {
        console.error("Permission check error:", err);
        setErrorMsg("Error checking microphone permissions");
      }
    };
    
    checkPermission();
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up speech recognition:", e);
        }
      }
    };
  }, []);

  // Setup recognition engine
  const setupRecognition = () => {
    if (recognitionRef.current) return true; // Already set up
    
    try {
      const SpeechRecognitionAPI = getSpeechRecognitionAPI();
      
      if (!SpeechRecognitionAPI) {
        throw new Error("Speech Recognition API not available");
      }
      
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Setup event handlers
      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        recognitionStartAttemptRef.current = true;
        setIsProcessing(true);
        setErrorMsg(null);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          const isFinal = event.results[0].isFinal;
          
          if (isFinal) {
            console.log('Final voice transcript:', transcript);
            processTranscript(transcript);
          } else {
            // Show interim results for better feedback
            console.log('Interim transcript:', transcript);
          }
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event);
        
        // Handle specific errors
        let errorMessage = "Error recognizing speech";
        if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please enable in browser settings.";
          setPermissionState('denied');
        } else if (event.error === 'network') {
          errorMessage = "Speech recognition network error. Try disabling VPN/proxy or try another browser.";
          console.warn("Web Speech API network error - this is often due to internet connectivity issues or firewall settings");
        } else if (event.error === 'no-speech') {
          // This is common and not really an error, don't set errorMsg
          toast.warning("No speech detected. Please try again and speak clearly.", {
            duration: 3000,
            id: "no-speech-warning"
          });
          setIsListening(false);
          setIsProcessing(false);
          return;
        } else if (event.error === 'aborted') {
          // This happens when we manually stop, not an error
          setIsListening(false);
          setIsProcessing(false);
          return;
        }
        
        // Only show toast for actual errors
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast.error(errorMessage, {
            duration: 4000
          });
          setErrorMsg(errorMessage);
        }
        
        setIsListening(false);
        setIsProcessing(false);
      };
      
      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsProcessing(false);
        setIsListening(false);
        
        // Handle the case where recognition ends without ever starting
        if (!recognitionStartAttemptRef.current) {
          console.error("Recognition ended without properly starting");
          setErrorMsg("Failed to start speech recognition. Please try again.");
        }
        
        // Reset the start attempt flag
        recognitionStartAttemptRef.current = false;
      };
      
      return true;
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error);
      setErrorMsg("Failed to initialize speech recognition");
      setIsListening(false);
      return false;
    }
  };
  
  // Handle start/stop listening
  useEffect(() => {
    if (isListening) {
      if (!recognitionSupported) {
        setIsListening(false);
        return;
      }
      
      if (permissionState === 'denied') {
        setErrorMsg("Microphone access denied. Please enable in browser settings.");
        setIsListening(false);
        return;
      }
      
      const isSetup = setupRecognition();
      if (!isSetup) {
        setIsListening(false);
        return;
      }
      
      try {
        recognitionStartAttemptRef.current = false; // Reset flag before starting
        
        // Pre-connection check to help diagnose network issues
        const isOnline = navigator.onLine;
        if (!isOnline) {
          throw new Error("Browser is offline. Check your internet connection.");
        }
        
        recognitionRef.current.start();
        
        toast.info("🎤 Listening... Tell me what you ate", {
          duration: 5000,
          id: "voice-listening" // Prevent duplicate toasts
        });
      } catch (error) {
        console.error("Failed to start recognition:", error);
        setIsListening(false);
        
        // Error message handling
        let errorMsg = "Failed to start speech recognition";
        
        // Check if it's a specific error we can provide better feedback for
        if (error instanceof Error) {
          if (error.message.includes("offline") || error.message.includes("network")) {
            errorMsg = "Network error: Please check your internet connection and try again.";
          }
        }
        
        // Mobile-specific message
        if (isMobileDevice()) {
          setErrorMsg(`${errorMsg}. Voice recognition may be limited on mobile browsers. Try Chrome on desktop for best results.`);
        } else {
          setErrorMsg(errorMsg);
        }
        
        // Show toast with guidance
        toast.error(`${errorMsg} Try refreshing the page or switching browsers.`, {
          duration: 5000,
          id: "recognition-start-error"
        });
      }
    } else if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Failed to stop recognition:", error);
      }
    }
  }, [isListening, recognitionSupported, permissionState]);

  const processTranscript = (transcript: string) => {
    if (!transcript || transcript.trim() === '') {
      toast.warning("I didn't catch that. Please try again and speak clearly.", {
        duration: 3000,
        id: "empty-transcript"
      });
      return;
    }
    
    try {
      // Use the meal processing utilities to extract structured information
      const processedMeal = processMealInput(transcript);
      
      // Normalize the food name
      const cleanedFoodName = normalizeFoodName(processedMeal.foodName);
      
      // Log what was recognized for debugging
      console.log('Processed meal:', {
        original: transcript,
        foodName: cleanedFoodName,
        mealType: processedMeal.mealType,
        timeIndicator: processedMeal.timeIndicator
      });
      
      if (!cleanedFoodName || cleanedFoodName.trim() === '') {
        toast.warning("Could not identify a food item. Please try again or type manually.", {
          duration: 3000,
          id: "no-food-detected"
        });
        return;
      }
      
      // Show success message with meal time if available
      const mealTypeText = processedMeal.mealType ? ` for ${processedMeal.mealType}` : '';
      toast.success(`🎙️ Recognized: "${cleanedFoodName}"${mealTypeText}`, {
        duration: 2000,
        id: "recognition-success"
      });
        
      // Pass the processed result to the parent
      onResult({ 
        transcript: cleanedFoodName,
        mealType: processedMeal.mealType
      });
    } catch (error) {
      console.error("Error processing transcript:", error);
      toast.error("Error processing speech input");
    }
  };

  const handleToggleListening = () => {
    if (permissionState === 'denied') {
      toast.error("Microphone access was denied. Please enable it in your browser settings.", {
        duration: 5000,
        id: "mic-denied-toast"
      });
      return;
    }
    
    // Reset error when trying again
    if (errorMsg) {
      setErrorMsg(null);
    }
    
    setIsListening(!isListening);
  };

  // Show appropriate button state
  const renderButtonContent = () => {
    if (isProcessing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (errorMsg) {
      return <AlertCircle className="h-4 w-4" />;
    }
    
    return isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />;
  };

  const getTooltip = () => {
    if (errorMsg) return errorMsg;
    if (isListening) return "Stop listening";
    if (permissionState === 'denied') return "Microphone access denied";
    return "Use voice to log your meal";
  };

  return (
    <div className="relative">
      {errorMsg && (
        <div className="absolute bottom-full mb-1 right-0 bg-destructive text-destructive-foreground text-xs p-1 rounded whitespace-nowrap z-50">
          {errorMsg}
        </div>
      )}
      <Button
        type="button"
        variant={isListening ? "destructive" : errorMsg ? "secondary" : "outline"}
        size="icon"
        onClick={handleToggleListening}
        disabled={disabled || isProcessing || (permissionState === 'denied' && !errorMsg)}
        className="relative"
        title={getTooltip()}
      >
        {renderButtonContent()}
        
        {isListening && !isProcessing && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>
    </div>
  );
}