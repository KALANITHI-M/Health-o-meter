import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";

export function WeeklyView() {
  const { foodLogs, loading } = useFoodLogs();
  const [weekOffset, setWeekOffset] = useState(0);
  
  const getWeekData = (offset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (offset * 7));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    
    return weekDays.map(date => {
      const dayLogs = foodLogs.filter(log => 
        new Date(log.logged_at).toDateString() === date.toDateString()
      );
      
      const dayScore = dayLogs.length > 0 
        ? Math.round(dayLogs.reduce((sum, log) => sum + log.health_score, 0) / dayLogs.length)
        : 0;
        
      return {
        date,
        logs: dayLogs,
        score: dayScore,
        mealsCount: dayLogs.length
      };
    });
  };
  
  const weekData = getWeekData(weekOffset);
  const currentWeekData = getWeekData(0);
const lastWeekData = getWeekData(-1);

  const chartData = weekData.map((d) => ({
    day: d.date.toLocaleDateString('en-US', { weekday: 'short' }),
    score: d.score,
  }));
  
  const weekAverage = Math.round(
    weekData.reduce((sum, day) => sum + day.score, 0) / 7
  );
  
  const currentWeekAverage = Math.round(
    currentWeekData.reduce((sum, day) => sum + day.score, 0) / 7
  );
  
  const lastWeekAverage = Math.round(
    lastWeekData.reduce((sum, day) => sum + day.score, 0) / 7
  );
  
  const bestDay = weekData.reduce((best, day) => 
    day.score > best.score ? day : best
  );
  
  const worstDay = weekData.reduce((worst, day) => 
    day.score < worst.score && day.score > 0 ? day : worst
  );
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-battery-high";
    if (score >= 40) return "text-battery-medium";
    if (score === 0) return "text-muted-foreground";
    return "text-battery-low";
  };
  
  const getScoreBackground = (score: number) => {
    if (score >= 70) return "bg-battery-high/10 border-battery-high/20";
    if (score >= 40) return "bg-battery-medium/10 border-battery-medium/20";
    if (score === 0) return "bg-muted/50 border-muted";
    return "bg-battery-low/10 border-battery-low/20";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4 animate-float">📅</div>
          <h2 className="text-2xl font-bold mb-2">Loading Weekly Data...</h2>
          <p className="text-muted-foreground">Charging up your food history ⚡</p>
        </div>
      </div>
    );
  }

  const hasAnyData = weekData.some(day => day.mealsCount > 0);

  if (!hasAnyData && weekOffset === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-hero border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-float">📅</div>
            <h2 className="text-2xl font-bold mb-3">Weekly View is Charging Up! ⚡</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start logging meals to unlock your 7-day food history, trends, and insights!
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              🍽️ Log Your First Meal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekLabel = weekOffset === 0 ? "This Week" : 
                   weekOffset === -1 ? "Last Week" : 
                   weekOffset > 0 ? `${weekOffset} Week${weekOffset > 1 ? 's' : ''} Ahead` :
                   `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? 's' : ''} Ago`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-float">📅</div>
              <div>
                <h2 className="text-2xl font-bold">Weekly Health Dashboard</h2>
                <p className="text-muted-foreground">
                  {weekLabel} • Average: {weekAverage}% • {weekData.reduce((sum, day) => sum + day.mealsCount, 0)} meals logged
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setWeekOffset(weekOffset - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setWeekOffset(weekOffset + 1)}
                disabled={weekOffset >= 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Comparison */}
      {weekOffset === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week Average</p>
                  <p className={cn("text-2xl font-bold", getScoreColor(currentWeekAverage))}>
                    {currentWeekAverage}%
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last Week Comparison</p>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-2xl font-bold", getScoreColor(lastWeekAverage))}>
                      {lastWeekAverage}%
                    </p>
                    {currentWeekAverage > lastWeekAverage ? (
                      <div className="flex items-center gap-1 text-battery-high">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">+{currentWeekAverage - lastWeekAverage}%</span>
                      </div>
                    ) : currentWeekAverage < lastWeekAverage ? (
                      <div className="flex items-center gap-1 text-battery-low">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm">{currentWeekAverage - lastWeekAverage}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Same as last week</span>
                    )}
                  </div>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}
            className="w-full"
          >
            <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {weekLabel} Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekData.map((day, index) => (
              <Card key={index} className={cn("border-2", getScoreBackground(day.score))}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    
                    <div className={cn("text-2xl font-bold mb-1", getScoreColor(day.score))}>
                      {day.score > 0 ? `${day.score}%` : '—'}
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {day.mealsCount} {day.mealsCount === 1 ? 'meal' : 'meals'}
                    </Badge>
                    
                    {day.logs.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {day.logs.slice(0, 2).map((log, i) => (
                          <p key={i} className="text-xs text-muted-foreground truncate">
                            {log.name}
                          </p>
                        ))}
                        {day.logs.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{day.logs.length - 2} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week Insights */}
      {hasAnyData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <h3 className="font-bold text-green-800 dark:text-green-200 mb-1">
                    Best Day: {bestDay.date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {bestDay.score}% Health Score
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {bestDay.mealsCount} meals • Keep up the great work! 🎉
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {worstDay.score > 0 && worstDay.score !== bestDay.score && (
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💪</div>
                  <div>
                    <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-1">
                      Room to Improve: {worstDay.date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </h3>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {worstDay.score}% Health Score
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Try adding more fruits & veggies next time! 🥬✨
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}