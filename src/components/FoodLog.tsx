import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodItem {
  name: string;
  time: string;
  period: "morning" | "afternoon" | "night";
  score: number;
  emoji: string;
}

const mockFoodData: FoodItem[] = [
  { name: "Greek Yogurt Bowl", time: "8:30 AM", period: "morning", score: 85, emoji: "🥣" },
  { name: "Green Smoothie", time: "10:15 AM", period: "morning", score: 90, emoji: "🥤" },
  { name: "Grilled Chicken Salad", time: "12:45 PM", period: "afternoon", score: 80, emoji: "🥗" },
  { name: "Handful of Nuts", time: "3:30 PM", period: "afternoon", score: 70, emoji: "🥜" },
  { name: "Pizza Slice", time: "7:15 PM", period: "night", score: 35, emoji: "🍕" },
  { name: "Ice Cream", time: "9:30 PM", period: "night", score: 25, emoji: "🍨" },
];

export function FoodLog() {
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
      case "night": return "bg-accent-purple/10 text-accent-purple border-accent-purple/20";
      default: return "bg-muted";
    }
  };

  const groupedFoods = mockFoodData.reduce((acc, food) => {
    if (!acc[food.period]) acc[food.period] = [];
    acc[food.period].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedFoods).map(([period, foods]) => (
        <div key={period} className="space-y-2">
          {/* Period Header */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={getPeriodColor(period)}>
              {period === "morning" && "🌅"} 
              {period === "afternoon" && "☀️"}
              {period === "night" && "🌙"}
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

      {mockFoodData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🍽️</div>
          <p>No meals logged yet today</p>
          <p className="text-sm">Start tracking your nutrition!</p>
        </div>
      )}
    </div>
  );
}