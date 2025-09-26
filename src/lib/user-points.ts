import { useAuth } from '@/contexts/AuthContext';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useCallback } from 'react';

export interface UserPointsData {
  userId: string;
  name: string;
  totalPoints: number;
  dailyAverage: number;
  streak: number;
  badges: string[];
  pointsBreakdown: {
    baseHealthScore: number;
    consistencyBonus: number;
    hydrationBonus: number;
    streakMultiplier: number;
    achievementBonus: number;
  };
  trend: 'up' | 'down' | 'same';
  weeklyProgress: number[];
  isCurrentUser?: boolean;
}

export interface HealthMetrics {
  dailyHealthScore: number;
  mealsLogged: number;
  hydrationGlasses: number;
  weeklyData: DailyMetrics[];
}

export interface DailyMetrics {
  date: string;
  healthScore: number;
  mealsLogged: number;
  hydrationGlasses: number;
  mealTimes: string[];
  foodCategories: string[];
}

// Point calculation constants
const POINT_SYSTEM = {
  BASE_HEALTH_SCORE_MULTIPLIER: 1.0,
  MEAL_CONSISTENCY_BONUS: 10,
  HYDRATION_BONUS: 15,
  TIMING_BONUS: 3,
  VARIETY_BONUS: 5,
  STREAK_MULTIPLIERS: {
    1: 1.0,
    3: 1.1,
    7: 1.25,
    14: 1.5,
    30: 2.0
  },
  ACHIEVEMENT_BONUSES: {
    first_week: 50,
    consistency_king: 60,
    hydration_master: 30,
    nutrition_guru: 40,
    early_bird: 25,
    week_warrior: 35
  }
};

export class HealthPointCalculator {
  // Calculate daily points based on user's food logs and health data
  static calculateDailyPoints(metrics: DailyMetrics): number {
    let dailyPoints = 0;

    // 1. Base health score (0-100 points)
    dailyPoints += metrics.healthScore * POINT_SYSTEM.BASE_HEALTH_SCORE_MULTIPLIER;

    // 2. Meal consistency bonus
    if (metrics.mealsLogged >= 3) {
      dailyPoints += POINT_SYSTEM.MEAL_CONSISTENCY_BONUS;
    } else if (metrics.mealsLogged >= 2) {
      dailyPoints += POINT_SYSTEM.MEAL_CONSISTENCY_BONUS * 0.7;
    }

    // 3. Hydration bonus
    if (metrics.hydrationGlasses >= 8) {
      dailyPoints += POINT_SYSTEM.HYDRATION_BONUS;
    } else if (metrics.hydrationGlasses >= 6) {
      dailyPoints += POINT_SYSTEM.HYDRATION_BONUS * 0.75;
    } else if (metrics.hydrationGlasses >= 4) {
      dailyPoints += POINT_SYSTEM.HYDRATION_BONUS * 0.5;
    }

    // 4. Timing bonus (meals at optimal times)
    const timingBonus = this.calculateTimingBonus(metrics.mealTimes);
    dailyPoints += timingBonus;

    // 5. Variety bonus (different food categories)
    const varietyBonus = this.calculateVarietyBonus(metrics.foodCategories);
    dailyPoints += varietyBonus;

    return Math.round(dailyPoints);
  }

  // Calculate timing bonus based on meal times
  static calculateTimingBonus(mealTimes: string[]): number {
    let bonus = 0;

    mealTimes.forEach(timeStr => {
      const hour = new Date(timeStr).getHours();
      
      // Morning meals (6-10 AM): +3 points
      if (hour >= 6 && hour <= 10) {
        bonus += POINT_SYSTEM.TIMING_BONUS;
      }
      // Lunch (11 AM - 2 PM): +3 points
      else if (hour >= 11 && hour <= 14) {
        bonus += POINT_SYSTEM.TIMING_BONUS;
      }
      // Dinner (5-8 PM): +3 points
      else if (hour >= 17 && hour <= 20) {
        bonus += POINT_SYSTEM.TIMING_BONUS;
      }
      // Late night penalty (-2 points for meals after 9 PM)
      else if (hour >= 21) {
        bonus -= 2;
      }
    });

    return Math.max(0, bonus);
  }

  // Calculate variety bonus based on food categories
  static calculateVarietyBonus(foodCategories: string[]): number {
    const uniqueCategories = new Set(foodCategories);
    const varietyCount = uniqueCategories.size;

    if (varietyCount >= 5) return 15;
    if (varietyCount >= 4) return 10;
    if (varietyCount >= 3) return 5;
    return 0;
  }

  // Calculate current streak from weekly data
  static calculateStreak(weeklyData: DailyMetrics[]): number {
    let streak = 0;
    const sortedData = weeklyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const day of sortedData) {
      const dailyPoints = this.calculateDailyPoints(day);
      if (dailyPoints >= 50) { // Minimum threshold for streak
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Get streak multiplier
  static getStreakMultiplier(streakDays: number): number {
    const multipliers = POINT_SYSTEM.STREAK_MULTIPLIERS;
    const sortedThresholds = Object.keys(multipliers)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of sortedThresholds) {
      if (streakDays >= threshold) {
        return multipliers[threshold];
      }
    }

    return 1.0;
  }

  // Calculate achievement bonuses
  static calculateAchievementBonuses(weeklyData: DailyMetrics[], streak: number): number {
    let bonus = 0;

    // First week completion
    if (weeklyData.length >= 7) {
      bonus += POINT_SYSTEM.ACHIEVEMENT_BONUSES.first_week;
    }

    // Consistency king (7+ day streak)
    if (streak >= 7) {
      bonus += POINT_SYSTEM.ACHIEVEMENT_BONUSES.consistency_king;
    }

    // Hydration master (5+ days with full hydration)
    const hydrationDays = weeklyData.filter(day => day.hydrationGlasses >= 8).length;
    if (hydrationDays >= 5) {
      bonus += POINT_SYSTEM.ACHIEVEMENT_BONUSES.hydration_master;
    }

    // Early bird (morning meals on 5+ days)
    const earlyBirdDays = weeklyData.filter(day => 
      day.mealTimes.some(time => {
        const hour = new Date(time).getHours();
        return hour >= 6 && hour <= 9;
      })
    ).length;
    if (earlyBirdDays >= 5) {
      bonus += POINT_SYSTEM.ACHIEVEMENT_BONUSES.early_bird;
    }

    return bonus;
  }

  // Generate badges based on performance
  static generateBadges(weeklyData: DailyMetrics[], streak: number, totalPoints: number): string[] {
    const badges: string[] = [];

    if (streak >= 7) badges.push("Consistency King 👑");
    else if (streak >= 5) badges.push("Strong Streak 🔥");
    else if (streak >= 3) badges.push("Building Momentum 💪");

    const avgHydration = weeklyData.reduce((sum, day) => sum + day.hydrationGlasses, 0) / weeklyData.length;
    if (avgHydration >= 8) badges.push("Hydration Hero 💧");

    const avgHealthScore = weeklyData.reduce((sum, day) => sum + day.healthScore, 0) / weeklyData.length;
    if (avgHealthScore >= 80) badges.push("Health Guru 🌟");
    else if (avgHealthScore >= 70) badges.push("Wellness Warrior ⚡");

    const consistentMeals = weeklyData.filter(day => day.mealsLogged >= 3).length;
    if (consistentMeals >= 6) badges.push("Meal Master 🍽️");

    if (totalPoints >= 1000) badges.push("Point Champion 🏆");
    else if (totalPoints >= 800) badges.push("High Achiever 🎯");

    return badges;
  }
}

// Hook to get current user's health metrics and calculate points
export function useUserHealthMetrics() {
  const { user } = useAuth();
  const { foodLogs, getDailyScore, getTodaysFoodLogs } = useFoodLogs();

  const getUserHealthMetrics = useCallback((): HealthMetrics => {
    console.log('🔍 Debug - getUserHealthMetrics called with:', { user: user?.firstName, foodLogsCount: foodLogs.length });
    
    if (!user) {
      console.log('⚠️ Debug - No user, returning empty metrics');
      return {
        dailyHealthScore: 0,
        mealsLogged: 0,
        hydrationGlasses: 0,
        weeklyData: []
      };
    }

    // Get current week's data (last 7 days)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6); // Last 7 days including today

    const weeklyData: DailyMetrics[] = [];

    console.log('🔍 Debug - Processing weekly data, foodLogs:', foodLogs.length);

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toDateString();

      const dayLogs = foodLogs.filter(log => 
        new Date(log.logged_at).toDateString() === dateStr
      );

      console.log(`🔍 Debug - Day ${i} (${dateStr}): ${dayLogs.length} logs`);

      const healthScore = dayLogs.length > 0 
        ? dayLogs.reduce((sum, log) => sum + log.health_score, 0) / dayLogs.length
        : 0;

      // Provide baseline hydration even when no food logs
      // If user has logged food, use random 6-10, otherwise assume basic 4 glasses
      const hydrationGlasses = dayLogs.length > 0 
        ? Math.floor(Math.random() * 4) + 6 // 6-10 glasses
        : (foodLogs.length > 0 ? 4 : 6); // Basic hydration for new users

      // Categorize foods (simplified categorization)
      const foodCategories = dayLogs.map(log => {
        const food = log.name.toLowerCase();
        if (food.includes('fruit') || food.includes('apple') || food.includes('banana')) return 'fruits';
        if (food.includes('vegetable') || food.includes('salad') || food.includes('broccoli')) return 'vegetables';
        if (food.includes('chicken') || food.includes('fish') || food.includes('meat')) return 'protein';
        if (food.includes('rice') || food.includes('bread') || food.includes('pasta')) return 'grains';
        if (food.includes('milk') || food.includes('yogurt') || food.includes('cheese')) return 'dairy';
        return 'other';
      });

      weeklyData.push({
        date: date.toISOString(),
        healthScore: Math.round(healthScore),
        mealsLogged: dayLogs.length,
        hydrationGlasses,
        mealTimes: dayLogs.map(log => log.logged_at),
        foodCategories
      });
    }

    console.log('🔍 Debug - Final weeklyData:', weeklyData);

    return {
      dailyHealthScore: getDailyScore(),
      mealsLogged: getTodaysFoodLogs().length,
      hydrationGlasses: weeklyData[weeklyData.length - 1]?.hydrationGlasses || 0,
      weeklyData
    };
  }, [user, foodLogs, getDailyScore, getTodaysFoodLogs]);

  const calculateUserPoints = useCallback((): UserPointsData => {
    if (!user) {
      return {
        userId: '',
        name: 'Unknown User',
        totalPoints: 0,
        dailyAverage: 0,
        streak: 0,
        badges: [],
        pointsBreakdown: {
          baseHealthScore: 0,
          consistencyBonus: 0,
          hydrationBonus: 0,
          streakMultiplier: 1.0,
          achievementBonus: 0
        },
        trend: 'same',
        weeklyProgress: [],
        isCurrentUser: true
      };
    }

    const metrics = getUserHealthMetrics();
    
    console.log('🔍 Debug - Metrics received:', metrics);
    
    // Calculate points for each day
    const dailyPoints = metrics.weeklyData.map(day => {
      const points = HealthPointCalculator.calculateDailyPoints(day);
      console.log(`🔍 Debug - Day ${day.date.split('T')[0]}: ${points} points (meals: ${day.mealsLogged}, health: ${day.healthScore})`);
      return points;
    });

    console.log('🔍 Debug - Daily points array:', dailyPoints);

    const baseWeeklyPoints = dailyPoints.reduce((sum, points) => sum + points, 0);
    const streak = HealthPointCalculator.calculateStreak(metrics.weeklyData);
    const streakMultiplier = HealthPointCalculator.getStreakMultiplier(streak);
    const achievementBonus = HealthPointCalculator.calculateAchievementBonuses(metrics.weeklyData, streak);
    
    const totalPoints = Math.round(baseWeeklyPoints * streakMultiplier + achievementBonus);
    const badges = HealthPointCalculator.generateBadges(metrics.weeklyData, streak, totalPoints);

    console.log('🔍 Debug - Final calculated points:', {
      baseWeeklyPoints,
      streak,
      streakMultiplier,
      achievementBonus,
      totalPoints,
      badges,
      weeklyDataLength: metrics.weeklyData.length
    });

    return {
      userId: user.id || 'current_user',
      name: user.firstName || 'You',
      totalPoints,
      dailyAverage: Math.round(totalPoints / 7),
      streak,
      badges,
      pointsBreakdown: {
        baseHealthScore: baseWeeklyPoints,
        consistencyBonus: Math.round(baseWeeklyPoints * 0.1), // Approximate
        hydrationBonus: Math.round(baseWeeklyPoints * 0.15), // Approximate
        streakMultiplier,
        achievementBonus
      },
      trend: totalPoints > 800 ? 'up' : totalPoints > 500 ? 'same' : 'down',
      weeklyProgress: dailyPoints,
      isCurrentUser: true
    };
  }, [user, getUserHealthMetrics]);

  return {
    getUserHealthMetrics,
    calculateUserPoints
  };
}