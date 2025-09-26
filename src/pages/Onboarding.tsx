import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '@/lib/api';

const goalOptions = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'healthy_lifestyle', label: 'Healthy Lifestyle' },
];

export default function Onboarding() {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('light');
  const [goals, setGoals] = useState<string[]>([]);
  const [hydrationTarget, setHydrationTarget] = useState<string>('8');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const toggleGoal = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        age: age ? Number(age) : undefined as any,
        weightKg: weight ? Number(weight) : undefined as any,
        heightCm: height ? Number(height) : undefined as any,
        activityLevel: activity as any,
        goals: goals as any,
        hydrationTargetGlasses: hydrationTarget ? Number(hydrationTarget) : undefined as any,
      } as any);
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="bg-gradient-hero border-primary/20">
        <CardHeader>
          <CardTitle>Welcome! Let’s personalize your journey 🌱</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Age</Label>
              <Input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" min="1" max="1000" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input type="number" min="30" max="300" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Activity Level</Label>
            <Select value={activity} onValueChange={(v) => setActivity(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="very_active">Very Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Goals</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {goalOptions.map(g => (
                <Badge
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  variant={goals.includes(g.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                >
                  {g.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Hydration Target (glasses/day)</Label>
            <Input type="number" min="1" max="20" value={hydrationTarget} onChange={(e) => setHydrationTarget(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


