import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Battery, 
  Calendar, 
  Trophy, 
  User, 
  HelpCircle, 
  LogOut,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useState } from "react";
import { toast } from "sonner";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user, signOut } = useAuth();
  const { getDailyScore, getTodaysFoodLogs } = useFoodLogs();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const dailyScore = getDailyScore();
  const todayLogs = getTodaysFoodLogs();
  const firstName = user?.user_metadata?.first_name || 'Health Hero';

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully! 👋");
    } catch (error) {
      toast.error("⚠️ Log out failed — please try again 🔄");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      id: 'daily',
      label: 'Daily Score',
      icon: Battery,
      emoji: '🔋',
      badge: dailyScore > 0 ? `${dailyScore}%` : null,
      description: 'Track your meals & health score'
    },
    {
      id: 'weekly',
      label: 'Weekly View',
      icon: Calendar,
      emoji: '📅',
      badge: null,
      description: '7-day food history & trends'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Trophy,
      emoji: '🏆',
      badge: null,
      description: 'Badges & milestones'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      emoji: '👤',
      badge: null,
      description: 'Update preferences & goals'
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      emoji: '🤖',
      badge: null,
      description: 'How Health-o-Meter works'
    }
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-float">🥗</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-health bg-clip-text text-transparent">
                Health-o-Meter
              </h1>
              <p className="text-xs text-muted-foreground">
                Hey {firstName}! {todayLogs.length > 0 ? `${todayLogs.length} meals logged today` : 'Start logging meals'} ✨
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`relative gap-2 ${isActive ? 'shadow-glow' : ''}`}
                  onClick={() => {
                    onTabChange(item.id);
                    toast.success(`${item.emoji} ${item.label} activated!`);
                  }}
                  title={item.description}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className="hidden md:inline">{item.label}</span>
                  <Icon className="h-4 w-4" />
                  
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </Button>
              );
            })}
            
            {/* Sign Out */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
              title="Sign out safely"
            >
              {isLoggingOut ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="text-sm">🚪</span>
                  <span className="hidden md:inline ml-1">Sign Out</span>
                  <LogOut className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}