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
import { useState } from "react";

export function Help() {
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
            AI Coaching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Type a food (e.g., burger, salad, soup)"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
            />
            <Button
              onClick={async () => {
                setCoachOutput(null);
                setCoachLoading(true);
                try {
                  const text = coachInput.trim().toLowerCase();
                  if (!text) {
                    setCoachOutput("Please enter a food to get coaching ✨");
                  } else {
                    const unhealthy = ["pizza","burger","fries","candy","soda","ice cream","cake","chips","donut","cookies"];
                    const healthyAlts: Record<string,string> = {
                      burger: "Try a grilled chicken wrap or a bean burger 🫘",
                      pizza: "Go for a veggie flatbread with thin crust 🥦",
                      fries: "Swap to baked sweet potato wedges 🍠",
                      candy: "Choose a handful of berries or nuts 🍓🥜",
                      soda: "Try sparkling water with lemon 🍋",
                      "ice cream": "Yogurt with fruit is a tasty swap 🍨➡️🥣",
                      cake: "Fruit salad with dark chocolate shavings 🍫🍓",
                      chips: "Crunch on carrots or air-popped popcorn 🥕🍿",
                      donut: "Whole-grain toast with nut butter 🥜🍞",
                      cookies: "Oat cookies with less sugar or an apple 🍎",
                    };
                    if (unhealthy.some((u) => text.includes(u))) {
                      const key = unhealthy.find((u) => text.includes(u))!;
                      setCoachOutput(`⚠️ That might drain your battery. ${healthyAlts[key]}`);
                    } else {
                      setCoachOutput("✅ Nice choice! Keep it balanced with veggies and protein 💪");
                    }
                  }
                } catch (e) {
                  setCoachOutput("⚠️ Coaching not available right now, please retry 🔄.");
                } finally {
                  setCoachLoading(false);
                }
              }}
              disabled={coachLoading}
            >
              {coachLoading ? "Thinking..." : "Get Coaching"}
            </Button>
          </div>
          {coachOutput && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">{coachOutput}</div>
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
          <Button size="lg" className="bg-gradient-health text-white border-0">
            <Sparkles className="h-4 w-4 mr-2" />
            🚀 Start Your Health Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}