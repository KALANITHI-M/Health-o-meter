import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, RotateCcw, Check, AlertTriangle, X, Video, Square } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  analysis: string;
  verdict: string;
  suggestions: string[];
}

export const MealAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Use environment variable for API key (fallback for demo)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBTP_Y6J5rqxc18iOcHb7Q8iKUFCGnDG_k";

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        toast.error("File too large! Please select an image under 10MB 📁");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
        setError(null);
        toast.success("📸 Image uploaded! Ready for analysis ✨");
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file.");
      toast.error("⚠️ Please select a valid image file (PNG, JPG, GIF)");
    }
  };

  const analyzeMeal = async (retryCount = 0) => {
    if (!selectedImage) return;

    const maxRetries = 3;
    const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
    
    setIsAnalyzing(true);
    setError(null);

    const base64Image = selectedImage.split(',')[1];
    const mimeType = selectedImage.split(';')[0].split(':')[1];
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const prompt = `Analyze the food in this image briefly. Give a very short analysis (max 2 sentences). 
    Provide a one-line verdict (e.g., 'Balanced', 'Too high in carbs', 'Lacks protein'). 
    Suggest 2–3 short, actionable improvements (each under 10 words). 
    Focus on nutritional balance, portion sizes, and missing food groups.
    Respond in JSON only.`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Image } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            analysis: { type: "STRING" },
            verdict: { type: "STRING" },
            suggestions: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["analysis", "verdict", "suggestions"]
        }
      }
    };

    try {
      toast.loading("🤖 AI is analyzing your meal...", { id: "analysis" });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.error?.message || `HTTP error: ${response.status}`);
      }

      const candidate = responseData.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        const parsedResult = JSON.parse(candidate.content.parts[0].text);
        setResult(parsedResult);
        toast.success("🎉 Analysis complete! Check your results below", { id: "analysis" });
      } else {
        throw new Error("Invalid response structure.");
      }
    } catch (error: any) {
      console.error("Error during analysis:", error);
      if (retryCount < maxRetries) {
        toast.loading(`🔄 Retrying analysis... (${retryCount + 1}/${maxRetries})`, { id: "analysis" });
        setTimeout(() => analyzeMeal(retryCount + 1), delay);
      } else {
        setError(error.message || "Failed to analyze the meal. Please try again.");
        toast.error("❌ Analysis failed. Please try again!", { id: "analysis" });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setShowCameraCapture(false);
    // Stop camera stream if active
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    // Reset file input
    const fileInput = document.getElementById('meal-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast.success("🔄 Ready for a new meal analysis!");
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      setShowCameraCapture(true);
      setError(null);
      toast.success("📹 Camera activated! Position your meal and tap capture");
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError("Unable to access camera. Please check permissions or use file upload.");
      toast.error("❌ Camera access denied. Please allow camera permissions or upload a file.");
    }
  };

  const captureImage = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setSelectedImage(imageData);
      setShowCameraCapture(false);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      toast.success("📸 Photo captured! Ready for analysis ✨");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraCapture(false);
    toast.success("📹 Camera stopped");
  };

  const getVerdictStyle = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes('balanced') || lower.includes('good') || lower.includes('healthy')) {
      return {
        variant: 'default' as const,
        icon: <Check className="w-4 h-4" />,
        className: 'bg-green-100 text-green-800 border-green-200',
        emoji: '✅'
      };
    } else if (lower.includes('needs') || lower.includes('lacks') || lower.includes('too high') || lower.includes('moderate')) {
      return {
        variant: 'secondary' as const,
        icon: <AlertTriangle className="w-4 h-4" />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        emoji: '⚠️'
      };
    } else {
      return {
        variant: 'destructive' as const,
        icon: <X className="w-4 h-4" />,
        className: 'bg-red-100 text-red-800 border-red-200',
        emoji: '❌'
      };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <Card className="border-0 bg-gradient-health text-white">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-white">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl">Meal Balance Analyzer</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white sm:ml-2 w-fit">
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-white/90 text-sm sm:text-base">
            📸 Upload a photo of your meal to get instant AI-powered nutritional analysis!
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {!selectedImage && !showCameraCapture ? (
            <div className="space-y-4">
              {/* Upload Option */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-primary/50 transition-colors hover:bg-primary/5">
                <input
                  type="file"
                  id="meal-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label htmlFor="meal-image-upload" className="cursor-pointer flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-health rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div>
                    <span className="text-primary font-semibold text-base sm:text-lg">📱 Upload from gallery</span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 px-2">
                      PNG, JPG, GIF up to 10MB • Best results with clear, well-lit photos 📸
                    </p>
                  </div>
                </label>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Camera Capture Option */}
              <div className="text-center">
                <Button 
                  onClick={startCamera}
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  📷 Take Photo with Camera
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Capture your meal directly with your device camera
                </p>
              </div>
            </div>
          ) : showCameraCapture ? (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-md sm:max-w-lg">
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  muted
                  ref={(video) => {
                    if (video && stream) {
                      video.srcObject = stream;
                    }
                  }}
                  className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-xl shadow-lg border bg-black"
                />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Recording
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={captureImage}
                  className="flex-1 bg-gradient-health hover:bg-gradient-health/90"
                  size="lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  📸 Capture Photo
                </Button>
                <Button 
                  onClick={stopCamera}
                  variant="outline" 
                  size="lg"
                  className="sm:w-auto"
                >
                  <Square className="w-4 h-4 mr-2" />
                  ❌ Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-md sm:max-w-lg">
                <img
                  src={selectedImage}
                  alt="Selected meal"
                  className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-xl shadow-lg border"
                />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/70 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                  📸 Ready for analysis
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => analyzeMeal()} 
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-health hover:bg-gradient-health/90"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">🤖 Analyzing...</span>
                      <span className="sm:hidden">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">🔬 Analyze Meal</span>
                      <span className="sm:hidden">Analyze</span>
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetAnalyzer} size="lg" className="sm:w-auto">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">🔄 Reset</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mx-2 sm:mx-0">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <AlertDescription className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4 sm:space-y-6">
              <Card className={`${getVerdictStyle(result.verdict).className} border-2`}>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="text-xl sm:text-2xl">{getVerdictStyle(result.verdict).emoji}</span>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">Verdict</h3>
                      <p className="text-xs sm:text-sm opacity-80">AI Analysis Result</p>
                    </div>
                  </div>
                  <p className="font-medium text-sm sm:text-base">{result.verdict}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-blue-800 flex items-center gap-2 text-sm sm:text-base">
                      🔍 Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 p-4 sm:p-6">
                    <p className="text-blue-700 leading-relaxed text-sm sm:text-base">{result.analysis}</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-green-800 flex items-center gap-2 text-sm sm:text-base">
                      💡 Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 p-4 sm:p-6">
                    <ul className="space-y-2 sm:space-y-3">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-green-700 flex items-start gap-2 sm:gap-3">
                          <span className="text-green-500 font-bold text-base sm:text-lg mt-0.5">•</span>
                          <span className="leading-relaxed text-sm sm:text-base">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button 
                  onClick={resetAnalyzer}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto"
                  size="lg"
                >
                  📸 Analyze Another Meal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};