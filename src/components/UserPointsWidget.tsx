import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, TrendingUp, TrendingDown, Star, Target, Award } from 'lucide-react';
import { useRealtimePoints, usePointsAnalytics } from '@/hooks/useRealtimePoints';
import { useAuth } from '@/contexts/AuthContext';

interface UserPointsWidgetProps {
  showDetailed?: boolean;
  className?: string;
}

const UserPointsWidget: React.FC<UserPointsWidgetProps> = ({ 
  showDetailed = false, 
  className = '' 
}) => {
  const { user } = useAuth();
  const { currentPoints, getPointsBreakdown } = useRealtimePoints();
  const { getAnalytics } = usePointsAnalytics();
  
  if (!user) return null;

  const pointsData = getPointsBreakdown();
  const analytics = getAnalytics();

  if (!pointsData) return null;

  const { totalPoints, streak, badges, breakdown, trend } = pointsData;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Target className="w-4 h-4 text-gray-500" />;
  };

  const getStreakColor = () => {
    if (streak >= 7) return 'text-orange-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!showDetailed) {
    // Compact widget for dashboard
    return (
      <Card className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Weekly Points</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-semibold ${getStreakColor()}`}>
                🔥 {streak}
              </div>
              <div className="text-xs text-gray-500">day streak</div>
            </div>
          </div>
          
          {badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
              {badges.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{badges.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed widget for profile/leaderboard pages
  return (
    <Card className={`bg-white shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Your Performance</h3>
              <p className="text-sm text-gray-600">This week's health journey</p>
            </div>
          </div>
          {getTrendIcon()}
        </div>

        {/* Points Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className={`text-3xl font-bold ${getStreakColor()}`}>
              {streak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Points Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Base Health Score</span>
              <div className="flex items-center space-x-2">
                <Progress value={70} className="w-16 h-2" />
                <span className="text-sm font-medium">{breakdown.baseHealthScore}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Consistency Bonus</span>
              <div className="flex items-center space-x-2">
                <Progress value={60} className="w-16 h-2" />
                <span className="text-sm font-medium">{breakdown.consistencyBonus}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Streak Multiplier</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-orange-600">
                  {breakdown.streakMultiplier.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Badges</h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>{badge}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Analytics */}
        {analytics && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Week Summary</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  {analytics.averageDailyPoints}
                </div>
                <div className="text-xs text-gray-600">Daily Avg</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">
                  {analytics.bestDayPoints}
                </div>
                <div className="text-xs text-gray-600">Best Day</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-600">
                  {analytics.consistency}%
                </div>
                <div className="text-xs text-gray-600">Consistency</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPointsWidget;