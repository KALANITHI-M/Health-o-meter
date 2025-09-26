import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password, firstName);
        if (!result.error) {
          navigate('/onboarding');
        }
      } else {
        const result = await signIn(email, password);
        if (!result.error) {
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setFirstName('');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Health-o-Meter branding */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🥗</div>
          <h1 className="text-3xl font-bold bg-gradient-health bg-clip-text text-transparent mb-2">
            Health-o-Meter
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? "Join Health-o-Meter 🥗 → Track, Score, and Level Up Your Health!" 
              : "Welcome back! Ready to charge your health battery? ⚡"
            }
          </p>
        </div>

        <Card className="w-full border-primary/20 shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <span>{isSignUp ? '🌱' : '💚'}</span>
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Start your wellness journey today!" 
                : "Let's continue your health adventure!"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="What should we call you? 😊"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={isSignUp}
                    className="mt-1"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password 🔒"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-health text-white hover:opacity-90 transition-all duration-300"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <span className="mr-2">{isSignUp ? '🚀' : '⚡'}</span>
                    {isSignUp ? 'Start My Journey' : 'Power Up!'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : 'New to Health-o-Meter?'}
              </p>
              <Button
                variant="ghost"
                onClick={toggleMode}
                className="mt-2 text-primary hover:text-primary/80"
              >
                {isSignUp ? '💚 Sign In Instead' : '🌱 Create Account'}
              </Button>
            </div>

            {/* Motivational footer */}
            <div className="mt-6 p-4 bg-gradient-hero rounded-lg text-center">
              <div className="text-2xl mb-2">
                {isSignUp ? '🎯' : '🔥'}
              </div>
              <p className="text-sm text-muted-foreground">
                {isSignUp 
                  ? "Every healthy choice charges your batteries. Every streak unlocks achievements! 🏆"
                  : "Your health data is waiting for you! Let's continue building those streaks! 💪"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}