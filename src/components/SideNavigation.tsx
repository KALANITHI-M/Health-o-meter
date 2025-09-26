import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Battery, 
  Calendar, 
  Trophy, 
  User, 
  HelpCircle, 
  LogOut,
  Sparkles,
  Menu,
  X,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SideNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SideNavigation({ activeTab, onTabChange }: SideNavigationProps) {
  const { user, signOut } = useAuth();
  const { getTodaysFoodLogs, getDailyScore } = useFoodLogs();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use the same calculation as HealthDashboard for consistency
  const dailyScore = getDailyScore();
  
  const todayLogs = getTodaysFoodLogs();
  const firstName = user?.firstName || 'Health Hero';




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
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      emoji: '🏅',
      badge: 'NEW',
      description: 'Weekly competition rankings'
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
      id: 'meal-analyzer',
      label: 'Meal Analyzer',
      icon: Camera,
      emoji: '📸',
      badge: 'NEW',
      description: 'AI-powered meal analysis'
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

  // Close the mobile menu when a tab is selected
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    if (isMobile) {
      setIsOpen(false);
    }
    toast.success(`${navItems.find(item => item.id === tabId)?.emoji} ${navItems.find(item => item.id === tabId)?.label} activated!`);
  };

  // Navigation content that will be used in both desktop and mobile views
  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo - Always visible */}
      <div className="flex items-center gap-3 py-4 px-4 hover:bg-white/10 transition-colors duration-200 cursor-pointer">
        <div className="text-2xl animate-float">🥗</div>
        <div>
          <h1 className="text-xl font-bold text-white">
            Health-o-Meter
          </h1>
          <p className="text-xs text-white/80">
            Hey {firstName}! {todayLogs.length > 0 ? `${todayLogs.length} meals logged today` : 'Start logging meals'} ✨
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col mt-6 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              size="lg"
              className={cn(
                "relative justify-start gap-3 rounded-none border-l-4 transition-all duration-200 text-white nav-item-hover-green",
                isActive 
                  ? "border-l-white bg-white/20" 
                  : "border-l-transparent"
              )}
              onClick={() => handleTabChange(item.id)}
              title={item.description}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className={cn(
                item.id === 'daily' ? 'font-medium' : '',
                "transition-colors duration-200"
              )}>{item.label}</span>
              
              {item.badge && (
                <Badge variant={isActive ? "default" : "secondary"} className="ml-auto text-xs bg-white/20 text-white">
                  {item.badge}
                </Badge>
              )}
              
              {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary active-nav-indicator"></div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Sign Out Button - At the bottom */}
      <Button 
        variant="ghost" 
        size="lg"
        onClick={handleSignOut}
        disabled={isLoggingOut}
        className="mt-auto mb-4 mx-4 justify-start gap-3 text-white hover:text-white hover:bg-red-500/30 transition-all duration-200 hover:translate-x-1"
        title="Sign out safely"
      >
        {isLoggingOut ? (
          <Sparkles className="h-5 w-5 animate-spin text-white" />
        ) : (
          <>
            <span className="text-lg">🚪</span>
            <span>Sign Out</span>
            <LogOut className="h-5 w-5 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile: Hamburger Menu with Sheet/Drawer */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-blue-gradient z-50 border-b flex items-center px-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] bg-blue-gradient">
              <NavigationContent />
            </SheetContent>
          </Sheet>
          
          <div className="ml-4">
            <h1 className="text-xl font-bold text-white">
              Health-o-Meter
            </h1>
          </div>
        </div>
      )}

      {/* Desktop: Permanent Sidebar */}
      {!isMobile && (
        <aside className="fixed top-0 left-0 h-screen w-64 border-r bg-blue-gradient z-40">
          <NavigationContent />
        </aside>
      )}
    </>
  );
}