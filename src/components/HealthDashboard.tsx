import { HealthBattery } from "./HealthBattery";
import { HealthBadges } from "./HealthBadges";
import { FoodLog } from "./FoodLog";
import { FoodLogging } from "./FoodLogging";
import ConditionAlert from "./ConditionAlert";
import UserPointsWidget from "./UserPointsWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, BarChart3 } from "lucide-react";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useRealtimePoints } from "@/hooks/useRealtimePoints";
import { useUserHealthMetrics } from "@/lib/user-points";
import { useEffect, useState } from "react";
import { profileAPI } from "@/lib/api";
import { HydrationTracker } from "./HydrationTracker";
import { useAuth } from "@/contexts/AuthContext";
import AISuggestions from "./AISuggestions";
import { QuickActions } from "./QuickActions";

export function HealthDashboard() {
  const { user } = useAuth();
  const { getDailyScore, getPeriodScore, getTodaysFoodLogs, foodLogs } = useFoodLogs();
  const { getPointsBreakdown } = useRealtimePoints();
  const { calculateUserPoints } = useUserHealthMetrics();
  const todayLogs = getTodaysFoodLogs();
  const [hydrationBoost, setHydrationBoost] = useState<number>(0);
  const [hydrationLabel, setHydrationLabel] = useState<string>("");
  const [fatigue, setFatigue] = useState<number>(10);
  const [sleepHrs, setSleepHrs] = useState<number>(7);
  const [workoutMin, setWorkoutMin] = useState<number>(0);
  const [hydrationPct, setHydrationPct] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.get();
        const data = res.data as any;
        const target = data.hydration_target_glasses ?? 8;
        const progress = data.hydration_progress_glasses ?? 0;
        const pct = Math.min(1, (progress / Math.max(1, target)));
        const boost = Math.round(pct * 10); // up to +10
        setHydrationBoost(boost);
        setHydrationLabel(`${progress}/${target} water (+${boost})`);
        setHydrationPct(Math.round(pct * 100));
        // additional fields
        setFatigue(Number(data.fatigue ?? 10));
        setSleepHrs(Number(data.last_sleep_hours ?? 7));
        setWorkoutMin(Number(data.last_workout_minutes ?? 0));
      } catch {
        setHydrationBoost(0);
        setHydrationLabel("");
        setHydrationPct(0);
      }
    };
    fetchProfile();

    const onProfileUpdated = () => fetchProfile();
    window.addEventListener('profile:updated', onProfileUpdated as any);
    return () => window.removeEventListener('profile:updated', onProfileUpdated as any);
  }, []);
  
  // User greeting data
  const fullName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || 'Health Hero';
  
  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  // Calculate data early so it can be used in the header
  const userPointsData = calculateUserPoints();
  const pointsBreakdown = getPointsBreakdown();
  const dailyScore = getDailyScore(); // Use the comprehensive calculation from useFoodLogs
  


  const calculateWeeklyAverage = () => {
    const last7Days: number[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = foodLogs.filter(log => {
        const logDate = new Date(log.logged_at);
        return logDate.toDateString() === date.toDateString();
      });
      
      if (dayLogs.length > 0) {
        const dayScore = Math.round(dayLogs.reduce((sum, log) => sum + log.health_score, 0) / dayLogs.length);
        last7Days.push(dayScore);
      }
    }
    
    if (last7Days.length === 0) return dailyScore;
    return Math.round(last7Days.reduce((sum, score) => sum + score, 0) / last7Days.length);
  };
  
  const data = {
    morning: getPeriodScore('morning'),
    afternoon: getPeriodScore('afternoon'),
    night: getPeriodScore('evening'),
    daily: dailyScore,
    weeklyAverage: calculateWeeklyAverage(),
    streak: pointsBreakdown?.streak || userPointsData.streak || 0,
    badges: (userPointsData.badges || []).map(badge => ({
      type: 'gold' as const,
      name: badge,
      earned: true
    })),
  };

  return (
    <div className="space-y-6">
      {/* User Greeting Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary">{fullName}</span>!
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {getCurrentDate()} • {todayLogs.length} meal{todayLogs.length !== 1 ? 's' : ''} logged today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium text-primary">
                🔋 Health Battery: {data.daily}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header with AI Companion Message */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl animate-float">🥗</div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Your Health-o-Meter Today</h2>
              <p className="text-muted-foreground mb-3">
                {data.morning > 70 ? '💪 Great morning start!' : data.morning > 40 ? '⚡ Morning could be better' : '🍕 Rough morning - let\'s improve!'} 
                {data.afternoon > 70 ? ' Afternoon was strong!' : data.afternoon > 40 ? ' Afternoon was okay.' : ' Afternoon needs work.'} 
                {data.streak > 0 && ` You're on a ${data.streak}-day streak! 🔥`}
              </p>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {data.daily < 50 ? 'Focus on logging meals and drinking water! 💧' : 
                   data.daily < 75 ? 'Great progress - try adding more variety! 🥬' : 
                   'Excellent health habits - keep it up! ✨'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condition Alert */}
      <ConditionAlert />

      {/* Battery Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthBattery level={data.morning} label="Morning" period="morning" />
        <HealthBattery level={data.afternoon} label="Afternoon" period="afternoon" />
        <HealthBattery level={data.night} label="Night" period="night" />
        <HealthBattery 
          level={data.daily} 
          label="Daily Score" 
          period="daily" 
          className="md:col-span-2 lg:col-span-1 ring-2 ring-primary/20" 
        />
      </div>

      {/* User Points Widget */}
      <UserPointsWidget />

      {/* Badges & Achievements */}
      <HealthBadges badges={data.badges} streak={data.streak} />

      {/* Food Logging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FoodLogging />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🍽️</span>
                Today's Food Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FoodLog />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              Daily & Weekly Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HydrationTracker />
            <QuickActions />
            <Button variant="outline" className="w-full">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Daily Score: {data.daily}%</span>
                  <span className="text-xs text-muted-foreground">
                    • {userPointsData.totalPoints} pts
                  </span>
                </div>
                {todayLogs.length > 0 && (
                  <span className="text-sm text-muted-foreground text-right flex-shrink-0">
                    {todayLogs.length} meals logged
                  </span>
                )}
              </div>
            </Button>
            
            <Button variant="outline" className="w-full">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Weekly Average: {data.weeklyAverage}%</span>
                </div>
                
      
              </div>
            </Button>
            
            <div className="flex justify-between items-center p-3 bg-gradient-hero rounded-lg">
              <span className="font-medium">🔥 Streak</span>
              <span className="text-xl font-bold text-primary">{data.streak} days</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">🥇 Badges Earned</span>
              <span className="text-xl font-bold">{data.badges.filter(b => b.earned).length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">⚡ Best Period</span>
              <span className="text-lg font-semibold text-battery-high">
                {data.morning >= data.afternoon && data.morning >= data.night ? 'Morning' :
                 data.afternoon >= data.night ? 'Afternoon' : 'Evening'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <AISuggestions />
    </div>
  );
}