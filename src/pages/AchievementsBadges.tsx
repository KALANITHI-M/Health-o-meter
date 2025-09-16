import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Flame, Award, Target, Zap } from "lucide-react";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'gold' | 'silver' | 'bronze';
  earned: boolean;
  progress: number;
  requirement: number;
  category: 'consistency' | 'nutrition' | 'streaks' | 'variety';
}

export function AchievementsBadges() {
  const { foodLogs, getDailyScore, getTodaysFoodLogs, getPeriodScore, hasPeriodLogs } = useFoodLogs();
  
  const calculateAchievements = (): Achievement[] => {
    const todayLogs = getTodaysFoodLogs();
    const last7Days = foodLogs.filter(log => {
      const logDate = new Date(log.logged_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return logDate >= sevenDaysAgo;
    });

    // Count healthy vs unhealthy foods
    const healthyFoods = foodLogs.filter(log => log.health_score >= 70);
    const fruitMeals = foodLogs.filter(log => 
      log.name.toLowerCase().includes('fruit') || 
      log.name.toLowerCase().includes('apple') ||
      log.name.toLowerCase().includes('banana') ||
      log.name.toLowerCase().includes('berry')
    );
    
    const vegetableMeals = foodLogs.filter(log => 
      log.name.toLowerCase().includes('salad') || 
      log.name.toLowerCase().includes('vegetable') ||
      log.name.toLowerCase().includes('broccoli') ||
      log.name.toLowerCase().includes('spinach')
    );

    // Calculate streaks
    const dailyScores = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = foodLogs.filter(log => 
        new Date(log.logged_at).toDateString() === date.toDateString()
      );
      const dayScore = dayLogs.length > 0 
        ? Math.round(dayLogs.reduce((sum, log) => sum + log.health_score, 0) / dayLogs.length)
        : 0;
      dailyScores.push(dayScore);
    }
    
    let currentStreak = 0;
    for (let i = dailyScores.length - 1; i >= 0; i--) {
      if (dailyScores[i] >= 60) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Count days with all meals logged
    let perfectDays = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = foodLogs.filter(log => 
        new Date(log.logged_at).toDateString() === date.toDateString()
      );
      
      const hasMorning = dayLogs.some(log => log.meal_type === 'morning');
      const hasAfternoon = dayLogs.some(log => log.meal_type === 'afternoon');
      const hasEvening = dayLogs.some(log => log.meal_type === 'evening');
      
      if (hasMorning && hasAfternoon && hasEvening) {
        perfectDays++;
      }
    }

    return [
      {
        id: 'fruit-lover',
        name: 'Fruit Lover',
        description: 'Eat fruits 3 times this week',
        icon: '🥭',
        type: 'bronze',
        earned: fruitMeals.filter(log => {
          const logDate = new Date(log.logged_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return logDate >= sevenDaysAgo;
        }).length >= 3,
        progress: Math.min(fruitMeals.filter(log => {
          const logDate = new Date(log.logged_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return logDate >= sevenDaysAgo;
        }).length, 3),
        requirement: 3,
        category: 'nutrition'
      },
      {
        id: 'consistency-champ',
        name: 'Consistency Champ',
        description: 'Log all 3 meals for 3 days',
        icon: '🕒',
        type: 'silver',
        earned: perfectDays >= 3,
        progress: Math.min(perfectDays, 3),
        requirement: 3,
        category: 'consistency'
      },
      {
        id: 'health-streak',
        name: 'Health Streak Master',
        description: 'Maintain 60%+ health score for 5 days',
        icon: '🔥',
        type: 'gold',
        earned: currentStreak >= 5,
        progress: Math.min(currentStreak, 5),
        requirement: 5,
        category: 'streaks'
      },
      {
        id: 'veggie-warrior',
        name: 'Veggie Warrior',
        description: 'Eat vegetables 5 times this week',
        icon: '🥬',
        type: 'bronze',
        earned: vegetableMeals.filter(log => {
          const logDate = new Date(log.logged_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return logDate >= sevenDaysAgo;
        }).length >= 5,
        progress: Math.min(vegetableMeals.filter(log => {
          const logDate = new Date(log.logged_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return logDate >= sevenDaysAgo;
        }).length, 5),
        requirement: 5,
        category: 'nutrition'
      },
      {
        id: 'smart-choices',
        name: 'Smart Choices',
        description: 'Maintain 70%+ avg score for 2 days',
        icon: '🧠',
        type: 'silver',
        earned: dailyScores.slice(-2).every(score => score >= 70),
        progress: dailyScores.slice(-2).filter(score => score >= 70).length,
        requirement: 2,
        category: 'nutrition'
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Log healthy breakfast 5 days this week',
        icon: '🌅',
        type: 'bronze',
        earned: last7Days.filter(log => 
          log.meal_type === 'morning' && log.health_score >= 70
        ).length >= 5,
        progress: Math.min(last7Days.filter(log => 
          log.meal_type === 'morning' && log.health_score >= 70
        ).length, 5),
        requirement: 5,
        category: 'consistency'
      },
      {
        id: 'perfect-day',
        name: 'Perfect Day',
        description: 'Log all meals with 80%+ score in one day',
        icon: '⭐',
        type: 'gold',
        earned: (() => {
          for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayLogs = foodLogs.filter(log => 
              new Date(log.logged_at).toDateString() === date.toDateString()
            );
            
            if (dayLogs.length >= 3 && dayLogs.every(log => log.health_score >= 80)) {
              return true;
            }
          }
          return false;
        })(),
        progress: (() => {
          let maxProgress = 0;
          for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayLogs = foodLogs.filter(log => 
              new Date(log.logged_at).toDateString() === date.toDateString()
            );
            
            if (dayLogs.length >= 3) {
              const avgScore = dayLogs.reduce((sum, log) => sum + log.health_score, 0) / dayLogs.length;
              maxProgress = Math.max(maxProgress, Math.min(avgScore / 80, 1));
            }
          }
          return maxProgress;
        })(),
        requirement: 1,
        category: 'streaks'
      },
      {
        id: 'variety-explorer',
        name: 'Variety Explorer',
        description: 'Try 10 different foods this week',
        icon: '🌈',
        type: 'silver',
        earned: [...new Set(last7Days.map(log => log.name.toLowerCase()))].length >= 10,
        progress: Math.min([...new Set(last7Days.map(log => log.name.toLowerCase()))].length, 10),
        requirement: 10,
        category: 'variety'
      }
    ];
  };

  const achievements = calculateAchievements();
  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.earned && a.progress === 0);

  const getBadgeColor = (type: string, earned: boolean) => {
    if (!earned) return "bg-muted text-muted-foreground border-muted";
    
    switch (type) {
      case 'gold':
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-400 shadow-glow";
      case 'silver':
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white border-gray-400 shadow-md";
      case 'bronze':
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-400 shadow-md";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consistency': return <Target className="h-4 w-4" />;
      case 'nutrition': return <Zap className="h-4 w-4" />;
      case 'streaks': return <Flame className="h-4 w-4" />;
      case 'variety': return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const totalEarned = earnedAchievements.length;
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-float">🏆</div>
              <div>
                <h2 className="text-2xl font-bold">Achievements & Badges</h2>
                <p className="text-muted-foreground">
                  {totalEarned}/{totalAchievements} earned • Dynamic badges that adapt to your eating habits
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{totalEarned}</div>
              <div className="text-sm text-muted-foreground">badges earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Achievement Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((totalEarned / totalAchievements) * 100)}%
              </span>
            </div>
            <Progress value={(totalEarned / totalAchievements) * 100} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{earnedAchievements.filter(a => a.type === 'gold').length}</div>
                <div className="text-xs text-muted-foreground">Gold</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{earnedAchievements.filter(a => a.type === 'silver').length}</div>
                <div className="text-xs text-muted-foreground">Silver</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{earnedAchievements.filter(a => a.type === 'bronze').length}</div>
                <div className="text-xs text-muted-foreground">Bronze</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              🎉 Earned Achievements ({earnedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <Card key={achievement.id} className={cn("border-2", getBadgeColor(achievement.type, achievement.earned))}>
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm mb-2 opacity-90">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      {getCategoryIcon(achievement.category)}
                      <Badge variant="secondary" className="text-xs">
                        {achievement.type.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress */}
      {inProgressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              🚀 Almost There! ({inProgressAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressAchievements.map((achievement) => (
                <Card key={achievement.id} className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{achievement.name}</h3>
                          {getCategoryIcon(achievement.category)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(achievement.progress)}/{achievement.requirement}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.requirement) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              🔒 Ready to Unlock ({lockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {lockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="border-2 border-muted opacity-60 hover:opacity-80 transition-opacity">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2 grayscale">{achievement.icon}</div>
                    <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {getCategoryIcon(achievement.category)}
                      <Badge variant="outline" className="text-xs">
                        {achievement.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Footer */}
      <Card className="bg-gradient-battery border-0 text-white">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-xl font-bold mb-2">Keep Up the Great Work!</h3>
          <p className="text-white/90 mb-4">
            Every healthy choice brings you closer to new achievements. 
            Your badges grow with your wellness journey! 🚀
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <span>💪 Stay Consistent</span>
            <span>🥬 Choose Wisely</span>
            <span>🏆 Earn Rewards</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}