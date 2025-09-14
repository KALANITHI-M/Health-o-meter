import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFoodLogs } from "@/hooks/useFoodLogs";

export function FoodLog() {
  const { getTodaysFoodLogs, loading } = useFoodLogs();
  const todayLogs = getTodaysFoodLogs();

  const formatLogTime = (loggedAt: string) => {
    return new Date(loggedAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getFoodEmoji = (foodName: string) => {
    const name = foodName.toLowerCase();
    if (name.includes('salad')) return '🥗';
    if (name.includes('fruit') || name.includes('apple')) return '🍎';
    if (name.includes('banana')) return '🍌';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('ice cream')) return '🍨';
    if (name.includes('smoothie')) return '🥤';
    if (name.includes('yogurt')) return '🥣';
    if (name.includes('nuts')) return '🥜';
    return '🍽️';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">⏳</div>
          <p>Loading your food logs...</p>
        </div>
      </div>
    );
  }
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-battery-high";
    if (score >= 40) return "text-battery-medium";
    return "text-battery-low";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case "morning": return "bg-primary/10 text-primary border-primary/20";
      case "afternoon": return "bg-secondary/10 text-secondary border-secondary/20";
      case "evening": return "bg-accent-purple/10 text-accent-purple border-accent-purple/20";
      default: return "bg-muted";
    }
  };

  const groupedFoods = todayLogs.reduce((acc, log) => {
    const period = log.meal_type === 'evening' ? 'evening' : log.meal_type;
    if (!acc[period]) acc[period] = [];
    acc[period].push({
      name: log.name,
      time: formatLogTime(log.logged_at),
      period: period as "morning" | "afternoon" | "evening",
      score: log.health_score,
      emoji: getFoodEmoji(log.name)
    });
    return acc;
  }, {} as Record<string, Array<{name: string; time: string; period: "morning" | "afternoon" | "evening"; score: number; emoji: string}>>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedFoods).map(([period, foods]) => (
        <div key={period} className="space-y-2">
          {/* Period Header */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={getPeriodColor(period)}>
              {period === "morning" && "🌅"} 
              {period === "afternoon" && "☀️"}
              {period === "evening" && "🌙"}
              <span className="ml-1 capitalize">{period}</span>
            </Badge>
          </div>

          {/* Food Items */}
          {foods.map((food, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{food.emoji}</span>
                <div>
                  <div className="font-medium text-sm">{food.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {food.time}
                  </div>
                </div>
              </div>
              
              <div className={cn("flex items-center gap-1 font-medium text-sm", getScoreColor(food.score))}>
                {getScoreIcon(food.score)}
                <span>{food.score}%</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {todayLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🍽️</div>
          <p>No meals logged yet today</p>
          <p className="text-sm">Start tracking your nutrition! ✨</p>
        </div>
      )}
    </div>
  );
}