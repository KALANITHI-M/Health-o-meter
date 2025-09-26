// Mock leaderboard API service
// This can be replaced with real API calls to your backend

export interface LeaderboardUser {
  rank: number;
  name: string;
  streak: string;
  points: number;
  badge: string;
  highlight?: 'gold' | 'silver' | 'bronze';
  avatar?: string;
  userId?: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardStats {
  totalUsers: number;
  totalPoints: number;
  longestStreak: number;
  weekStartDate: string;
  weekEndDate: string;
}

// Mock data - replace with actual API calls
const mockLeaderboardData: LeaderboardUser[] = [
  {
    rank: 1,
    name: "Kali",
    streak: "🔥 7 days",
    points: 150,
    badge: "Consistency King 👑",
    highlight: "gold",
    userId: "user_1"
  },
  {
    rank: 2,
    name: "Haritha",
    streak: "🔥 6 days",
    points: 140,
    badge: "Early Bird 🌅",
    highlight: "silver",
    userId: "user_2"
  },
  {
    rank: 3,
    name: "Kala",
    streak: "🔥 6 days",
    points: 130,
    badge: "Challenger 💪",
    highlight: "bronze",
    userId: "user_3"
  },
  {
    rank: 4,
    name: "Priya",
    streak: "🔥 5 days",
    points: 110,
    badge: "Water Hero 💧",
    userId: "user_4"
  },
  {
    rank: 5,
    name: "Haris",
    streak: "🔥 4 days",
    points: 90,
    badge: "Starter Pack 🚀",
    userId: "user_5"
  }
];

// Simulated API functions
export const leaderboardApi = {
  // Get current week's leaderboard
  async getWeeklyLeaderboard(): Promise<LeaderboardUser[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would make an HTTP request
    // return await fetch('/api/leaderboard/weekly').then(res => res.json());
    
    return mockLeaderboardData;
  },

  // Get leaderboard statistics
  async getLeaderboardStats(): Promise<LeaderboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalUsers = mockLeaderboardData.length;
    const totalPoints = mockLeaderboardData.reduce((sum, user) => sum + user.points, 0);
    const longestStreak = Math.max(...mockLeaderboardData.map(u => 
      parseInt(u.streak.match(/\d+/)?.[0] || '0')
    ));
    
    // Calculate this week's Monday and Sunday
    const now = new Date();
    const monday = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(now.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      totalUsers,
      totalPoints,
      longestStreak,
      weekStartDate: monday.toISOString(),
      weekEndDate: sunday.toISOString()
    };
  },

  // Get user's current rank and position
  async getUserRank(userId: string): Promise<LeaderboardUser | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const user = mockLeaderboardData.find(u => u.userId === userId);
    return user || null;
  },

  // Submit user's weekly score (called when week ends)
  async submitWeeklyScore(userId: string, points: number, streak: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real implementation, this would update the backend
    // return await fetch('/api/leaderboard/submit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, points, streak })
    // }).then(res => res.ok);
    
    console.log(`Submitting score for user ${userId}: ${points} points, ${streak} day streak`);
    return true;
  },

  // Generate invite link for sharing
  generateInviteLink(userName: string): string {
    const baseUrl = window.location.origin;
    const inviteCode = btoa(`${userName}_${Date.now()}`).substring(0, 10);
    return `${baseUrl}/join?invite=${inviteCode}&ref=${encodeURIComponent(userName)}`;
  }
};

// Helper functions for leaderboard logic
export const leaderboardUtils = {
  // Calculate points based on daily health scores
  calculateWeeklyPoints(dailyScores: number[]): number {
    const basePoints = dailyScores.reduce((sum, score) => sum + score, 0);
    const consistencyBonus = dailyScores.length >= 7 ? 20 : 0;
    const perfectDaysBonus = dailyScores.filter(score => score >= 90).length * 5;
    
    return Math.round(basePoints + consistencyBonus + perfectDaysBonus);
  },

  // Determine badge based on performance
  getBadgeForPerformance(points: number, streak: number, rank: number): string {
    if (rank === 1) return "Consistency King 👑";
    if (rank === 2) return "Early Bird 🌅";
    if (rank === 3) return "Challenger 💪";
    if (streak >= 7) return "Week Warrior ⚔️";
    if (points >= 120) return "Point Master 💎";
    if (streak >= 5) return "Streak Builder 🔥";
    if (points >= 100) return "Water Hero 💧";
    return "Starter Pack 🚀";
  },

  // Format streak display
  formatStreak(days: number): string {
    if (days === 0) return "Start today! 🌱";
    if (days === 1) return "🔥 1 day";
    return `🔥 ${days} days`;
  },

  // Calculate time until next Monday reset
  getTimeUntilReset(): { days: number; hours: number; minutes: number; totalMinutes: number } {
    const now = new Date();
    const nextMonday = new Date();
    const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
    
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    const timeDiff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const totalMinutes = Math.floor(timeDiff / (1000 * 60));
    
    return { days, hours, minutes, totalMinutes };
  }
};