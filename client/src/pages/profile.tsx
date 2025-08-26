import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { uploadAvatar, updateUserProfile, deleteAvatar, updateUserPreferences, updateUserStats, resendEmailVerification } from "@/lib/firebase";
import { User, Camera, Trash2, Save, MapPin, Globe, Calendar, Clock, Mail, Settings, TrendingUp, Shield, Bell, Palette, DollarSign, Loader2, CheckCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileFormData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
}

export function Profile() {
  const { user } = useAuth();
  const { data: userProfile, isLoading, refetch } = useUserProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'stats'>('profile');
  const [isSaving, setSaving] = useState(false);
  const [isUploadingAvatar, setUploadingAvatar] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: "",
    bio: "",
    location: "",
    website: ""
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'dark' as 'light' | 'dark' | 'auto',
    currency: 'USD',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      priceAlerts: false
    },
    privacy: {
      profileVisible: true,
      activityVisible: true
    }
  });
  
  const [stats, setStats] = useState({
    totalPortfolioValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    favoriteCoins: [] as string[],
    tradingExperience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  });

  // Initialize form data when user profile loads
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        website: userProfile.website || ""
      });
      
      if (userProfile.preferences) {
        setPreferences(userProfile.preferences);
      }
      
      if (userProfile.stats) {
        setStats(userProfile.stats);
      }
    }
  }, [userProfile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md liquid-bg backdrop-blur-xl border border-white/10">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
            <p className="text-gray-300">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateUserProfile(user.uid, formData);
      await refetch();
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please choose an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please choose an image file.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    setShowUploadSuccess(false);
    
    try {
      console.log('Starting avatar upload process...');
      const downloadURL = await uploadAvatar(user.uid, file);
      console.log('Upload completed, URL:', downloadURL);
      
      // Show success animation
      setShowUploadSuccess(true);
      
      // Refresh profile data immediately
      await refetch();
      
      // Wait for success animation to show briefly, then show success message
      setTimeout(() => {
        setShowUploadSuccess(false);
        toast({
          title: "✨ Avatar Updated!",
          description: "Your profile picture has been updated successfully and saved to database.",
          className: "border-green-500/50 bg-green-500/10",
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setShowUploadSuccess(false);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Upload Failed",
        description: `Failed to upload avatar: ${errorMessage}. Please check your internet connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !(userProfile?.avatarURL || userProfile?.photoURL)) return;

    try {
      await deleteAvatar(user.uid);
      await refetch();
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const joinDate = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header - White Liquid Glass Theme */}
        <Card className="liquid-bg backdrop-blur-[25px] border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="relative">
                  {/* Enhanced Avatar Container */}
                  <div className={cn(
                    "relative w-32 h-32 md:w-40 md:h-40 rounded-full transition-all duration-500 group cursor-pointer",
                    "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm",
                    "border-4 border-white/30 shadow-[0_20px_40px_rgba(255,255,255,0.1)]",
                    "hover:scale-105 hover:shadow-[0_25px_50px_rgba(255,255,255,0.15)]",
                    isUploadingAvatar ? "border-accent-blue animate-pulse shadow-[0_20px_40px_rgba(0,255,255,0.3)]" : "",
                    showUploadSuccess ? "border-green-400 scale-110 shadow-[0_20px_40px_rgba(34,197,94,0.4)]" : ""
                  )}
                  onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}>
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={userProfile?.avatarURL || userProfile?.photoURL || undefined} 
                        alt={userProfile?.displayName || "User Avatar"}
                        className={cn(
                          "object-cover w-full h-full transition-all duration-500",
                          "group-hover:brightness-110",
                          isUploadingAvatar ? "opacity-60 blur-sm" : "opacity-100"
                        )}
                      />
                      <AvatarFallback className={cn(
                        "w-full h-full bg-gradient-to-br from-accent-blue/20 to-purple-500/20",
                        "text-white text-3xl md:text-4xl font-bold transition-all duration-500",
                        "backdrop-blur-sm border border-white/20",
                        isUploadingAvatar ? "opacity-60" : "opacity-100"
                      )}>
                        {(userProfile?.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hover Effect Overlay */}
                    <div className={cn(
                      "absolute inset-0 rounded-full transition-all duration-300 pointer-events-none",
                      "bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    )} />
                  </div>
                  
                  {/* Enhanced Upload Loading Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <Upload className="w-8 h-8 text-accent-blue animate-bounce" />
                          <div className="absolute inset-0 animate-ping">
                            <Upload className="w-8 h-8 text-accent-blue opacity-30" />
                          </div>
                        </div>
                        <div className="text-sm text-white font-medium">Uploading...</div>
                        <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent-blue to-purple-400 rounded-full animate-pulse w-full"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Success Overlay */}
                  {showUploadSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-full backdrop-blur-lg animate-in fade-in-0 zoom-in-95 duration-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                          <CheckCircle className="w-12 h-12 text-green-400 animate-in zoom-in-50 duration-500" />
                          <div className="absolute inset-0 animate-ping">
                            <CheckCircle className="w-12 h-12 text-green-400 opacity-20" />
                          </div>
                        </div>
                        <div className="text-sm text-green-400 font-medium">Success!</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Avatar Controls */}
                <div className="absolute -bottom-4 -right-4 flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "w-14 h-14 p-0 transition-all duration-300 rounded-full",
                      "backdrop-blur-lg border-2 shadow-lg hover:scale-110",
                      isUploadingAvatar 
                        ? "bg-accent-blue/30 border-accent-blue/60 animate-pulse shadow-[0_8px_24px_rgba(0,255,255,0.4)]" 
                        : "bg-white/20 border-white/30 hover:bg-white/30 shadow-[0_8px_24px_rgba(255,255,255,0.2)]",
                      showUploadSuccess && "bg-green-500/30 border-green-500/60 shadow-[0_8px_24px_rgba(34,197,94,0.4)]"
                    )}
                    onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-accent-blue animate-spin" />
                    ) : showUploadSuccess ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </Button>
                  
                  {(userProfile?.avatarURL || userProfile?.photoURL) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "w-14 h-14 p-0 rounded-full transition-all duration-300",
                        "bg-red-500/20 border-2 border-red-500/40 backdrop-blur-lg",
                        "hover:bg-red-500/30 hover:scale-110 shadow-[0_8px_24px_rgba(239,68,68,0.3)]"
                      )}
                      onClick={handleDeleteAvatar}
                    >
                      <Trash2 className="w-6 h-6 text-red-400" />
                    </Button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {userProfile?.displayName || user.email?.split('@')[0] || 'User'}
                    </h1>
                    {userProfile?.emailVerified && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                    {!userProfile?.emailVerified && (
                      <>
                        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 ml-2">
                          Unverified
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-yellow-600/20 border-yellow-600/30 text-yellow-400 hover:bg-yellow-600/30 ml-2"
                          onClick={handleResendVerification}
                          disabled={isResendingVerification}
                          data-testid="button-resend-verification"
                        >
                          {isResendingVerification ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Resend Verification'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                  {/* Alternative Member Information Card - Compact Style */}
                  <div className="relative">
                    {/* Main Stats Bar */}
                    <div className="liquid-bg backdrop-blur-[25px] rounded-2xl p-6 border border-white/25 shadow-[0_12px_40px_rgba(255,255,255,0.12)] relative overflow-hidden mb-4">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 via-purple-500/3 to-accent-blue/5" />
                      <div className="absolute top-0 left-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-accent-blue/40 to-transparent blur-sm" />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-accent-blue to-purple-500 shadow-lg animate-pulse" />
                          <h3 className="text-xl font-bold text-white">
                            Member Dashboard
                          </h3>
                        </div>
                        <div className="text-gray-400 text-sm font-medium">
                          Live Status
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Grid - Horizontal Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Member Since */}
                      {userProfile?.createdAt && (
                        <div className="group liquid-bg backdrop-blur-[20px] rounded-xl p-5 border border-white/20 hover:border-accent-blue/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue/30 transition-colors shadow-inner">
                              <Calendar className="w-6 h-6 text-accent-blue" />
                            </div>
                            <div className="text-white font-semibold text-sm mb-1">Member Since</div>
                            <div className="text-gray-300 text-xs font-medium">
                              {new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', year: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Last Active */}
                      {userProfile?.lastLoginAt && (
                        <div className="group liquid-bg backdrop-blur-[20px] rounded-xl p-5 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors shadow-inner">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            <div className="text-white font-semibold text-sm mb-1">Active</div>
                            <div className="text-gray-300 text-xs font-medium">
                              {new Date(userProfile.lastLoginAt).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Profile Status */}
                      {userProfile?.lastUpdated && (
                        <div className="group liquid-bg backdrop-blur-[20px] rounded-xl p-5 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors shadow-inner">
                              <User className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="text-white font-semibold text-sm mb-1">Updated</div>
                            <div className="text-gray-300 text-xs font-medium">
                              {new Date(userProfile.lastUpdated).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Watchlist Stats */}
                      <div className="group liquid-bg backdrop-blur-[20px] rounded-xl p-5 border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors shadow-inner">
                            <TrendingUp className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="text-white font-semibold text-sm mb-1">Tracking</div>
                          <div className="text-gray-300 text-xs font-medium">
                            {userProfile?.watchlist?.length || 0} coins
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activity Summary Bar */}
                    <div className="liquid-bg backdrop-blur-[20px] rounded-xl p-4 border border-white/15 shadow-lg mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">Recent Activity</div>
                            <div className="text-gray-400 text-xs">
                              {userProfile?.activities?.length || 0} tracked actions
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs">
                          Live tracking enabled
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {userProfile?.bio && (
                  <p className="text-gray-300 max-w-md">{userProfile.bio}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  {userProfile?.location && (
                    <Badge variant="outline" className="border-white/20 text-gray-300">
                      <MapPin className="w-3 h-3 mr-1" />
                      {userProfile.location}
                    </Badge>
                  )}
                  {userProfile?.website && (
                    <Badge variant="outline" className="border-white/20 text-gray-300">
                      <Globe className="w-3 h-3 mr-1" />
                      <a 
                        href={userProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-accent-blue transition-colors"
                      >
                        Website
                      </a>
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-accent-blue/30 text-accent-blue">
                    {userProfile?.watchlist?.length || 0} Coins Watched
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-accent-blue hover:bg-accent-blue/80"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab(activeTab === 'profile' ? 'preferences' : 'profile')}
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Activity Feed */}
        <Card className="liquid-bg backdrop-blur-[30px] border-2 border-white/30 shadow-[0_16px_48px_rgba(255,255,255,0.15)] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-accent-blue/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-2xl" />
          
          <CardContent className="p-8 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-blue/20 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-accent-blue" />
                </div>
                Recent Activity
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </h3>
              <div className="text-gray-400 text-sm font-medium">
                Live Updates
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Real-time activities from Firebase */}
              {userProfile?.activities && userProfile.activities.length > 0 ? (
                userProfile.activities.map((activity: any) => (
                  <div key={activity.id} className="group bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:border-white/30 transition-all duration-300 hover:scale-[1.01] shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        activity.type === 'watchlist_add' ? 'bg-green-500/20 text-green-400' :
                        activity.type === 'watchlist_remove' ? 'bg-red-500/20 text-red-400' :
                        activity.type === 'profile_update' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'avatar_upload' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-accent-blue/20 text-accent-blue'
                      }`}>
                        {activity.type === 'watchlist_add' && <TrendingUp className="w-5 h-5" />}
                        {activity.type === 'watchlist_remove' && <TrendingUp className="w-5 h-5 rotate-180" />}
                        {activity.type === 'profile_update' && <User className="w-5 h-5" />}
                        {activity.type === 'avatar_upload' && <Camera className="w-5 h-5" />}
                        {!['watchlist_add', 'watchlist_remove', 'profile_update', 'avatar_upload'].includes(activity.type) && <Calendar className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg group-hover:text-accent-blue transition-colors">
                          {activity.description}
                        </div>
                        <div className="text-gray-300 text-sm mt-1">
                          {new Date(activity.timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Default activities when no Firebase activities exist
                <div className="space-y-4">
                  <div className="group bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:border-white/30 transition-all duration-300 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-lg">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">Welcome to CryptoLiquid!</div>
                        <div className="text-gray-300 text-sm mt-1">
                          Your crypto journey begins now. Start by adding coins to your watchlist.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {userProfile?.watchlist && userProfile.watchlist.length > 0 && (
                    <div className="group bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:border-white/30 transition-all duration-300 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue shadow-lg">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">
                            Added {userProfile.watchlist.length} coins to watchlist
                          </div>
                          <div className="text-gray-300 text-sm mt-1">
                            Keep tracking your favorite cryptocurrencies
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userProfile?.bio && (
                    <div className="group bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:border-white/30 transition-all duration-300 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">Profile personalized</div>
                          <div className="text-gray-300 text-sm mt-1">
                            Bio added to complete your profile
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Empty state */}
              {(!userProfile?.activities || userProfile.activities.length === 0) && (!userProfile?.watchlist || userProfile.watchlist.length === 0) && !userProfile?.bio && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-400 text-lg font-medium mb-2">No recent activity</div>
                  <div className="text-gray-500 text-sm">
                    Start exploring and your activities will appear here!
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Card className="liquid-bg backdrop-blur-[25px] border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
          <CardContent className="p-0">
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "flex-1 px-6 py-4 text-sm font-medium transition-colors",
                  activeTab === 'profile' 
                    ? "border-b-2 border-accent-blue text-accent-blue bg-accent-blue/10" 
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <User className="w-4 h-4 mr-2 inline-block" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={cn(
                  "flex-1 px-6 py-4 text-sm font-medium transition-colors",
                  activeTab === 'preferences' 
                    ? "border-b-2 border-accent-blue text-accent-blue bg-accent-blue/10" 
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <Settings className="w-4 h-4 mr-2 inline-block" />
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={cn(
                  "flex-1 px-6 py-4 text-sm font-medium transition-colors",
                  activeTab === 'stats' 
                    ? "border-b-2 border-accent-blue text-accent-blue bg-accent-blue/10" 
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <TrendingUp className="w-4 h-4 mr-2 inline-block" />
                Trading Stats
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && activeTab === 'profile' && (
          <Card className="liquid-bg backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Edit Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Your display name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-300">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-accent-blue hover:bg-accent-blue/80"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card className="liquid-bg backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-white font-medium">Theme & Display</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Theme</Label>
                    <select 
                      value={preferences.theme}
                      onChange={(e) => setPreferences({...preferences, theme: e.target.value as 'light' | 'dark' | 'auto'})}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Currency</Label>
                    <select 
                      value={preferences.currency}
                      onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="BTC">BTC - Bitcoin</option>
                      <option value="ETH">ETH - Ethereum</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Notification Settings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-white font-medium">Notifications</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Email Notifications</Label>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.email}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, email: e.target.checked}
                      })}
                      className="w-4 h-4 text-accent-blue bg-white/5 border border-white/10 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Push Notifications</Label>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.push}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, push: e.target.checked}
                      })}
                      className="w-4 h-4 text-accent-blue bg-white/5 border border-white/10 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Price Alerts</Label>
                    <input
                      type="checkbox"
                      checked={preferences.notifications.priceAlerts}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        notifications: {...preferences.notifications, priceAlerts: e.target.checked}
                      })}
                      className="w-4 h-4 text-accent-blue bg-white/5 border border-white/10 rounded"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Privacy Settings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-white font-medium">Privacy</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Profile Visible to Others</Label>
                    <input
                      type="checkbox"
                      checked={preferences.privacy.profileVisible}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        privacy: {...preferences.privacy, profileVisible: e.target.checked}
                      })}
                      className="w-4 h-4 text-accent-blue bg-white/5 border border-white/10 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Trading Activity Visible</Label>
                    <input
                      type="checkbox"
                      checked={preferences.privacy.activityVisible}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        privacy: {...preferences.privacy, activityVisible: e.target.checked}
                      })}
                      className="w-4 h-4 text-accent-blue bg-white/5 border border-white/10 rounded"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={async () => {
                  if (!user) return;
                  try {
                    setSaving(true);
                    await updateUserPreferences(user.uid, preferences);
                    await refetch();
                    toast({
                      title: "Preferences Updated",
                      description: "Your preferences have been saved successfully.",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update preferences. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={isSaving}
                className="w-full bg-accent-blue hover:bg-accent-blue/80"
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Trading Stats Tab */}
        {activeTab === 'stats' && (
          <Card className="liquid-bg backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trading Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Portfolio Overview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-white font-medium">Portfolio Overview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">Total Portfolio Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stats.totalPortfolioValue}
                      onChange={(e) => setStats({...stats, totalPortfolioValue: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Total Gain/Loss ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stats.totalGainLoss}
                      onChange={(e) => setStats({...stats, totalGainLoss: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Total Gain/Loss (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stats.totalGainLossPercentage}
                      onChange={(e) => setStats({...stats, totalGainLossPercentage: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Trading Experience</Label>
                    <select 
                      value={stats.tradingExperience}
                      onChange={(e) => setStats({...stats, tradingExperience: e.target.value as any})}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Favorite Coins */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-white font-medium">Favorite Coins</h3>
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">Coin Symbols (comma-separated)</Label>
                  <Input
                    value={stats.favoriteCoins.join(', ')}
                    onChange={(e) => setStats({
                      ...stats, 
                      favoriteCoins: e.target.value.split(',').map(coin => coin.trim()).filter(coin => coin.length > 0)
                    })}
                    placeholder="BTC, ETH, ADA, SOL"
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter your favorite cryptocurrency symbols separated by commas
                  </p>
                </div>
              </div>

              <Button
                onClick={async () => {
                  if (!user) return;
                  try {
                    setSaving(true);
                    await updateUserStats(user.uid, stats);
                    await refetch();
                    toast({
                      title: "Stats Updated",
                      description: "Your trading statistics have been saved successfully.",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update stats. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={isSaving}
                className="w-full bg-accent-blue hover:bg-accent-blue/80"
              >
                {isSaving ? "Saving..." : "Save Trading Stats"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Account Statistics for Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="liquid-bg backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {userProfile?.watchlist?.length || 0}
                  </div>
                  <div className="text-gray-400">Coins Watched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-purple">
                    {userProfile?.lastLoginAt ? 'Active' : 'New'}
                  </div>
                  <div className="text-gray-400">Account Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {userProfile?.createdAt 
                      ? new Date(userProfile.createdAt).getFullYear() 
                      : new Date().getFullYear()
                    }
                  </div>
                  <div className="text-gray-400">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}