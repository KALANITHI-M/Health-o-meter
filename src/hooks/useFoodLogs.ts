import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { foodLogAPI } from '@/lib/api';

export interface FoodItem {
  id?: string;
  name: string;
  meal_type: 'morning' | 'afternoon' | 'evening';
  health_score: number;
  logged_at: string;
}

export function useFoodLogs() {
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateHealthScore = (foodName: string): number => {
 const healthyFoods = [
  // Existing
  'salad', 'fruit', 'vegetable', 'nuts', 'yogurt', 'fish', 'chicken', 'quinoa', 'oats', 'smoothie',
  'apple', 'banana', 'broccoli', 'spinach', 'kale', 'avocado', 'berries', 'salmon', 'tuna',

  // Indian healthy foods
  'idli', 'dosa', 'upma', 'poha', 'dal', 'sambar', 'rasam', 'roti', 'chapati',
  'brown rice', 'curd', 'buttermilk', 'sprouts', 'moong dal', 'rajma', 'chole', 'green gram', 'millets',
  'ragi', 'bajra', 'jowar', 'khichdi', 'vegetable pulao', 'lemon rice', 'cabbage curry', 'palak paneer',
  'bhindi', 'lauki', 'tinda', 'methi thepla', 'handvo', 'undhiyu',

  // Global extras
  'boiled egg', 'grilled chicken', 'tofu', 'paneer', 'mushrooms', 'lentil soup', 'vegetable soup',
  'hummus', 'chickpeas', 'edamame', 'brown bread', 'whole wheat pasta', 'sweet potato'
];

const unhealthyFoods = [
  // Existing
  'pizza', 'burger', 'fries', 'candy', 'soda', 'ice cream', 'cake', 'chips', 'donut', 'cookies',

  // Indian unhealthy foods
  'samosa', 'kachori', 'pakora', 'jalebi', 'gulab jamun', 'rasgulla', 'laddu', 'barfi', 'pav bhaji',
  'vada pav', 'pani puri', 'sev puri', 'bhel puri', 'chole bhature', 'naan with butter', 'paratha',
  'malai kofta', 'paneer butter masala', 'butter chicken', 'fried rice', 'chowmein ', 
  'puri', 'halwa', 'mysore pak',

  // Global extras
  'hotdog', 'fried chicken', 'nachos', 'tacos (fried)', 'milkshake', 'energy drink', 'alcohol', 'processed meat',
  'cheese burst pizza', 'deep fried snacks', 'popcorn (buttery)', 'chocolate bar'
];

    const name = foodName.toLowerCase();
    
    if (healthyFoods.some(food => name.includes(food))) {
      return Math.floor(Math.random() * 25) + 70; // 70-95%
    } else if (unhealthyFoods.some(food => name.includes(food))) {
      return Math.floor(Math.random() * 35) + 20; // 20-55%
    } else {
      return Math.floor(Math.random() * 30) + 50; // 50-80%
    }
  };

  const getCurrentMealType = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const logFood = async (foodName: string, mealType?: 'morning' | 'afternoon' | 'evening') => {
    if (!user) return;
    
    const meal = mealType || getCurrentMealType();
    const healthScore = calculateHealthScore(foodName);
    
    try {
      await foodLogAPI.create(foodName, meal, healthScore);

      const newFood: FoodItem = {
        name: foodName,
        meal_type: meal,
        health_score: healthScore,
        logged_at: new Date().toISOString()
      };

      setFoodLogs(prev => [...prev, newFood]);
      
      const emoji = healthScore >= 70 ? '🔋⚡' : healthScore >= 50 ? '⚡' : '⚠️';
      toast.success(`${foodName} logged! ${emoji} ${healthScore >= 70 ? '+' : ''}${healthScore - 50}% health impact`);

      // Notify other hook instances to refresh
      window.dispatchEvent(new CustomEvent('foodlogs:updated'));
      
      return { success: true, healthScore };
    } catch (error) {
      toast.error('⚠️ Failed to log food, please try again 🔄.');
      return { success: false, error };
    }
  };

  const getTodaysFoodLogs = () => {
    const today = new Date().toDateString();
    return foodLogs.filter(log => new Date(log.logged_at).toDateString() === today);
  };

  const getDailyScore = () => {
    const todayLogs = getTodaysFoodLogs();
    if (todayLogs.length === 0) return 0;
    
    const average = todayLogs.reduce((sum, log) => sum + log.health_score, 0) / todayLogs.length;
    return Math.round(average);
  };

  const getPeriodScore = (period: 'morning' | 'afternoon' | 'evening') => {
    const todayLogs = getTodaysFoodLogs();
    const periodLogs = todayLogs.filter(log => log.meal_type === period);
    
    if (periodLogs.length === 0) return 0;
    const average = periodLogs.reduce((sum, log) => sum + log.health_score, 0) / periodLogs.length;
    return Math.round(average);
  };

  const hasPeriodLogs = (period: 'morning' | 'afternoon' | 'evening') => {
    const todayLogs = getTodaysFoodLogs();
    return todayLogs.some(log => log.meal_type === period);
  };

  const fetchFoodLogs = async () => {
    if (!user) return;
    
    try {
      const response = await foodLogAPI.getAll();
      setFoodLogs(response.data);
    } catch (error) {
      console.error('Error fetching food logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodLogs();
  }, [user]);

  // Listen for food logs updates and refresh
  useEffect(() => {
    const handleFoodLogsUpdate = () => {
      fetchFoodLogs();
    };
    
    window.addEventListener('foodlogs:updated', handleFoodLogsUpdate);
    return () => window.removeEventListener('foodlogs:updated', handleFoodLogsUpdate);
  }, [user]);

  return {
    foodLogs,
    loading,
    logFood,
    getTodaysFoodLogs,
    getDailyScore,
    getPeriodScore,
    hasPeriodLogs,
    getCurrentMealType
  };
}