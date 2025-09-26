import { SideNavigation } from "@/components/SideNavigation";
import { HealthDashboard } from "@/components/HealthDashboard";
import { MealAnalyzer } from "@/components/MealAnalyzer";
import { WeeklyView } from "./WeeklyView";
import { Profile } from "./Profile";
import { Help } from "./Help";
import { AchievementsBadges } from "./AchievementsBadges";
import Leaderboard from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { user } = useAuth();
  const { getTodaysFoodLogs, getDailyScore } = useFoodLogs();
  const [activeTab, setActiveTab] = useState('daily');
  const isMobile = useIsMobile();
  
  const firstName = user?.firstName || 'Health Hero';
  const fullName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || 'Health Hero';
  const todayLogs = getTodaysFoodLogs();
  const dailyScore = getDailyScore();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily':
        return (
          <div className="space-y-6">
            {/* Welcome Message - Show only on first visit or when no meals logged */}
            {todayLogs.length === 0 && (
              <Card className="bg-gradient-health text-white border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4 animate-float">🎯</div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    Welcome back, {fullName}! 🥗
                  </h2>
                  <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                    Your health dashboard is ready! Check your battery levels, log today's meals, 
                    and keep building those healthy streaks! 💪✨
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                      📱 Log Your First Meal
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => setActiveTab('help')}
                    >
                      🔍 How It Works
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* First meal celebration */}
            {todayLogs.length === 1 && (
              <Card className="bg-gradient-battery border-0 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3 animate-float">🎉</div>
                  <h3 className="text-xl font-bold mb-2">
                    Woohoo! You logged your first meal today 🍽️
                  </h3>
                  <p className="text-white/90 mb-4">
                    Your health battery is charging! Keep it up! ⚡
                  </p>
                </CardContent>
              </Card>
            )}

            <HealthDashboard />

            {/* Motivational Footer - Show when user has logged meals */}
            {todayLogs.length > 0 && (
              <Card className="bg-gradient-battery border-0">
                <CardContent className="p-6 text-center text-white">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-xl font-bold mb-2">
                    Your Health Journey is Powered Up! 
                  </h3>
                  <p className="text-white/90 mb-4">
                    Today's Score: {dailyScore}% • Every healthy choice charges your batteries. 
                    Every streak unlocks new achievements! 🚀
                  </p>
                  <div className="flex items-center justify-center gap-6 text-sm text-white/80">
                    <span>💪 Build Streaks</span>
                    <span>🏆 Earn Badges</span>
                    <span>📈 Track Progress</span>
                    <span>🤖 AI Coaching</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'meal-analyzer':
        return <MealAnalyzer />;
      case 'weekly':
        return <WeeklyView />;
      case 'achievements':
        return <AchievementsBadges />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile />;
      case 'help':
        return <Help />;
      default:
        return <HealthDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SideNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content with proper spacing for sidebar */}
      <main className={`transition-all duration-300 ${
        isMobile 
          ? 'pt-16 px-4 py-6' // Mobile: account for header
          : 'ml-64 px-6 py-6' // Desktop: account for sidebar
      }`}>
        <div className="container mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;