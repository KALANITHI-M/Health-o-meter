import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Crown, Medal, Award, Users, Share2, Loader2, Star } from 'lucide-react';
import { leaderboardApi, leaderboardUtils, type LeaderboardUser, type LeaderboardStats } from '@/lib/leaderboard-api';
import { useUserHealthMetrics, type UserPointsData } from '@/lib/user-points';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const { user: currentUser } = useAuth();
  const { calculateUserPoints } = useUserHealthMetrics();

  // Load leaderboard data on component mount
  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Get base leaderboard data and stats
        const [leaderboardData, statsData] = await Promise.all([
          leaderboardApi.getWeeklyLeaderboard(),
          leaderboardApi.getLeaderboardStats()
        ]);
        
        // Calculate current user's points
        let finalUsers = [...leaderboardData];
        
        if (currentUser) {
          const userPointsData = calculateUserPoints();
          console.log('🔍 Debug - Current user points data:', userPointsData);
          console.log('🔍 Debug - Current user:', currentUser);
          
          // Convert to leaderboard format
          const currentUserLeaderboardData: LeaderboardUser = {
            rank: 0, // Will be calculated after sorting
            name: userPointsData.name,
            streak: `🔥 ${userPointsData.streak} days`,
            points: userPointsData.totalPoints,
            badge: userPointsData.badges[0] || "Health Enthusiast 🌟",
            highlight: undefined,
            userId: userPointsData.userId,
            isCurrentUser: true
          };
          
          // Remove any existing current user entry and add the real one
          finalUsers = finalUsers.filter(u => u.userId !== currentUser.id);
          finalUsers.push(currentUserLeaderboardData);
          
          // Sort by points and assign ranks
          finalUsers.sort((a, b) => b.points - a.points);
          finalUsers = finalUsers.map((user, index) => {
            const rank = index + 1;
            let highlight: 'gold' | 'silver' | 'bronze' | undefined;
            
            if (rank === 1) highlight = 'gold';
            else if (rank === 2) highlight = 'silver';
            else if (rank === 3) highlight = 'bronze';
            
            return { ...user, rank, highlight };
          });
        }
        
        setUsers(finalUsers);
        setStats(statsData);
        
        // Show personalized message based on user's rank
        if (currentUser) {
          const userRank = finalUsers.find(u => u.isCurrentUser)?.rank;
          if (userRank === 1) {
            toast.success('👑 Congratulations! You\'re leading the leaderboard!');
          } else if (userRank && userRank <= 3) {
            toast.success(`🏆 Amazing! You're in ${userRank === 2 ? '2nd' : '3rd'} place!`);
          } else if (userRank && userRank <= 5) {
            toast.success('🔥 Great job! You\'re in the top 5!');
          } else {
            toast.success('🌟 Leaderboard updated with your real progress!');
          }
        }
        
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [currentUser?.id]); // Only depend on user ID, not the function

  // Update reset timer
  useEffect(() => {
    const updateTimer = () => {
      const { days, hours, minutes } = leaderboardUtils.getTimeUntilReset();
      
      if (days > 0) {
        setTimeUntilReset(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeUntilReset(`${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number, highlight?: string) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-500" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</div>;
    }
  };

  const getRankStyles = (highlight?: string) => {
    switch (highlight) {
      case 'gold':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg';
      case 'silver':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-md';
      case 'bronze':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 shadow-md';
      default:
        return 'bg-white border-gray-200 hover:shadow-md';
    }
  };

  const maxPoints = users.length > 0 ? Math.max(...users.map(u => u.points)) : 100;

  const handleInviteFriends = () => {
    const userName = users.find(u => u.rank === 1)?.name || 'HealthHero';
    const inviteLink = leaderboardApi.generateInviteLink(userName);
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success('📋 Invite link copied to clipboard!');
    }).catch(() => {
      toast.info(`Share this link: ${inviteLink}`);
    });
  };

  const handleViewBadges = () => {
    // Navigate to badges page - you can update this to use your routing
    toast.info('🏅 Badges page coming soon!');
    // Example: navigate('/badges') or setActiveTab('achievements')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Weekly Leaderboard 🏆</h1>
          </div>
          <p className="text-gray-600 text-lg mb-2">Resets Every Monday</p>
          <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border">
            <span className="text-sm text-gray-600">Next reset in: </span>
            <span className="ml-2 font-semibold text-green-600">{timeUntilReset}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && (
          <div className="space-y-3 mb-8">
            {users.map((user, index) => (
            <Card 
              key={user.rank} 
              className={`transition-all duration-300 hover:scale-[1.02] ${getRankStyles(user.highlight)} ${
                user.isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left section - Rank and User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(user.rank, user.highlight)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-xl font-bold truncate ${
                          user.isCurrentUser ? 'text-blue-600' : 'text-gray-800'
                        }`}>
                          {user.name}
                          {user.isCurrentUser && <span className="ml-2 text-sm">(You)</span>}
                        </h3>
                        {user.rank <= 3 && (
                          <div className="flex-shrink-0">
                            {user.rank === 1 && <span className="text-2xl">🥇</span>}
                            {user.rank === 2 && <span className="text-2xl">🥈</span>}
                            {user.rank === 3 && <span className="text-2xl">🥉</span>}
                          </div>
                        )}
                        {user.isCurrentUser && (
                          <Star className="w-5 h-5 text-blue-500 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm font-medium text-gray-600">
                          {user.streak}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {user.badge}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right section - Points and Progress */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {user.points}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                    
                    <div className="w-24">
                      <Progress 
                        value={(user.points / maxPoints) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleInviteFriends}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              ➕ Invite Friends
            </Button>
            
            <Button 
              onClick={handleViewBadges}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              size="lg"
            >
              <Award className="w-5 h-5 mr-2" />
              🏅 View Badges
            </Button>
          </div>

          {/* Stats Summary */}
          {!loading && stats && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">{stats.longestStreak}</div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;