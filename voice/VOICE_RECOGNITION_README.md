# Voice Recognition and Manual Food Logging

## Feature Overview

The Health-o-meter Buddy app provides two convenient ways to log food consumption:

1. **Manual Food Name Input** - Users can type custom food names directly
2. **Voice Recognition** - Users can speak their meal entries using natural language

## Voice Recognition Features

- Click the microphone button to start voice recognition
- Say phrases like "I ate oatmeal for breakfast" or "I had pizza for dinner"
- The system automatically:
  - Extracts the food name
  - Detects the meal time (morning, afternoon, evening)
  - Logs the entry to the appropriate time slot

## Natural Language Processing

The voice recognition system understands phrases like:
- "I ate eggs and toast for breakfast"
- "I had chicken salad for lunch"
- "I consumed rice and curry for dinner"
- "I had a sandwich in the afternoon"

## Technical Implementation

### Components and Architecture

1. **VoiceRecognition Component (`VoiceRecognition.tsx`)**
   - Self-contained, reusable React component
   - Handles speech recognition lifecycle
   - Manages microphone permissions
   - Provides visual and toast feedback
   - Processes recognized speech into structured data

2. **Browser Compatibility (`browser-checks.ts`)**
   - Feature detection for Speech Recognition API
   - Cross-browser compatibility utilities
   - Microphone permission management
   - Device and platform detection

3. **Natural Language Processing (`meal-processing.ts`)**
   - Extracts food names from natural language input
   - Identifies meal timing indicators
   - Normalizes and cleans food name text

### Key Technical Features

- **Browser Support Detection**: Automatically detects if the browser supports the Web Speech API
- **Permission Management**: Handles microphone permission requests and states
- **Real-time Feedback**: Visual indicators during listening state
- **Error Handling**: Graceful degradation and helpful error messages
- **Mobile Support**: Optimizations for mobile browsers (with some limitations)

### Web Speech API Implementation

```typescript
// Example implementation using Web Speech API
const recognition = new (window.SpeechRecognition || 
                         window.webkitSpeechRecognition)();

recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Process the transcript...
};
```

## Usage Instructions

### For Users

1. **Voice Input**
   - Click the microphone icon
   - Allow microphone access when prompted
   - Speak clearly: "I had [food] for [meal time]"
   - The system will process and log your entry

2. **Manual Input**
   - Type the food name in the input field
   - Select the meal time (morning, afternoon, evening)
   - Click the + button to log your meal

### For Developers

The VoiceRecognition component accepts these props:

```typescript
interface VoiceRecognitionProps {
  onResult: (result: RecognitionResult) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled?: boolean;
}

interface RecognitionResult {
  transcript: string;
  mealType: 'morning' | 'afternoon' | 'evening' | null;
}
```

## Troubleshooting

### Common Issues

1. **Microphone Not Working**
   - Check browser permissions (look for microphone icon in address bar)
   - Try refreshing the page
   - Ensure no other app is using the microphone

2. **Recognition Not Accurate**
   - Speak clearly and at a moderate pace
   - Reduce background noise
   - Use simple, direct phrases

3. **Network Error Message**
   - This typically occurs when the Web Speech API cannot connect to its servers
   - Check if your internet connection is working
   - Disable any VPN or proxy services that might block the connection
   - Try using a different browser (Chrome or Edge recommended)
   - If on a corporate network, check if WebSockets or speech services are blocked

4. **Feature Not Available**
   - Try using Chrome or Edge browsers for best compatibility
   - Update your browser to the latest version
   - On mobile, try using Chrome

### Advanced Troubleshooting

If voice recognition is consistently failing with network errors:

1. **Check Browser Console**: Open developer tools (F12) and look for error messages
2. **Verify Connection**: Test on a different network (switch from WiFi to mobile data)
3. **Browser Settings**: Check that JavaScript and WebRTC are enabled
4. **Try Alternative Input**: Use the manual text input when voice recognition is unavailable
5. **Clear Cache**: Clear browser cache and cookies, then restart the browser

## Browser Compatibility

- ✅ **Google Chrome** - Full support
- ✅ **Microsoft Edge** - Full support
- ⚠️ **Safari** - Partial support
- ⚠️ **Firefox** - Limited support
- ❌ **Internet Explorer** - Not supported

Mobile browsers have more limited speech recognition capabilities compared to desktop browsers.