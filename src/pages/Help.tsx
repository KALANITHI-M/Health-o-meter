import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Battery, 
  Calendar, 
  Trophy, 
  User, 
  HelpCircle, 
  Sparkles,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Set a fixed API URL for the Gemini AI Flask server
const FLASK_API_URL = 'http://localhost:5050';
// Original API URL for non-AI endpoints
const EXPRESS_API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function Help() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [coachInput, setCoachInput] = useState("");
  const [coachOutput, setCoachOutput] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // Helper function to generate offline responses
  const getOfflineResponse = (query: string): string => {
    const text = query.toLowerCase();
    
    // Check if it's a food item or a question
    const isQuestion = text.includes("?") || 
      /^(how|what|when|why|where|can|should|is|are|do|does)/i.test(text);

    if (isQuestion) {
      // Handle questions based on keywords
      if (text.includes("water") || text.includes("hydration")) {
        return "💧 For optimal hydration, aim to drink about 8-10 cups (2-2.5 liters) of water daily. Your specific needs may vary based on activity level, climate, and body size.";
      } else if (text.includes("breakfast") || (text.includes("morning") && text.includes("food"))) {
        return "🍳 Great breakfast options include: whole grain toast with avocado and eggs, Greek yogurt with berries and nuts, overnight oats with fruit, or a vegetable and protein smoothie.";
      } else if (text.includes("energy") || text.includes("tired")) {
        return "⚡ To boost your energy naturally: 1) Stay hydrated, 2) Eat balanced meals with protein, 3) Get 7-9 hours of sleep, 4) Take short movement breaks, 5) Consider a B-vitamin complex if deficient.";
      } else if (text.includes("snack")) {
        return "🥜 Healthy snack ideas: Greek yogurt with berries, apple slices with nut butter, hummus with veggie sticks, mixed nuts, edamame, hard-boiled eggs, or a small smoothie.";
      } else {
        // Generic response
        return "That's a great health question! Based on general principles, focus on whole foods, stay hydrated, get regular activity, and prioritize sleep.";
      }
    } else {
      // Food evaluation logic
      const unhealthy = ["pizza","burger","fries","candy","soda","ice cream","cake","chips","donut","cookies"];
      if (unhealthy.some((u) => text.includes(u))) {
        return "⚠️ This food might drain your health battery. Consider a more nutrient-dense option like vegetables, lean proteins, or whole grains.";
      } else if (["fruit", "vegetable", "vegetables", "salad", "fish", "chicken", "beans", "lentils", "nuts", "yogurt", "oats", "tofu"].some(h => text.includes(h))) {
        return "✅ Excellent choice! This is a nutritious option that will help charge your health battery.";
      } else {
        return "✅ That seems like a reasonable food choice! For optimal nutrition, include a variety of colorful vegetables, lean proteins, and whole grains.";
      }
    }
  };

 const handleAiQuery = async () => {
  setCoachLoading(true);
  setCoachOutput(null);
  
  try {
    const text = coachInput.trim();
    if (!text) {
      setCoachOutput("Please enter a question or food to get advice ✨");
      return;
    }

    // Get token for authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI assistant",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      console.log('🔍 Help: Calling Gemini AI via Flask server');
      
      const response = await fetch('http://localhost:5050/api/ai/health-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: text,
          type: 'general' // Add type for proper processing
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Help: AI Response received:', data);

      // Fix: Use data.response instead of data.text
      if (data && data.response) {
        setCoachOutput(data.response);
      } else {
        setCoachOutput("I couldn't generate advice for that query. Try being more specific or asking something else!");
      }
      
    } catch (apiError) {
      console.error("API error:", apiError);
      // Fallback to offline mode if API fails
      console.log("Using offline response mode");
      setCoachOutput(getOfflineResponse(text));
    }
  } catch (error) {
    console.error("General error:", error);
    setCoachOutput("⚠️ Something went wrong. Please try again later.");
  } finally {
    setCoachLoading(false);
  }
};
  const features = [
    {
      icon: Battery,
      emoji: "🔋",
      title: "Daily Score",
      description: "Track your meals → Earn health % → See daily battery levels",
      steps: [
        "Log food for Morning, Afternoon, Evening",
        "AI calculates health score per meal (0-100%)",
        "Daily score shows overall health battery level",
        "Compare with yesterday's performance"
      ]
    },
    {
      icon: Calendar,
      emoji: "📅", 
      title: "Weekly View",
      description: "See 7-day food history + trends + best/worst days",
      steps: [
        "View complete week of meals and scores",
        "Navigate between different weeks",
        "See weekly average and comparisons",
        "Identify patterns and improvement areas"
      ]
    },
    {
      icon: Trophy,
      emoji: "🏆",
      title: "Achievements & Badges",
      description: "Dynamic badges based on your eating habits",
      steps: [
        "Earn badges for healthy food choices",
        "Consistency streaks unlock special rewards", 
        "Badges adapt to your actual eating patterns",
        "Track total achievements in your profile"
      ]
    },
    {
      icon: User,
      emoji: "👤",
      title: "Profile",
      description: "Update info, preferences, dietary goals",
      steps: [
        "Set personal health conditions",
        "Define dietary goals and targets",
        "Track overall progress and stats",
        "Customize health recommendations"
      ]
    }
  ];

  const faqs = [
    {
      question: "How does the health scoring work?",
      answer: "🍎 Healthy foods (fruits, vegetables, lean proteins) score 70-95%. 🍔 Processed foods score 20-55%. 🥗 Mixed meals score 50-80%. The AI considers nutritional value, processing level, and your health conditions."
    },
    {
      question: "When do the meal buttons activate?",
      answer: "⏰ Morning button: Active until noon. ☀️ Afternoon button: Active 12pm-5pm. 🌙 Evening button: Active after 5pm. You can always override the time and log meals for any period!"
    },
    {
      question: "How are badges earned?",
      answer: "🏆 Badges are dynamic and based on real eating patterns: eat fruits 3x = 🥭 Fruit Lover, log all 3 meals = 🕒 Consistency Champ, avoid junk food = 🚫🍔 Smart Choices. They update automatically!"
    },
    {
      question: "What if I miss logging a meal?",
      answer: "✨ No problem! You can always go back and log meals for any time period. Your weekly view and scores will update automatically. The app celebrates progress, not perfection!"
    },
    {
      question: "How does the AI give recommendations?",
      answer: "🤖 The AI considers your health conditions, eating patterns, time of day, and goals to suggest foods. If you're unwell + log junk food, it might suggest 🍲 soup or 🍎 fruits instead!"
    },
    {
      question: "Can I change my health goals?",
      answer: "💯 Yes! Go to Profile → Update your weekly health target, daily meal goals, and dietary preferences. The app adapts all recommendations and progress tracking to your new goals."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4 animate-float">🤖</div>
          <h2 className="text-3xl font-bold mb-3">Health-o-Meter AI Guide</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Your friendly wellness companion! Track meals 🍽️ → Earn health % 🔋 → 
            See daily & weekly scores 📅 → Unlock badges 🏆 → Stay motivated 💪
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Health Coaching
          </Badge>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            How Health-o-Meter Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-glow transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{feature.emoji}</div>
                  <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                    <feature.icon className="h-5 w-5" />
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 min-w-fit">
                          {stepIndex + 1}
                        </Badge>
                        <span className="text-left">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="bg-gradient-battery border-0 text-white">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">Quick Start Guide</h3>
            <p className="text-white/90 mb-6">Get started in 3 simple steps!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-bold mb-2">Log Your Meals</h4>
              <p className="text-sm text-white/80">
                Enter food names for Morning, Afternoon & Evening. 
                AI calculates health scores automatically! 🍎➡️+15%
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-bold mb-2">Check Your Scores</h4>
              <p className="text-sm text-white/80">
                Watch your daily battery charge up! Compare with yesterday 
                and see weekly trends. 📊🔋
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-bold mb-2">Earn Achievements</h4>
              <p className="text-sm text-white/80">
                Unlock badges for consistency, healthy choices, and streaks! 
                Set goals in your Profile. 🏆✨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Coaching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Health Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAuthenticated === false ? (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-medium mb-2">Sign in to use AI Health Assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized health advice and food recommendations powered by Gemini AI
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign in to continue
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">Ask about foods, health advice, or get suggestions:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question or enter a food (e.g., Is pizza healthy? What should I eat?)"
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !coachLoading) {
                        handleAiQuery();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAiQuery}
                    disabled={coachLoading}
                  >
                    {coachLoading ? "Thinking..." : "Ask AI"}
                  </Button>
                </div>
              </div>
              {coachLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse flex items-center gap-2">
                    <div className="text-xl">🤖</div>
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
              {coachOutput && !coachLoading && (
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-xl mt-0.5">🤖</div>
                    <div>{coachOutput}</div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setCoachInput("What are good breakfast options?")}
                >
                  Breakfast ideas
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setCoachInput("How can I improve my energy levels?")}
                >
                  Energy tips
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setCoachInput("What snacks are healthy?")}
                >
                  Healthy snacks
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setCoachInput("How much water should I drink?")}
                >
                  Water intake
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Tips & Tricks */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pro Tips for Success 🎯
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xl">💡</div>
                <div>
                  <h4 className="font-medium mb-1">Be Specific with Food Names</h4>
                  <p className="text-sm text-muted-foreground">
                    "Grilled chicken salad" gets better scoring than just "salad"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xl">⏰</div>
                <div>
                  <h4 className="font-medium mb-1">Log Meals Right Away</h4>
                  <p className="text-sm text-muted-foreground">
                    Fresh logging helps build consistent habits and better tracking
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xl">🎯</div>
                <div>
                  <h4 className="font-medium mb-1">Set Realistic Goals</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with 60% weekly target, then increase as you improve
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xl">📱</div>
                <div>
                  <h4 className="font-medium mb-1">Check Weekly Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Weekly view shows patterns - use it to improve weak days
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xl">🏆</div>
                <div>
                  <h4 className="font-medium mb-1">Celebrate Small Wins</h4>
                  <p className="text-sm text-muted-foreground">
                    Every positive health score matters - progress over perfection!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-xl">🤖</div>
                <div>
                  <h4 className="font-medium mb-1">Trust the AI Coach</h4>
                  <p className="text-sm text-muted-foreground">
                    Health recommendations adapt to your conditions and goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
          <p className="text-muted-foreground mb-4">
            Your Health-o-Meter AI is always here to support your wellness journey!
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-health text-white border-0"
            onClick={() => navigate('/')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            🚀 Start Your Health Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}