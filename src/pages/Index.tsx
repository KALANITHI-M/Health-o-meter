import { HealthDashboard } from "@/components/HealthDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Settings, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'Health Hero';

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-float">🥗</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-health bg-clip-text text-transparent">
                  Health-o-Meter
                </h1>
                <p className="text-xs text-muted-foreground">Track • Score • Level Up</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Hero */}
        <Card className="mb-8 bg-gradient-health text-white border-0">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-float">🎯</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome back, {firstName}! 🥗
            </h2>
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Your health dashboard is ready! Check your battery levels, log today's meals, 
              and keep building those healthy streaks! 💪✨
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                📱 Log Your First Meal
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                🔍 How It Works
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard */}
        <HealthDashboard />

        {/* Motivational Footer */}
        <Card className="mt-8 bg-gradient-battery border-0">
          <CardContent className="p-6 text-center text-white">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">
              Your Health Journey Starts Here! 
            </h3>
            <p className="text-white/90 mb-4">
              Every healthy choice charges your batteries. Every streak unlocks new achievements. 
              Let's make wellness fun, one meal at a time! 🚀
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-white/80">
              <span>💪 Build Streaks</span>
              <span>🏆 Earn Badges</span>
              <span>📈 Track Progress</span>
              <span>🤖 AI Coaching</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;