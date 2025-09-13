import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeData {
  type: 'gold' | 'silver' | 'bronze';
  name: string;
  earned: boolean;
}

interface HealthBadgesProps {
  badges: BadgeData[];
  streak: number;
}

export function HealthBadges({ badges, streak }: HealthBadgesProps) {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'gold': return <Trophy className="w-5 h-5" />;
      case 'silver': return <Award className="w-5 h-5" />;
      case 'bronze': return <Medal className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getBadgeColor = (type: string, earned: boolean) => {
    if (!earned) return "text-muted-foreground bg-muted";
    
    switch (type) {
      case 'gold': return "text-badge-gold bg-badge-gold/10 border-badge-gold/20";
      case 'silver': return "text-badge-silver bg-badge-silver/10 border-badge-silver/20";
      case 'bronze': return "text-badge-bronze bg-badge-bronze/10 border-badge-bronze/20";
      default: return "text-primary bg-primary/10";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span>
          Achievements & Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Streak Counter */}
        <div className="mb-6 p-4 bg-gradient-health rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">🔥 Health Streak</h3>
              <p className="text-white/80">Keep the momentum going!</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{streak}</div>
              <div className="text-sm text-white/80">days</div>
            </div>
          </div>
          {streak >= 7 && (
            <div className="mt-2 text-sm font-medium animate-pulse">
              🎉 Amazing! You're on fire! 
            </div>
          )}
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Your Badges</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  getBadgeColor(badge.type, badge.earned),
                  badge.earned && "animate-badge-bounce hover:scale-105 cursor-pointer"
                )}
              >
                <div className={cn("flex-shrink-0", !badge.earned && "opacity-50")}>
                  {getBadgeIcon(badge.type)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">
                    {badge.name}
                  </div>
                  <div className="text-xs opacity-70">
                    {badge.earned ? "Earned! 🎉" : "Not yet earned"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Badge Hint */}
        <div className="mt-6 p-3 bg-accent-purple/10 rounded-lg border border-accent-purple/20">
          <div className="flex items-center gap-2 text-accent-purple">
            <span>🎯</span>
            <span className="font-medium text-sm">
              Next Challenge: Get 5 days streak for "Consistency Champion" badge!
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}