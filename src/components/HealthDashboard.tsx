import { HealthBattery } from "./HealthBattery";
import { HealthBadges } from "./HealthBadges";
import { FoodLog } from "./FoodLog";
import { ConditionAlert } from "./ConditionAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface HealthData {
  morning: number;
  afternoon: number;
  night: number;
  daily: number;
  streak: number;
  badges: Array<{ type: 'gold' | 'silver' | 'bronze'; name: string; earned: boolean }>;
}

const mockHealthData: HealthData = {
  morning: 85,
  afternoon: 65,
  night: 40,
  daily: 63,
  streak: 3,
  badges: [
    { type: 'gold', name: 'Health Streak Master', earned: true },
    { type: 'silver', name: 'Balanced Eater', earned: true },
    { type: 'bronze', name: 'Hydration Hero', earned: false },
  ]
};

export function HealthDashboard() {
  const data = mockHealthData;

  return (
    <div className="space-y-6">
      {/* Header with AI Companion Message */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl animate-float">🥗</div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Your Health-o-Meter Today</h2>
              <p className="text-muted-foreground mb-3">
                Morning was 💪 strong! Afternoon dipped a bit ⚡, and dinner drained your battery 🍕⚠️. 
                But hey, you're rocking a {data.streak}-day streak! 🔥
              </p>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Pro tip: Try some green veggies tonight to power up! 🥬✨
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

      {/* Badges & Achievements */}
      <HealthBadges badges={data.badges} streak={data.streak} />

      {/* Food Logging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🍽️</span>
              Today's Food Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FoodLog />
            <Button className="w-full mt-4" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Log Your Next Meal
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <span className="text-lg font-semibold text-battery-high">Morning</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}