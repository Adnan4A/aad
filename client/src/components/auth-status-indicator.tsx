import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserAuthDetails } from "@/hooks/use-user-auth-details";
import { CheckCircle, XCircle, AlertCircle, Mail, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { resendEmailVerification } from "@/lib/firebase";

export function AuthStatusIndicator() {
  const { user, loading } = useAuth();
  const { data: authDetails, isLoading: authDetailsLoading } = useUserAuthDetails();
  const { toast } = useToast();
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const handleResendVerification = async () => {
    if (!user) return;
    
    setIsResendingVerification(true);
    try {
      await resendEmailVerification(user.uid);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email inbox for the verification link.",
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  if (loading || authDetailsLoading) {
    return (
      <Badge variant="outline" className="glass-card border-yellow-500 text-yellow-400" data-testid="auth-status-loading">
        <AlertCircle className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  if (user && authDetails) {
    if (authDetails.emailVerified) {
      return (
        <Badge variant="outline" className="glass-card border-green-500 text-green-400" data-testid="auth-status-verified">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="glass-card border-yellow-500 text-yellow-400" data-testid="auth-status-unverified">
            <Mail className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="bg-yellow-600/20 border-yellow-600/30 text-yellow-400 hover:bg-yellow-600/30 h-6 px-2 text-xs"
            onClick={handleResendVerification}
            disabled={isResendingVerification}
            data-testid="button-resend-verification-indicator"
          >
            {isResendingVerification ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend'
            )}
          </Button>
        </div>
      );
    }
  }

  if (user) {
    return (
      <Badge variant="outline" className="glass-card border-green-500 text-green-400" data-testid="auth-status-authenticated">
        <CheckCircle className="w-3 h-3 mr-1" />
        Authenticated
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="glass-card border-gray-500 text-gray-400" data-testid="auth-status-unauthenticated">
      <XCircle className="w-3 h-3 mr-1" />
      Not signed in
    </Badge>
  );
}