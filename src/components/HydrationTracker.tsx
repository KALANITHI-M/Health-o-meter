import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { profileAPI } from '@/lib/api';

export function HydrationTracker() {
  const [target, setTarget] = useState<number>(8);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchHydration = async () => {
    try {
      const res = await profileAPI.get();
      const data = res.data as any;
      setTarget(data.hydration_target_glasses ?? 8);
      setProgress(data.hydration_progress_glasses ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHydration();
  }, []);

  const updateProgress = async (next: number) => {
    setSaving(true);
    try {
      setProgress(next);
      await profileAPI.update({ hydrationProgressGlasses: next } as any);
      window.dispatchEvent(new CustomEvent('profile:updated', { detail: { hydrationProgressGlasses: next } }));
    } finally {
      setSaving(false);
    }
  };

  const inc = () => {
    const next = Math.min(target, progress + 1);
    if (next !== progress) updateProgress(next);
  };

  const dec = () => {
    const next = Math.max(0, progress - 1);
    if (next !== progress) updateProgress(next);
  };

  const percent = Math.min(100, Math.round((progress / Math.max(1, target)) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Hydration 💧</span>
          <span className="text-sm text-muted-foreground">{progress}/{target} glasses</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={dec} disabled={saving || loading}>−</Button>
          <Button size="sm" onClick={inc} disabled={saving || loading}>+</Button>
          <span className="text-sm text-muted-foreground ml-auto">{percent}%</span>
        </div>
      </CardContent>
    </Card>
  );
}


