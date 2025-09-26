import React from 'react';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../contexts/AuthContext';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view the leaderboard</h2>
          <p className="text-gray-600">Join the competition and track your health journey!</p>
        </div>
      </div>
    );
  }

  return <Leaderboard />;
};

export default LeaderboardPage;