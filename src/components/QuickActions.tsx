import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileAPI } from '@/lib/api';

export function QuickActions() {
  const [sleep, setSleep] = useState<string>('');
  const [workoutMin, setWorkoutMin] = useState<string>('');
  const [workoutType, setWorkoutType] = useState<'walk'|'run'|'strength'|'yoga'|'cycling'|'none'>('walk');
  const [saving, setSaving] = useState<boolean>(false);

  const save = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        lastSleepHours: sleep ? Number(sleep) : undefined as any,
        lastWorkoutMinutes: workoutMin ? Number(workoutMin) : undefined as any,
        lastWorkoutType: workoutType as any,
      } as any);
      window.dispatchEvent(new CustomEvent('profile:updated'));
      setSleep('');
      setWorkoutMin('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions ⚡</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs">Sleep (hours)</label>
            <Input type="number" min="0" max="24" value={sleep} onChange={(e) => setSleep(e.target.value)} />
          </div>
          <div>
            <label className="text-xs">Workout (minutes)</label>
            <Input type="number" min="0" max="300" value={workoutMin} onChange={(e) => setWorkoutMin(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['walk','run','strength','yoga','cycling'] as const).map(t => (
            <Button key={t} type="button" size="sm" variant={workoutType===t?'default':'outline'} onClick={() => setWorkoutType(t)}>
              {t}
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}


