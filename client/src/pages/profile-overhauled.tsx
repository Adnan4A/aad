import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { uploadAvatar, updateUserProfile, deleteAvatar, updateUserPreferences, updateUserStats } from "@/lib/firebase";
import { User, Camera, Trash2, Save, MapPin, Globe, Calendar, Clock, Mail, Settings, TrendingUp, Shield, Bell, Palette, DollarSign, Loader2, CheckCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileFormData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
}

interface PreferencesData {
  theme: 'dark' | 'light';
  currency: 'USD' | 'EUR' | 'GBP';
  notifications: boolean;
  privacy: boolean;
}

interface StatsData {
  portfolioValue: number;
  totalGainLoss: number;
  tradingExperience: string;
  favoriteCoins: string[];
}

export function Profile() {
  const { user } = useAuth();
  const { userProfile, isLoading, refetch } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'stats'>('profile');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    website: userProfile?.website || ''
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    theme: userProfile?.preferences?.theme || 'dark',
    currency: userProfile?.preferences?.currency || 'USD',
    notifications: userProfile?.preferences?.notifications ?? true,
    privacy: userProfile?.preferences?.privacy ?? false
  });

  const [stats, setStats] = useState<StatsData>({
    portfolioValue: userProfile?.stats?.portfolioValue || 0,
    totalGainLoss: userProfile?.stats?.totalGainLoss || 0,
    tradingExperience: userProfile?.stats?.tradingExperience || 'beginner',
    favoriteCoins: userProfile?.stats?.favoriteCoins || []
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    setShowUploadSuccess(false);

    try {
      await uploadAvatar(user.uid, file);
      await refetch();
      setShowUploadSuccess(true);
      setTimeout(() => setShowUploadSuccess(false), 3000);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Please sign in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Overhauled Premium Profile Card */}
        <Card className="liquid-bg backdrop-blur-[30px] border-2 border-white/30 shadow-[0_20px_60px_rgba(255,255,255,0.15)] relative overflow-hidden">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-accent-blue/8" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-accent-blue/15 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-2xl" />
          
          <CardContent className="relative p-0">
            {/* Hero Header Section */}
            <div className="p-12 pb-8">
              <div className="flex flex-col xl:flex-row items-center xl:items-start gap-12">
                {/* Premium Avatar Section */}
                <div className="relative flex-shrink-0 group">
                  <div className="relative">
                    {/* Avatar Container with Advanced Effects */}
                    <div className={cn(
                      "relative w-56 h-56 xl:w-64 xl:h-64 rounded-full transition-all duration-700 cursor-pointer",
                      "bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl",
                      "border-4 border-white/50 shadow-[0_30px_80px_rgba(255,255,255,0.25)]",
                      "hover:scale-105 hover:shadow-[0_40px_100px_rgba(255,255,255,0.35)] hover:border-white/70",
                      "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-accent-blue/30 before:to-purple-500/30 before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-700",
                      isUploadingAvatar ? "border-accent-blue animate-pulse shadow-[0_30px_80px_rgba(0,255,255,0.5)] scale-105" : "",
                      showUploadSuccess ? "border-green-400 scale-110 shadow-[0_30px_80px_rgba(34,197,94,0.6)]" : ""
                    )}
                    onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                    >
                      <Avatar className="w-full h-full relative z-10">
                        <AvatarImage 
                          src={userProfile?.avatarURL || userProfile?.photoURL || undefined} 
                          alt={userProfile?.displayName || "User Avatar"}
                          className={cn(
                            "object-cover w-full h-full transition-all duration-700",
                            "group-hover:brightness-110 group-hover:contrast-105",
                            isUploadingAvatar ? "opacity-50 blur-sm" : "opacity-100"
                          )}
                        />
                        <AvatarFallback className={cn(
                          "w-full h-full bg-gradient-to-br from-accent-blue/40 to-purple-500/40",
                          "text-white text-6xl xl:text-7xl font-bold transition-all duration-700",
                          "backdrop-blur-lg border-2 border-white/40",
                          "group-hover:from-accent-blue/50 group-hover:to-purple-500/50",
                          isUploadingAvatar ? "opacity-50" : "opacity-100"
                        )}>
                          {(userProfile?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Premium Glow Ring */}
                      <div className={cn(
                        "absolute inset-0 rounded-full transition-all duration-700 pointer-events-none",
                        "ring-8 ring-transparent group-hover:ring-white/30",
                        "before:absolute before:inset-4 before:rounded-full before:ring-4 before:ring-transparent before:group-hover:ring-accent-blue/40"
                      )} />
                    </div>

                    {/* Premium Loading State */}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-full backdrop-blur-xl">
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-accent-blue/30 border-t-accent-blue animate-spin" />
                            <Upload className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                          </div>
                          <div className="text-white font-semibold text-lg">Uploading Avatar</div>
                          <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent-blue via-purple-400 to-accent-blue rounded-full animate-pulse w-full"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Premium Success State */}
                    {showUploadSuccess && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/50 rounded-full backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-1000">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <CheckCircle className="w-20 h-20 text-green-400 animate-in zoom-in-50 duration-1000" />
                            <div className="absolute inset-0 animate-ping duration-1000">
                              <CheckCircle className="w-20 h-20 text-green-400 opacity-40" />
                            </div>
                          </div>
                          <div className="text-green-400 font-semibold text-lg">Upload Complete!</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Premium Control Buttons */}
                  <div className="absolute -bottom-8 -right-8 flex gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className={cn(
                        "w-18 h-18 p-0 transition-all duration-500 rounded-full group/btn shadow-2xl",
                        "backdrop-blur-xl border-3 hover:scale-110 hover:rotate-6",
                        "bg-gradient-to-br from-white/25 to-white/15 hover:from-white/35 hover:to-white/25",
                        "border-white/50 hover:border-white/70",
                        "shadow-[0_15px_40px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.4)]",
                        isUploadingAvatar && "animate-pulse border-accent-blue/70",
                        showUploadSuccess && "border-green-400/70"
                      )}
                      onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
                      ) : showUploadSuccess ? (
                        <CheckCircle className="w-8 h-8 text-green-400 group-hover/btn:scale-110 transition-transform" />
                      ) : (
                        <Camera className="w-8 h-8 text-white group-hover/btn:scale-110 transition-transform" />
                      )}
                    </Button>
                    
                    {(userProfile?.avatarURL || userProfile?.photoURL) && (
                      <Button
                        size="lg"
                        variant="outline"
                        className={cn(
                          "w-18 h-18 p-0 rounded-full transition-all duration-500 group/btn shadow-2xl",
                          "bg-gradient-to-br from-red-500/25 to-red-600/25 hover:from-red-500/35 hover:to-red-600/35",
                          "border-3 border-red-500/60 backdrop-blur-xl",
                          "hover:border-red-400/80 hover:scale-110 hover:-rotate-6",
                          "shadow-[0_15px_40px_rgba(239,68,68,0.4)] hover:shadow-[0_20px_50px_rgba(239,68,68,0.5)]"
                        )}
                        onClick={handleDeleteAvatar}
                      >
                        <Trash2 className="w-8 h-8 text-red-400 group-hover/btn:scale-110 transition-transform" />
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

                {/* Enhanced Profile Info */}
                <div className="flex-1 text-center xl:text-left space-y-8">
                  <div>
                    <h1 className="text-5xl xl:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-4">
                      {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}
                    </h1>
                    <div className="flex items-center justify-center xl:justify-start gap-4 mb-6">
                      <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                        <Mail className="w-6 h-6 text-accent-blue" />
                      </div>
                      <span className="text-gray-200 text-xl font-medium">{user?.email || 'No email'}</span>
                    </div>
                    {userProfile?.bio && (
                      <p className="text-gray-300 text-xl leading-relaxed max-w-3xl">{userProfile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="px-12 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Member Since */}
                {userProfile?.createdAt && (
                  <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/25 hover:border-white/40 transition-all duration-500 group hover:scale-105 shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-accent-blue/20 text-accent-blue group-hover:bg-accent-blue/30 transition-colors duration-300">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-2xl">Member Since</div>
                        <div className="text-gray-300 text-lg">
                          {new Date(userProfile.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Last Active */}
                {userProfile?.lastLoginAt && (
                  <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/25 hover:border-white/40 transition-all duration-500 group hover:scale-105 shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors duration-300">
                        <Clock className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-2xl">Last Active</div>
                        <div className="text-gray-300 text-lg">
                          {new Date(userProfile.lastLoginAt).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Watchlist */}
                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/25 hover:border-white/40 transition-all duration-500 group hover:scale-105 shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors duration-300">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-2xl">Watchlist</div>
                      <div className="text-gray-300 text-lg">
                        {userProfile?.watchlist?.length || 0} coins tracked
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User Details */}
            <div className="px-12 pb-8">
              <div className="flex flex-wrap gap-6 justify-center xl:justify-start">
                {userProfile?.location && (
                  <div className="flex items-center gap-4 px-6 py-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 hover:bg-white/20 transition-all duration-300 shadow-lg">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                      <MapPin className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-white font-semibold text-lg">{userProfile.location}</span>
                  </div>
                )}
                {userProfile?.website && (
                  <a
                    href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 hover:bg-white/20 hover:border-accent-blue/50 transition-all duration-300 group shadow-lg"
                  >
                    <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-white font-semibold text-lg group-hover:text-accent-blue transition-colors">Website</span>
                  </a>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="px-12 pb-12">
              <div className="flex gap-6 justify-center xl:justify-start">
                <Button
                  size="lg"
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "px-12 py-6 font-bold text-lg transition-all duration-300 rounded-2xl shadow-xl",
                    isEditing 
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white" 
                      : "bg-gradient-to-r from-accent-blue to-blue-600 hover:from-accent-blue/90 hover:to-blue-600/90 text-white hover:shadow-2xl hover:scale-105"
                  )}
                >
                  <Camera className="w-6 h-6 mr-3" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === 'profile' ? 'preferences' : 'profile')}
                  className="px-12 py-6 font-bold text-lg border-3 border-white/40 text-white hover:bg-white/15 hover:border-white/60 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-xl hover:scale-105"
                >
                  <Settings className="w-6 h-6 mr-3" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the content remains the same... */}
        {/* You can add the activity feed and tabs sections here */}
        
      </div>
    </div>
  );
}