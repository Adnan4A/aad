import { LogIn, LogOut, User, Eye, EyeOff, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { logout, signInWithEmail, signUpWithEmail } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function AuthButton() {
  const { user, loading } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
        toast({
          title: "Success",
          description: "Signed in successfully!"
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive"
          });
          return;
        }
        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive"
          });
          return;
        }
        await signUpWithEmail(formData.email, formData.password);
        toast({
          title: "Success",
          description: "Account created successfully!"
        });
      }
      // Reset form
      setFormData({ email: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Enhanced error handling with user-friendly messages
      let errorMessage = `Failed to ${isLogin ? 'sign in' : 'sign up'}`;
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = "No account found with this email address. Please check your email or sign up for a new account.";
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password. Please try again or reset your password.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/user-disabled':
            errorMessage = "This account has been disabled. Please contact support for assistance.";
            break;
          case 'auth/email-already-in-use':
            errorMessage = "An account already exists with this email address. Please sign in instead.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password is too weak. Please use at least 6 characters with a mix of letters and numbers.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many failed attempts. Please wait a few minutes before trying again.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection and try again.";
            break;
          case 'auth/invalid-credential':
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/password accounts are not enabled. Please contact support.";
            break;
          case 'auth/requires-recent-login':
            errorMessage = "For security reasons, please sign out and sign in again to continue.";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full skeleton" data-testid="auth-loading" />
    );
  }

  if (!user) {
    return (
      <DropdownMenu onOpenChange={(open) => !open && resetForm()}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="liquid-bg backdrop-blur-[28px] border-white/15 text-white hover:bg-white/10 hover:text-accent-blue hover:border-accent-blue/40 transition-all duration-300 font-medium shadow-lg"
            data-testid="sign-in-button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="liquid-bg backdrop-blur-[28px] border border-white/15 rounded-2xl w-80 sm:w-96 lg:w-80 max-w-[95vw] max-h-[85vh] overflow-y-auto liquid-scrollbar p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-2 duration-300" 
          align="end"
          data-testid="auth-dropdown"
          sideOffset={10}
        >
          <div className="space-y-7">
            <div className="text-center pb-4 border-b border-white/20 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-accent-blue to-transparent"></div>
              <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join CryptoLiquid'}
              </h3>
              <p className="text-sm font-medium text-white/80 leading-relaxed">
                {isLogin ? 'Sign in to access your crypto dashboard' : 'Create your account and start trading today'}
              </p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-white/90 tracking-wide">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="glass-card border-white/20 text-white placeholder:text-white/50 focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20 text-base py-3 px-4 font-medium transition-all duration-300"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-white/90 tracking-wide">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="glass-card border-white/20 text-white placeholder:text-white/50 focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20 text-base py-3 px-4 pr-12 font-medium transition-all duration-300"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-md hover:bg-white/10 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/70" />
                    )}
                  </Button>
                </div>
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-white/90 tracking-wide">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="glass-card border-white/20 text-white placeholder:text-white/50 focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/20 text-base py-3 px-4 font-medium transition-all duration-300"
                    required
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-blue via-purple-500 to-accent-green hover:from-accent-blue/90 hover:via-purple-500/90 hover:to-accent-green/90 text-white font-bold py-4 text-base transition-all duration-300 shadow-2xl shadow-accent-blue/30 rounded-xl border border-white/20 backdrop-blur-sm"
                disabled={authLoading}
              >
                {authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="text-base font-semibold">{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <span className="text-base font-semibold tracking-wide">{isLogin ? 'Sign In to CryptoLiquid' : 'Create Your Account'}</span>
                )}
              </Button>
            </form>
            
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="liquid-bg backdrop-blur-[20px] px-6 py-2 text-white/80 font-bold tracking-[0.2em] rounded-full border border-white/20">OR</span>
              </div>
            </div>
            
            <div className="text-center pt-5 border-t border-white/20 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="text-sm text-white/80 hover:text-accent-blue transition-all duration-300 font-semibold tracking-wide hover:bg-white/5 rounded-lg px-4 py-2"
              >
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-accent-blue/40 transition-all duration-200"
          data-testid="user-menu-trigger"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={userProfile?.avatarURL || user.photoURL || ""} 
              alt={userProfile?.displayName || user.displayName || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-accent-blue/20 text-accent-blue font-semibold">
              {(userProfile?.displayName || user.displayName || user.email)?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          {/* Online status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="liquid-bg backdrop-blur-[28px] border border-white/15 rounded-2xl w-72 sm:w-80 lg:w-72 max-w-[90vw] max-h-[80vh] overflow-y-auto liquid-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-2 duration-300" 
        align="end"
        data-testid="user-menu-content"
        sideOffset={10}
      >
        {/* User Info Header */}
        <div className="px-5 py-4 border-b border-white/20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-accent-blue to-transparent"></div>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent">
              <AvatarImage 
                src={userProfile?.avatarURL || user.photoURL || ""} 
                alt={userProfile?.displayName || user.displayName || "User"} 
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-accent-blue to-accent-green text-white font-bold text-lg">
                {(userProfile?.displayName || user.displayName || user.email)?.charAt(0)?.toUpperCase() || <User className="w-6 h-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white font-bold text-lg tracking-wide" data-testid="user-display-name">
                {userProfile?.displayName || user.displayName || 'User'}
              </p>
              <p className="text-white/70 text-sm font-medium" data-testid="user-email">
                {user.email}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-300 ml-2 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="py-3">
          <DropdownMenuItem 
            onClick={() => setLocation('/profile')}
            className="glass-card cursor-pointer mx-3 my-2 px-4 py-3 text-white font-medium transition-all duration-300 focus:bg-white/15 hover:bg-white/10 rounded-xl border border-white/10"
          >
            <User className="w-5 h-5 mr-3 text-accent-blue" />
            <span className="font-semibold tracking-wide">View Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setLocation('/profile')}
            className="glass-card cursor-pointer mx-3 my-2 px-4 py-3 text-white font-medium transition-all duration-300 focus:bg-white/15 hover:bg-white/10 rounded-xl border border-white/10"
          >
            <Settings className="w-5 h-5 mr-3 text-purple-400" />
            <span className="font-semibold tracking-wide">Settings</span>
          </DropdownMenuItem>
        </div>
        
        <div className="mx-3 border-t border-white/20 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
        
        <div className="py-3">
          <DropdownMenuItem 
            onClick={async () => {
              try {
                await logout();
                console.log('User logged out successfully');
              } catch (error) {
                console.error('Error logging out:', error);
              }
            }}
            className="glass-card cursor-pointer mx-3 my-2 px-4 py-3 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 focus:bg-red-500/20 rounded-xl border border-red-500/20 hover:border-red-500/40"
            data-testid="sign-out-button"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-semibold tracking-wide">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}