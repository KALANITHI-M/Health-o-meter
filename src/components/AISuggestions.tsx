import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lightbulb, RefreshCw, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFoodLogs } from '@/hooks/useFoodLogs';

interface Suggestion {
  id: string;
  type: 'nutrition' | 'hydration' | 'exercise' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const AISuggestions: React.FC = () => {
  const { user } = useAuth();
  const { foodLogs, getTodaysFoodLogs } = useFoodLogs();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get AI-powered suggestions
  const fetchAISuggestions = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching AI suggestions...');
      
      // Get user's recent food logs and health data
      const userData = getUserHealthData();
      
      // Generate personalized suggestions using Gemini AI
      const aiSuggestions = await generatePersonalizedSuggestions(userData);
      
      setSuggestions(aiSuggestions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError('Unable to fetch AI suggestions. Using fallback suggestions.');
      
      // Fallback to intelligent offline suggestions
      const fallbackSuggestions = generateFallbackSuggestions();
      setSuggestions(fallbackSuggestions);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Get user's health data for context using existing hooks
  const getUserHealthData = () => {
    try {
      // Use data from hooks that are already loaded
      const todaysFoodLogs = getTodaysFoodLogs();
      const recentFoodLogs = foodLogs.slice(-5); // Last 5 food entries
      
      return {
        recentFoods: recentFoodLogs,
        todaysFoods: todaysFoodLogs,
        profile: user || {}, // Use user from auth context
        currentTime: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };
    } catch (error) {
      console.error('Error getting user health data:', error);
      return {
        recentFoods: [],
        todaysFoods: [],
        profile: {},
        currentTime: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };
    }
  };

  // Generate personalized suggestions using Gemini AI
  const generatePersonalizedSuggestions = async (userData: any): Promise<Suggestion[]> => {
    try {
      const prompt = createPersonalizedPrompt(userData);
      console.log('🤖 Sending AI request with prompt:', prompt.substring(0, 200) + '...');
      
      // Use fixed port for now since server is running on 5050
      const response = await fetch('http://localhost:5050/api/ai/health-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: prompt,
          type: 'suggestions'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error response:', errorText);
        throw new Error(`AI API responded with status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🤖 AI response received:', data.response);
      
      if (data.fallback) {
        console.log('📋 Using fallback suggestions due to API limits');
      }
      
      return parseAISuggestions(data.response);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      throw error;
    }
  };

  // Create context-aware prompt for Gemini
  const createPersonalizedPrompt = (userData: any) => {
    const { recentFoods, todaysFoods, profile, currentTime, dayOfWeek } = userData;
    const timeOfDay = getTimeOfDay(currentTime);
    const dayName = getDayName(dayOfWeek);
    
    const recentFoodNames = recentFoods.map((f: any) => f.foodName || f.name || f.food_name).filter(Boolean);
    const todaysFoodNames = todaysFoods.map((f: any) => f.foodName || f.name || f.food_name).filter(Boolean);
    
    let prompt = `As a health AI assistant, provide 3-4 personalized health suggestions for this user.
    
Current context:
- Time: ${timeOfDay} on ${dayName}
- Today's foods: ${todaysFoodNames.join(', ') || 'No meals logged today'}
- Recent foods: ${recentFoodNames.join(', ') || 'No recent logs'}
- User: ${profile.firstName || 'Health Hero'}

Please provide suggestions in this exact format:
NUTRITION: [Brief nutrition tip based on recent foods and time of day]
HYDRATION: [Hydration reminder based on time of day]
EXERCISE: [Exercise suggestion appropriate for current time]
GENERAL: [General wellness tip based on eating patterns]

Keep each suggestion under 50 words and actionable.`;

    return prompt;
  };

  // Parse AI response into structured suggestions
  const parseAISuggestions = (aiResponse: string): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      if (line.includes('NUTRITION:')) {
        suggestions.push({
          id: `nutrition-${Date.now()}`,
          type: 'nutrition',
          title: 'Nutrition Tip',
          description: line.replace('NUTRITION:', '').trim(),
          priority: 'high',
          timestamp: new Date()
        });
      } else if (line.includes('HYDRATION:')) {
        suggestions.push({
          id: `hydration-${Date.now()}`,
          type: 'hydration',
          title: 'Hydration Reminder',
          description: line.replace('HYDRATION:', '').trim(),
          priority: 'medium',
          timestamp: new Date()
        });
      } else if (line.includes('EXERCISE:')) {
        suggestions.push({
          id: `exercise-${Date.now()}`,
          type: 'exercise',
          title: 'Activity Suggestion',
          description: line.replace('EXERCISE:', '').trim(),
          priority: 'medium',
          timestamp: new Date()
        });
      } else if (line.includes('GENERAL:')) {
        suggestions.push({
          id: `general-${Date.now()}`,
          type: 'general',
          title: 'Wellness Tip',
          description: line.replace('GENERAL:', '').trim(),
          priority: 'low',
          timestamp: new Date()
        });
      }
    });

    // If parsing fails, create a single general suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        id: `general-${Date.now()}`,
        type: 'general',
        title: 'AI Health Tip',
        description: aiResponse.slice(0, 100) + (aiResponse.length > 100 ? '...' : ''),
        priority: 'medium',
        timestamp: new Date()
      });
    }

    return suggestions;
  };

  // Generate intelligent fallback suggestions when AI is unavailable
  const generateFallbackSuggestions = (): Suggestion[] => {
    const currentHour = new Date().getHours();
    const suggestions: Suggestion[] = [];

    // Time-based suggestions
    if (currentHour < 10) {
      suggestions.push({
        id: 'morning-nutrition',
        type: 'nutrition',
        title: 'Morning Nutrition',
        description: 'Start your day with protein and fiber! Try oatmeal with berries and nuts.',
        priority: 'high',
        timestamp: new Date()
      });
    } else if (currentHour < 14) {
      suggestions.push({
        id: 'midday-hydration',
        type: 'hydration',
        title: 'Midday Hydration Check',
        description: 'Have you had enough water this morning? Aim for 2-3 glasses by now.',
        priority: 'medium',
        timestamp: new Date()
      });
    } else if (currentHour < 18) {
      suggestions.push({
        id: 'afternoon-energy',
        type: 'exercise',
        title: 'Afternoon Energy Boost',
        description: 'Take a 10-minute walk or do some stretches to combat afternoon fatigue.',
        priority: 'medium',
        timestamp: new Date()
      });
    } else {
      suggestions.push({
        id: 'evening-wellness',
        type: 'general',
        title: 'Evening Wind Down',
        description: 'Prepare for good sleep by avoiding screens 1 hour before bedtime.',
        priority: 'low',
        timestamp: new Date()
      });
    }

    // Add universal suggestions
    suggestions.push({
      id: 'daily-movement',
      type: 'exercise',
      title: 'Daily Movement',
      description: 'Aim for at least 30 minutes of movement today, even if it\'s just walking.',
      priority: 'medium',
      timestamp: new Date()
    });

    return suggestions.slice(0, 3); // Return max 3 suggestions
  };

  // Helper functions
  const getTimeOfDay = (hour: number) => {
    if (hour < 6) return 'early morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return '🍎';
      case 'hydration': return '💧';
      case 'exercise': return '🏃';
      case 'general': return '💡';
      default: return '📝';
    }
  };

  // Load suggestions on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAISuggestions();
    }
  }, [user]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Health Suggestions
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAISuggestions}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="text-sm text-orange-600 mb-3 p-2 bg-orange-50 rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                      <span className="font-medium text-sm">{suggestion.title}</span>
                      <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                <Clock className="h-3 w-3" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
        
        {!loading && suggestions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No suggestions available at the moment.</p>
            <Button 
              variant="outline" 
              onClick={fetchAISuggestions}
              className="mt-2"
            >
              Generate Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestions;