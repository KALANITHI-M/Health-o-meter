import { useEffect, useState } from 'react';
import { useUserHealthMetrics } from '@/lib/user-points';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PointsUpdate {
  newPoints: number;
  pointsGained: number;
  achievement?: string;
  streak: number;
}

export function useRealtimePoints() {
  const { user } = useAuth();
  const { foodLogs, getDailyScore } = useFoodLogs();
  const { calculateUserPoints } = useUserHealthMetrics();
  const [previousPoints, setPreviousPoints] = useState<number>(0);
  const [currentPoints, setCurrentPoints] = useState<number>(0);

  // Calculate points whenever food logs change
  useEffect(() => {
    if (!user || !foodLogs) return;

    const userPointsData = calculateUserPoints();
    const newPoints = userPointsData.totalPoints;
    
    // Only update if points actually changed
    if (newPoints !== currentPoints) {
      // Check if points increased (user logged new food)
      if (newPoints > currentPoints && currentPoints > 0) {
        const pointsGained = newPoints - currentPoints;
        
        // Show achievement notification
        let achievementMessage = '';
        if (pointsGained >= 50) {
          achievementMessage = '🎉 Massive point boost!';
        } else if (pointsGained >= 20) {
          achievementMessage = '⚡ Great progress!';
        } else if (pointsGained >= 10) {
          achievementMessage = '💪 Nice work!';
        }

        if (achievementMessage) {
          toast.success(`${achievementMessage} +${pointsGained} points!`, {
            description: `Total: ${newPoints} points | Streak: ${userPointsData.streak} days`,
            duration: 4000,
          });
        }

        // Check for streak milestones
        if (userPointsData.streak > 0 && userPointsData.streak % 7 === 0) {
          toast.success(`🔥 ${userPointsData.streak}-day streak! You're on fire!`, {
            description: `Streak bonus: ${Math.round(newPoints * 0.25)} extra points!`,
            duration: 5000,
          });
        }
      }
      
      setPreviousPoints(currentPoints);
      setCurrentPoints(newPoints);
    }
  }, [foodLogs, user?.id, currentPoints]); // Remove calculateUserPoints and previousPoints from dependencies

  // Show daily achievement when user reaches certain daily scores
  useEffect(() => {
    if (!foodLogs || !user) return;
    
    const dailyScore = getDailyScore();
    
    if (dailyScore >= 90) {
      toast.success('🌟 Perfect health day! 90+ score!', {
        description: 'You\'re crushing it today!',
        duration: 3000,
      });
    } else if (dailyScore >= 80) {
      toast.success('🎯 Excellent day! 80+ score!', {
        description: 'Keep up the great work!',
        duration: 3000,
      });
    }
  }, [foodLogs, user?.id]); // Depend on foodLogs instead of getDailyScore function

  const getPointsBreakdown = () => {
    if (!user) return null;
    
    const userPointsData = calculateUserPoints();
    return {
      totalPoints: userPointsData.totalPoints,
      dailyAverage: userPointsData.dailyAverage,
      streak: userPointsData.streak,
      badges: userPointsData.badges,
      breakdown: userPointsData.pointsBreakdown,
      trend: userPointsData.trend
    };
  };

  const getLeaderboardPosition = async () => {
    // This would make an API call to get user's current rank
    // For now, return mock position
    return {
      rank: Math.floor(Math.random() * 10) + 1,
      totalUsers: 47,
      percentile: 85
    };
  };

  return {
    currentPoints,
    pointsGained: currentPoints - previousPoints,
    getPointsBreakdown,
    getLeaderboardPosition
  };
}

// Hook for tracking point history and analytics
export function usePointsAnalytics() {
  const { calculateUserPoints } = useUserHealthMetrics();
  const { foodLogs } = useFoodLogs();
  const [pointsHistory, setPointsHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!foodLogs) return;
    
    // Calculate daily points for the last 7 days
    const userPointsData = calculateUserPoints();
    setPointsHistory(userPointsData.weeklyProgress);
  }, [foodLogs]); // Remove calculateUserPoints from dependencies

  const getAnalytics = () => {
    if (pointsHistory.length === 0) return null;

    const totalPoints = pointsHistory.reduce((sum, points) => sum + points, 0);
    const averageDaily = totalPoints / pointsHistory.length;
    const bestDay = Math.max(...pointsHistory);
    const worstDay = Math.min(...pointsHistory);
    const trend = pointsHistory[pointsHistory.length - 1] > pointsHistory[0] ? 'improving' : 'declining';

    return {
      totalWeeklyPoints: totalPoints,
      averageDailyPoints: Math.round(averageDaily),
      bestDayPoints: bestDay,
      worstDayPoints: worstDay,
      trend,
      consistency: calculateConsistency(),
      pointsHistory
    };
  };

  const calculateConsistency = () => {
    if (pointsHistory.length < 2) return 0;
    
    const mean = pointsHistory.reduce((sum, points) => sum + points, 0) / pointsHistory.length;
    const variance = pointsHistory.reduce((sum, points) => sum + Math.pow(points - mean, 2), 0) / pointsHistory.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
    return Math.round(consistencyScore);
  };

  return {
    getAnalytics,
    pointsHistory
  };
}