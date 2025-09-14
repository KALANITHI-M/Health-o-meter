import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Utensils } from 'lucide-react';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { cn } from '@/lib/utils';

export function FoodLogging() {
  const [foodInput, setFoodInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const { logFood, getCurrentMealType, hasPeriodLogs } = useFoodLogs();

  const getCurrentHour = () => new Date().getHours();
  
  const isMealTimeActive = (meal: 'morning' | 'afternoon' | 'evening') => {
    const hour = getCurrentHour();
    const hasLogged = hasPeriodLogs(meal);
    
    switch (meal) {
      case 'morning':
        return hour >= 6 && hour < 12 && !hasLogged;
      case 'afternoon':
        return hour >= 12 && hour < 17 && !hasLogged;
      case 'evening':
        return hour >= 17 && !hasLogged;
      default:
        return false;
    }
  };

  const getMealEmoji = (meal: 'morning' | 'afternoon' | 'evening') => {
    switch (meal) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
    }
  };

  const getMealStatus = (meal: 'morning' | 'afternoon' | 'evening') => {
    const hasLogged = hasPeriodLogs(meal);
    const isActive = isMealTimeActive(meal);
    
    if (hasLogged) return { text: 'Logged ✅', variant: 'default' as const };
    if (isActive) return { text: 'Log Now! ⚡', variant: 'default' as const };
    return { text: 'Not Time Yet ⏰', variant: 'secondary' as const };
  };

  const handleLogFood = async () => {
    if (!foodInput.trim()) {
      return;
    }

    const mealType = selectedMeal || getCurrentMealType();
    const result = await logFood(foodInput.trim(), mealType);
    
    if (result?.success) {
      setFoodInput('');
      setSelectedMeal(null);
    }
  };

  const meals: Array<'morning' | 'afternoon' | 'evening'> = ['morning', 'afternoon', 'evening'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Log Your Food 🍽️
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          ✨ Buttons adapt to time of day! Log food to see your health impact.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Time Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {meals.map((meal) => {
            const isActive = isMealTimeActive(meal);
            const status = getMealStatus(meal);
            
            return (
              <Button
                key={meal}
                variant={selectedMeal === meal ? 'default' : isActive ? 'outline' : 'secondary'}
                size="sm"
                disabled={!isActive && !selectedMeal}
                onClick={() => setSelectedMeal(selectedMeal === meal ? null : meal)}
                className={cn(
                  "flex flex-col h-auto p-3 gap-1",
                  isActive && "ring-2 ring-primary/50 animate-pulse"
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg">{getMealEmoji(meal)}</span>
                  <span className="text-xs font-medium capitalize">{meal}</span>
                </div>
                <Badge variant={status.variant} className="text-xs px-1 py-0 h-4">
                  {status.text}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Food Input */}
        <div className="flex gap-2">
          <Input
            placeholder="🍎 Enter food name..."
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogFood()}
            className="flex-1"
          />
          <Button 
            onClick={handleLogFood}
            disabled={!foodInput.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Time Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            Current time: {new Date().toLocaleTimeString()} • 
            Active meal: {getMealEmoji(getCurrentMealType())} {getCurrentMealType()}
          </span>
        </div>

        {/* Tips */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          💡 <strong>Pro tip:</strong> Morning button works 6AM-12PM, Afternoon 12PM-5PM, Evening after 5PM. 
          Buttons turn off after logging! You can always override by selecting a different meal time.
        </div>
      </CardContent>
    </Card>
  );
}