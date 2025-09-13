import { Battery, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthBatteryProps {
  level: number; // 0-100
  label: string;
  period: "morning" | "afternoon" | "night" | "daily";
  className?: string;
}

export function HealthBattery({ level, label, period, className }: HealthBatteryProps) {
  const getBatteryColor = (level: number) => {
    if (level >= 70) return "battery-high";
    if (level >= 40) return "battery-medium";
    return "battery-low";
  };

  const getBatteryGlow = (level: number) => {
    if (level >= 70) return "animate-glow-pulse shadow-battery-glow";
    return "shadow-battery-low";
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "morning": return "🌅";
      case "afternoon": return "☀️";
      case "night": return "🌙";
      default: return "⚡";
    }
  };

  return (
    <div className={cn("relative p-6 bg-card rounded-xl shadow-card border", className)}>
      {/* Period Icon & Label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getPeriodIcon(period)}</span>
          <h3 className="font-semibold text-foreground">{label}</h3>
        </div>
        <div className="text-sm text-muted-foreground">{level}%</div>
      </div>

      {/* Battery Visualization */}
      <div className="relative">
        {/* Battery Shell */}
        <div className="relative w-full h-12 bg-muted rounded-lg border-2 border-border overflow-hidden">
          {/* Battery Fill */}
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-out rounded-md",
              `bg-${getBatteryColor(level)}`,
              getBatteryGlow(level)
            )}
            style={{ width: `${level}%` }}
          />
          
          {/* Battery Tip */}
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-border rounded-r"></div>
        </div>

        {/* Charging Animation */}
        {level >= 70 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary animate-bounce" />
          </div>
        )}
      </div>

      {/* Health Status Message */}
      <div className="mt-3 text-sm">
        {level >= 80 && (
          <p className="text-battery-high font-medium">💪 Powered up! Keep going!</p>
        )}
        {level >= 50 && level < 80 && (
          <p className="text-battery-medium font-medium">⚡ Good energy! Room to grow</p>
        )}
        {level < 50 && (
          <p className="text-battery-low font-medium">🔋 Low battery! Fuel up with healthy choices</p>
        )}
      </div>
    </div>
  );
}