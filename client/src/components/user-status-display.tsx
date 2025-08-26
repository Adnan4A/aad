import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, XCircle, Clock } from "lucide-react";

export function UserStatusDisplay() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isAuthenticated } = useUserProfile();

  if (authLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-400" data-testid="user-status-loading">
        <Clock className="w-4 h-4" />
        <span>Loading authentication...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-400" data-testid="user-status-signed-out">
        <XCircle className="w-4 h-4" />
        <span>Not signed in - Sign in to access watchlist features</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2" data-testid="user-status-signed-in">
      <div className="flex items-center space-x-2 text-sm">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-white">
          Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}!
        </span>
      </div>
      <Badge variant="secondary" className="text-xs glass-card border-gray-600">
        {profileLoading ? 'Syncing...' : isAuthenticated ? 'Profile Synced' : 'Connected'}
      </Badge>
    </div>
  );
}