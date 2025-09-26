import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, User, Heart, Target, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useFoodLogs } from "@/hooks/useFoodLogs";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  health_conditions: string[];
  dietary_goals: string;
  weekly_target: number;
  daily_meal_target: number;
}

const healthConditions = [
  "Diabetes", "High Blood Pressure", "High Cholesterol", 
  "Heart Disease", "Allergies", "Gluten Intolerance", 
  "Lactose Intolerance", "None"
];

export function Profile() {
  const { user } = useAuth();
  const { getDailyScore, getTodaysFoodLogs, foodLogs } = useFoodLogs();
  const [profile, setProfile] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
    health_conditions: [],
    dietary_goals: "",
    weekly_target: 70,
    daily_meal_target: 3
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const response = await profileAPI.get();
      const data = response.data;
      setProfile({
        first_name: data.user_metadata?.first_name || user.firstName || "",
        last_name: data.user_metadata?.last_name || user.lastName || "",
        email: user.email || "",
        health_conditions: data.health_conditions || [],
        dietary_goals: data.dietary_goals || "",
        weekly_target: data.weekly_target ?? 70,
        daily_meal_target: data.daily_meal_target ?? 3
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await profileAPI.update({
        user_metadata: {
          first_name: profile.first_name,
          last_name: profile.last_name
        },
        health_conditions: profile.health_conditions,
        dietary_goals: profile.dietary_goals,
        weekly_target: profile.weekly_target,
        daily_meal_target: profile.daily_meal_target
      } as any);

      toast.success("✅ Profile updated successfully! 🎉");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("⚠️ Profile update failed — please try again 🔄");
    } finally {
      setSaving(false);
    }
  };

  const toggleHealthCondition = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(condition)
        ? prev.health_conditions.filter(c => c !== condition)
        : [...prev.health_conditions, condition]
    }));
  };

  const todayLogs = getTodaysFoodLogs();
  const dailyScore = getDailyScore();
  const totalMeals = foodLogs.length;
  const averageScore = totalMeals > 0 ? Math.round(foodLogs.reduce((sum, log) => sum + log.health_score, 0) / totalMeals) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4 animate-float">👤</div>
          <h2 className="text-2xl font-bold mb-2">Loading Your Profile...</h2>
          <p className="text-muted-foreground">Getting your health data ready ⚡</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-hero border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-float">👤</div>
            <div>
              <h2 className="text-2xl font-bold">Your Health Profile</h2>
              <p className="text-muted-foreground">
                Update your preferences, goals, and health information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">🔋</div>
            <p className="text-2xl font-bold text-primary">{dailyScore}%</p>
            <p className="text-sm text-muted-foreground">Today's Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-2xl font-bold text-primary">{totalMeals}</p>
            <p className="text-sm text-muted-foreground">Total Meals Logged</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-2xl font-bold text-primary">{averageScore}%</p>
            <p className="text-sm text-muted-foreground">Average Health Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Health Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {healthConditions.map((condition) => (
                <Badge
                  key={condition}
                  variant={profile.health_conditions.includes(condition) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleHealthCondition(condition)}
                >
                  {condition}
                  {profile.health_conditions.includes(condition) && " ✓"}
                </Badge>
              ))}
            </div>
            {profile.health_conditions.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Selected conditions help us provide better food recommendations for your health needs.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals & Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Health Goals & Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dietary_goals">Dietary Goals</Label>
              <Textarea
                id="dietary_goals"
                value={profile.dietary_goals}
                onChange={(e) => setProfile(prev => ({ ...prev, dietary_goals: e.target.value }))}
                placeholder="e.g., Lose weight, build muscle, eat more vegetables..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekly_target">Weekly Health Target (%)</Label>
                <Input
                  id="weekly_target"
                  type="number"
                  min="0"
                  max="100"
                  value={profile.weekly_target}
                  onChange={(e) => setProfile(prev => ({ ...prev, weekly_target: parseInt(e.target.value) || 70 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="daily_meal_target">Daily Meals Target</Label>
                <Input
                  id="daily_meal_target"
                  type="number"
                  min="1"
                  max="6"
                  value={profile.daily_meal_target}
                  onChange={(e) => setProfile(prev => ({ ...prev, daily_meal_target: parseInt(e.target.value) || 3 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress Insights 📈</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">🎯 Today's Progress</span>
                <span className="text-lg font-bold text-primary">
                  {todayLogs.length}/{profile.daily_meal_target} meals
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">📊 Health Score vs Target</span>
                <span className={`text-lg font-bold ${dailyScore >= profile.weekly_target ? 'text-battery-high' : 'text-battery-medium'}`}>
                  {dailyScore}% / {profile.weekly_target}%
                </span>
              </div>
              
              <div className="p-3 bg-gradient-hero rounded-lg">
                <p className="text-sm text-center font-medium">
                  {dailyScore >= profile.weekly_target 
                    ? "🎉 You're hitting your health targets! Keep it up!" 
                    : "💪 You're on your way! Every healthy choice counts!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Button 
              size="lg" 
              onClick={handleSave}
              disabled={saving}
              className="min-w-48"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  💾 Save Profile Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}