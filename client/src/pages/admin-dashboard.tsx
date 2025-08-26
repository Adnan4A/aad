import { useState, useEffect } from 'react';
import { onAuthChange } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  isUserAdmin, 
  getAllUsers, 
  deleteUser, 
  suspendUser, 
  updateUserRole,
  resendEmailVerification
} from '@/lib/firebase';
import { 
  Users, 
  Coins, 
  Settings, 
  Activity, 
  AlertTriangle, 
  Shield, 
  Trash2, 
  UserX, 
  Eye, 
  EyeOff,
  UserCheck,
  UserPlus,
  Search,
  History,
  Clock,
  CheckCircle,
  Ban,
  PlayCircle,
  Crown,
  Star,
  Diamond,
  Building,
  Mail,
  RefreshCw,
  ChevronRight,
  Edit3,
  TrendingUp,
  Briefcase,
  User,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Backend API Functions using Firebase
const toggleCoinVisibilityAPI = async (coinId: string, hidden: boolean, adminId: string, adminName: string) => {
  const response = await fetch('/api/admin/toggle-coin-visibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coinId, hidden, adminId, adminName }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to toggle coin visibility: ${response.statusText}`);
  }
  
  return response.json();
};

const getHiddenCoinsAPI = async () => {
  const response = await fetch('/api/admin/hidden-coins');
  if (!response.ok) {
    throw new Error(`Failed to get hidden coins: ${response.statusText}`);
  }
  const data = await response.json();
  return data.hiddenCoins || [];
};

const getAdminActivitiesAPI = async (limit = 100) => {
  const response = await fetch(`/api/admin/activities?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to get admin activities: ${response.statusText}`);
  }
  const data = await response.json();
  return data.activities || [];
};

const getUserActivitiesAPI = async (userId: string, limit = 50) => {
  const response = await fetch(`/api/admin/user-activities/${userId}?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to get user activities: ${response.statusText}`);
  }
  return response.json();
};

const getAllUserActivitiesAPI = async (limitOrTimeframe: number | string = 100) => {
  const isTimeframe = typeof limitOrTimeframe === 'string';
  const endpoint = isTimeframe 
    ? `/api/admin/all-user-activities?timeframe=${limitOrTimeframe}&limit=1000`
    : `/api/admin/all-user-activities?limit=${limitOrTimeframe}`;
  
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to get all user activities: ${response.statusText}`);
  }
  const data = await response.json();
  return data.activities || [];
};

// User Activity History Component
const UserActivityHistory = () => {
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const { data: allUserActivities = [], isLoading } = useQuery({
    queryKey: ['/api/admin/all-user-activities', selectedTimeframe],
    queryFn: () => getAllUserActivitiesAPI(selectedTimeframe === '24h' ? 100 : selectedTimeframe === '7d' ? 500 : 1000),
    enabled: true,
    refetchInterval: 5000 // Real-time updates every 5 seconds
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'session_started': return <Users className="h-4 w-4 text-green-400" />;
      case 'page_visited':
      case 'page_view': return <Eye className="h-4 w-4 text-blue-400" />;
      case 'coin_viewed':
      case 'coin_view': return <Coins className="h-4 w-4 text-yellow-400" />;
      case 'chart_viewed':
      case 'chart_view': return <Activity className="h-4 w-4 text-purple-400" />;
      case 'logout':
      case 'session_ended': return <UserX className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'login':
      case 'session_started': return 'border-green-500 text-green-400';
      case 'page_visited':
      case 'page_view': return 'border-blue-500 text-blue-400';
      case 'coin_viewed':
      case 'coin_view': return 'border-yellow-500 text-yellow-400';
      case 'chart_viewed':
      case 'chart_view': return 'border-purple-500 text-purple-400';
      case 'logout':
      case 'session_ended': return 'border-red-500 text-red-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const filteredActivities = activityFilter === 'all' 
    ? allUserActivities 
    : allUserActivities.filter((activity: any) => activity.action === activityFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-gray-300">Loading user activities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-gray-300 text-sm">Filter:</Label>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="page_visited">Page Views</SelectItem>
                <SelectItem value="coin_viewed">Coin Views</SelectItem>
                <SelectItem value="chart_viewed">Chart Access</SelectItem>
                <SelectItem value="session_started">Sessions</SelectItem>
                <SelectItem value="logout">Logouts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-300 text-sm">Timeframe:</Label>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Badge variant="outline" className="text-white border-white/30">
          {filteredActivities.length} activities
        </Badge>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Page Views</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {allUserActivities.filter(a => a.action === 'page_visited' || a.type === 'page_view').length}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Coin Views</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {allUserActivities.filter(a => a.action === 'coin_viewed' || a.type === 'coin_view').length}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Chart Views</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {allUserActivities.filter(a => a.action === 'chart_viewed' || a.type === 'chart_view').length}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-400" />
            <span className="text-gray-300 text-sm">Logins</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {allUserActivities.filter(a => a.action === 'login' || a.type === 'login').length}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="h-4 w-4 text-red-400" />
            <span className="text-gray-300 text-sm">Logouts</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {allUserActivities.filter(a => a.action === 'logout' || a.type === 'logout').length}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Active Users</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {new Set(allUserActivities.map(a => a.userId)).size}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <ScrollArea className="h-96">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20">
              <TableHead className="text-gray-300">User</TableHead>
              <TableHead className="text-gray-300">Action</TableHead>
              <TableHead className="text-gray-300">Details</TableHead>
              <TableHead className="text-gray-300">Device Info</TableHead>
              <TableHead className="text-gray-300">Session ID</TableHead>
              <TableHead className="text-gray-300">Time Spent</TableHead>
              <TableHead className="text-gray-300">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((activity: any) => (
              <TableRow key={activity.id} className="border-white/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {activity.userPhotoURL ? (
                        <img src={activity.userPhotoURL} alt={activity.userName} className="rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                          {activity.userName?.charAt(0)?.toUpperCase() || activity.userEmail?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span 
                        className="text-white text-sm font-medium cursor-pointer hover:text-blue-300 transition-colors"
                        onClick={() => {
                          // Click functionality disabled for now
                          // const adminUser = users.find((u: AdminUser) => u.uid === activity.userId);
                          // if (adminUser) {
                          //   setSelectedUserForProfile(adminUser);
                          //   setShowUserProfileCard(true);
                          // }
                        }}
                      >
                        {activity.userName && activity.userName !== 'Unknown' ? activity.userName : (activity.userEmail && activity.userEmail !== 'Unknown Email' ? activity.userEmail.split('@')[0] : `User-${activity.userId.slice(-6)}`)}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {activity.userEmail && activity.userEmail !== 'Unknown Email' ? activity.userEmail : `ID: ${activity.userId.slice(-8)}`}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.action)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getActivityColor(activity.action)}`}
                    >
                      {activity.action.replace('_', ' ')}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-white text-sm">
                      {(activity.action === 'page_visited' || activity.type === 'page_view') && (
                        <span>Visited: <code className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">{activity.pageUrl || activity.details}</code></span>
                      )}
                      {(activity.action === 'coin_viewed' || activity.type === 'coin_view') && (
                        <div className="space-y-1">
                          <span>Coin: <code className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">{activity.metadata?.coinName || activity.coinId || activity.details}</code></span>
                          {activity.coinId && (
                            <div className="text-gray-400 text-xs">ID: {activity.coinId}</div>
                          )}
                        </div>
                      )}
                      {(activity.action === 'chart_viewed' || activity.type === 'chart_view') && (
                        <div className="space-y-1">
                          <span>Chart: <code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">{activity.metadata?.coinName || activity.coinId}</code></span>
                          <div className="text-gray-400 text-xs">Timeframe: {activity.metadata?.timeframe || 'unknown'}</div>
                        </div>
                      )}
                      {(activity.action === 'session_started' || activity.type === 'session_start') && (
                        <span className="text-green-300">Session started</span>
                      )}
                      {(activity.action === 'login' || activity.action === 'logout') && (
                        <span className={activity.action === 'login' ? 'text-green-300' : 'text-red-300'}>
                          {activity.action === 'login' ? '🔐 User logged in' : '🚪 User logged out'}
                        </span>
                      )}
                    </div>
                    {activity.referrer && activity.referrer !== window.location.origin && (
                      <div className="text-gray-400 text-xs">
                        <span className="opacity-70">From: {activity.referrer}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center text-xs">
                    {activity.browserInfo ? (
                      <div className="space-y-1">
                        <div className="text-white">
                          {activity.browserInfo.includes('Chrome') ? '🌐 Chrome' : 
                           activity.browserInfo.includes('Safari') ? '🧭 Safari' : 
                           activity.browserInfo.includes('Firefox') ? '🦊 Firefox' : 
                           activity.browserInfo.includes('Edge') ? '🔷 Edge' : '🌐 Other'}
                        </div>
                        <div className="text-gray-400">
                          {activity.browserInfo.includes('Mobile') ? '📱 Mobile' : 
                           activity.browserInfo.includes('Windows') ? '🖥️ Windows' : 
                           activity.browserInfo.includes('Mac') ? '🍎 Mac' : 
                           activity.browserInfo.includes('Linux') ? '🐧 Linux' : '💻 Desktop'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unknown</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center text-xs">
                    <code className="bg-gray-500/20 text-gray-300 px-1 py-0.5 rounded text-xs">
                      {activity.sessionId ? activity.sessionId.slice(-8) : 'N/A'}
                    </code>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    {activity.timeSpent ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                        {activity.timeSpent}s
                      </Badge>
                    ) : activity.sessionDuration ? (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {Math.round(activity.sessionDuration / 60000)}m
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-400 text-xs space-y-1">
                    <div>{new Date(activity.timestamp).toLocaleDateString()}</div>
                    <div>{new Date(activity.timestamp).toLocaleTimeString()}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredActivities.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No user activities found for the selected timeframe</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

// User Activity Tracking Functions
const trackPageView = async (userId: string, sessionId: string, pageUrl: string, referrer?: string) => {
  if (!userId || !sessionId) return;
  try {
    await fetch('/api/track/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        pageUrl,
        referrer,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

const trackCoinView = async (userId: string, sessionId: string, coinId: string, coinName: string, timeSpent?: number) => {
  if (!userId || !sessionId) return;
  try {
    await fetch('/api/track/coin-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        coinId,
        coinName,
        timeSpent,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Failed to track coin view:', error);
  }
};

const startUserSession = async (userId: string, sessionId: string) => {
  if (!userId || !sessionId) return;
  try {
    await fetch('/api/track/session-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        userAgent: navigator.userAgent,
        ipAddress: '', // Will be set by server
      }),
    });
  } catch (error) {
    console.error('Failed to start user session:', error);
  }
};

// Types
interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: string;
  lastLoginAt: string;
  lastUpdated?: string;
  watchlist: string[];
  isActive: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  activities?: any[];
  accountStatus?: 'active' | 'suspended' | 'deleted';
  deletedFromAuth?: boolean;
  deletedDate?: string;
  deletedBy?: string;
  
  // Enhanced profile fields
  userType?: 'casual' | 'trader' | 'investor' | 'professional' | 'institutional';
  accountType?: 'standard' | 'premium' | 'pro' | 'enterprise';
  verificationLevel?: 'basic' | 'verified' | 'premium' | 'institutional';
  profileCompleteness?: number;
  
  // Personal info
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    location?: string;
    occupation?: string;
  };
  
  // Security info
  security?: {
    phoneVerified?: boolean;
    identityVerified?: boolean;
    twoFactorEnabled?: boolean;
  };
  
  // Trading profile
  tradingProfile?: {
    experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | 'very-aggressive';
  };
  
  // Stats
  stats?: {
    totalPortfolioValue?: number;
    totalTrades?: number;
    winRate?: number;
  };
}

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
    return unsubscribe;
  }, []);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showTotalUsersPage, setShowTotalUsersPage] = useState(false);
  const [showUserProfileCard, setShowUserProfileCard] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<AdminUser | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTab, setSelectedTab] = useState('users');
  const [hiddenCoins, setHiddenCoins] = useState<string[]>([]);
  const [showHiddenCoinsModal, setShowHiddenCoinsModal] = useState(false);
  
  // Get hidden coins from Firebase backend
  const { data: hiddenCoinsResponse } = useQuery({
    queryKey: ['/api/admin/hidden-coins'],
    queryFn: () => getHiddenCoinsAPI(),
    enabled: isAdmin,
    refetchInterval: 10000 // Refresh every 10 seconds for real-time updates
  });

  // Update local state when hidden coins data changes (getHiddenCoinsAPI returns array directly)
  useEffect(() => {
    const hiddenCoinsData = hiddenCoinsResponse || []; // hiddenCoinsResponse is already the array
    if (JSON.stringify(hiddenCoins) !== JSON.stringify(hiddenCoinsData)) {
      setHiddenCoins(hiddenCoinsData);
      console.log('Hidden coins updated:', hiddenCoinsData); // Debug log
    }
  }, [hiddenCoinsResponse]); // Remove hiddenCoins from deps to prevent infinite loop

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive"
          });
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, toast]);

  // Get all users query with real-time refresh
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAllUsers,
    enabled: isAdmin,
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true
  });

  // Get admin activities query using Firebase backend
  const { data: adminActivitiesResponse } = useQuery<any>({
    queryKey: ['/api/admin/activities'],
    enabled: isAdmin,
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Get all user activities for comprehensive history
  const { data: allUserActivitiesResponse } = useQuery<any>({
    queryKey: ['/api/admin/all-user-activities'],
    enabled: isAdmin,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Extract activities data from API responses
  // Handle both response formats: {activities: [...]} or directly [...]
  const adminActivities = Array.isArray(adminActivitiesResponse) 
    ? adminActivitiesResponse 
    : (adminActivitiesResponse?.activities || []);
  const allUserActivities = Array.isArray(allUserActivitiesResponse)
    ? allUserActivitiesResponse
    : (allUserActivitiesResponse?.activities || []);
  
  // Combined activities for display (admin + user activities)
  const combinedActivities = [...adminActivities, ...allUserActivities]
    .sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime())
    .slice(0, 100); // Show latest 100 activities

  // Get coins data query
  const { data: coins = [] } = useQuery<CoinData[]>({
    queryKey: ['/api/coins'],
    enabled: isAdmin
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, adminId }: { userId: string; adminId: string }) => {
      await deleteUser(userId, adminId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, adminId, suspended }: { userId: string; adminId: string; suspended: boolean }) => {
      await suspendUser(userId, adminId, suspended);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Status Updated",
        description: "User suspension status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, adminId, newRole }: { userId: string; adminId: string; newRole: 'user' | 'admin' | 'super_admin' }) => {
      await updateUserRole(userId, adminId, newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Role Updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user role: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update user type mutation
  const updateUserTypeMutation = useMutation({
    mutationFn: async ({ userId, adminId, userType, accountType }: { userId: string; adminId: string; userType?: string; accountType?: string }) => {
      const response = await fetch('/api/admin/update-user-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminId, userType, accountType })
      });
      if (!response.ok) throw new Error('Failed to update user type');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Type Updated",
        description: "User type and account settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user type: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle coin visibility mutation
  const toggleCoinMutation = useMutation({
    mutationFn: async ({ coinId, hidden }: { coinId: string; hidden: boolean }) => {
      await toggleCoinVisibilityAPI(coinId, hidden, user!.uid, user!.displayName || user!.email);
    },
    onSuccess: (_, variables) => {
      setHiddenCoins(prev => 
        variables.hidden 
          ? [...prev, variables.coinId]
          : prev.filter(id => id !== variables.coinId)
      );
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hidden-coins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] });
      toast({
        title: "Coin Visibility Updated",
        description: `Coin has been ${variables.hidden ? 'hidden from' : 'shown on'} the website. This change is now live for all users.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update coin visibility: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Helper functions
  const getUserTypeIcon = (userType: string) => {
    const icons = {
      casual: <User className="h-4 w-4 text-blue-300" />,
      trader: <TrendingUp className="h-4 w-4 text-green-300" />,
      investor: <Building className="h-4 w-4 text-purple-300" />,
      professional: <Briefcase className="h-4 w-4 text-orange-300" />,
      institutional: <Diamond className="h-4 w-4 text-pink-300" />
    };
    return icons[userType as keyof typeof icons] || <User className="h-4 w-4 text-gray-300" />;
  };

  const getAccountTypeIcon = (accountType: string) => {
    const icons = {
      standard: <User className="h-4 w-4 text-gray-300" />,
      premium: <Star className="h-4 w-4 text-yellow-300" />,
      pro: <Crown className="h-4 w-4 text-purple-300" />,
      enterprise: <Diamond className="h-4 w-4 text-blue-300" />
    };
    return icons[accountType as keyof typeof icons] || <User className="h-4 w-4 text-gray-300" />;
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      user: <User className="h-4 w-4 text-blue-300" />,
      admin: <Shield className="h-4 w-4 text-yellow-300" />,
      super_admin: <Crown className="h-4 w-4 text-red-300" />
    };
    return icons[role as keyof typeof icons] || <User className="h-4 w-4 text-gray-300" />;
  };

  const getUserStatus = (user: AdminUser) => {
    if (user.accountStatus === 'deleted' || user.deletedFromAuth) {
      return { status: 'Deleted', variant: 'destructive' as const, color: 'text-red-500' };
    } else if (!user.isActive || user.accountStatus === 'suspended') {
      return { status: 'Suspended', variant: 'destructive' as const, color: 'text-yellow-500' };
    } else {
      return { status: 'Active', variant: 'default' as const, color: 'text-green-500' };
    }
  };

  const handleUpdateUserType = async (userId: string, userType?: string, accountType?: string) => {
    if (!user?.uid) return;
    updateUserTypeMutation.mutate({ userId, adminId: user.uid, userType, accountType });
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    if (!user?.uid) return;
    updateUserRoleMutation.mutate({ userId, adminId: user.uid, newRole });
  };

  // Filter users based on search
  const filteredUsers = users.filter((user: AdminUser) => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Active users only for User Management tab
  const activeUsers = users.filter(user => {
    const status = getUserStatus(user);
    return status.status === 'Active';
  });

  const filteredActiveUsers = activeUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Refresh all data
  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
    queryClient.invalidateQueries({ queryKey: ['/api/coins'] });
    toast({
      title: "Data Refreshed",
      description: "All dashboard data has been refreshed successfully.",
    });
  };

  // Auto-refresh every 60 seconds for total users page
  useEffect(() => {
    if (showTotalUsersPage) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      }, 60000); // 60 seconds
      return () => clearInterval(interval);
    }
  }, [showTotalUsersPage, queryClient]);

  // Filter coins based on search
  const filteredCoins = coins.filter((coin: CoinData) => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // User Profile Card Component - Small modal for quick user info
  const UserProfileCard = ({ user: profileUser, isOpen, onClose }: { user: AdminUser | null; isOpen: boolean; onClose: () => void; }) => {
    if (!profileUser) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-slate-900/95 backdrop-blur-xl border-white/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-center">User Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Profile Picture & Basic Info */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profileUser.photoURL || ""} className="object-cover" />
                <AvatarFallback className="bg-purple-600 text-white text-xl font-bold">
                  {profileUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">{profileUser.displayName}</h3>
                <p className="text-gray-300">{profileUser.email}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {profileUser.uid}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-3 border-t border-white/20 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-xs">Bio</Label>
                  <p className="text-white text-sm">{(profileUser as any).bio || 'No bio available'}</p>
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Country</Label>
                  <p className="text-white text-sm">{(profileUser as any).location?.country || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300 text-xs">Member Since</Label>
                <p className="text-white text-sm">{new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300 text-xs">Status</Label>
                  <Badge 
                    variant={getUserStatus(profileUser).variant}
                    className={`ml-2 ${
                      getUserStatus(profileUser).status === 'Active' ? 'bg-green-600 text-white' : 
                      getUserStatus(profileUser).status === 'Deleted' ? 'bg-red-600 text-white' : 
                      'bg-yellow-600 text-white'
                    }`}
                  >
                    {getUserStatus(profileUser).status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-300 text-xs">Verification</Label>
                  <div className="flex items-center ml-2">
                    {profileUser.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // User Detail Modal Component
  const UserDetailModal = ({ user: modalUser, isOpen, onClose }: { user: AdminUser | null; isOpen: boolean; onClose: () => void; }) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedUserType, setSelectedUserType] = useState<string>('');
    const [selectedAccountType, setSelectedAccountType] = useState<string>('');
    
    // Update state when modal user changes
    useEffect(() => {
      if (modalUser) {
        setSelectedRole(modalUser.role);
        setSelectedUserType(modalUser.userType || 'casual');
        setSelectedAccountType(modalUser.accountType || 'standard');
      }
    }, [modalUser]);
    
    if (!modalUser) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={modalUser.photoURL || ""} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {modalUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{modalUser.displayName}</h3>
                <p className="text-sm text-gray-400">{modalUser.email}</p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Comprehensive user management and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Role Management */}
            <div className="space-y-3">
              <Label className="text-white font-medium">User Role</Label>
              <div className="flex items-center gap-2">
                {getRoleIcon(selectedRole)}
                <Select 
                  value={selectedRole} 
                  onValueChange={(newRole) => {
                    setSelectedRole(newRole);
                    handleUpdateUserRole(modalUser.id, newRole as any);
                  }}
                  disabled={updateUserRoleMutation.isPending}
                >
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="z-[10000] bg-slate-800 border-white/20">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* User Type Management */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-white font-medium">User Type</Label>
                <div className="flex items-center gap-2">
                  {getUserTypeIcon(selectedUserType)}
                  <Select 
                    value={selectedUserType} 
                    onValueChange={(userType) => {
                      setSelectedUserType(userType);
                      handleUpdateUserType(modalUser.id, userType);
                    }}
                    disabled={updateUserTypeMutation.isPending}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] bg-slate-800 border-white/20">
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="trader">Trader</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white font-medium">Account Type</Label>
                <div className="flex items-center gap-2">
                  {getAccountTypeIcon(selectedAccountType)}
                  <Select 
                    value={selectedAccountType} 
                    onValueChange={(accountType) => {
                      setSelectedAccountType(accountType);
                      handleUpdateUserType(modalUser.id, undefined, accountType);
                    }}
                    disabled={updateUserTypeMutation.isPending}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] bg-slate-800 border-white/20">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Watchlist</p>
                <p className="text-xl font-bold text-white">{modalUser.watchlist?.length || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Joined</p>
                <p className="text-sm font-medium text-white">
                  {new Date(modalUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400">Status</p>
                <Badge 
                  variant={getUserStatus(modalUser).variant}
                  className={getUserStatus(modalUser).color}
                >
                  {getUserStatus(modalUser).status}
                </Badge>
              </div>
            </div>

            {/* Action Buttons - Hide for deleted users */}
            {getUserStatus(modalUser).status !== 'Deleted' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => suspendUserMutation.mutate({ 
                    userId: modalUser.id, 
                    adminId: user?.uid || '', 
                    suspended: modalUser.isActive 
                  })}
                  disabled={suspendUserMutation.isPending}
                  variant={modalUser.isActive ? "destructive" : "default"}
                  size="sm"
                >
                  {modalUser.isActive ? <Ban className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                  {modalUser.isActive ? 'Suspend' : 'Activate'}
                </Button>
                <Button
                  onClick={() => deleteUserMutation.mutate({ 
                    userId: modalUser.id, 
                    adminId: user?.uid || '' 
                  })}
                  disabled={deleteUserMutation.isPending}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              </div>
            )}
            
            {/* Show message for deleted users */}
            {getUserStatus(modalUser).status === 'Deleted' && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">This account has been deleted and cannot be modified.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Hidden Coins Modal Component - Enhanced with better information and bulk actions
  const HiddenCoinsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    // Filter to only show hidden coins and include coins that might not be in the current coins list
    const hiddenCoinsList = hiddenCoins.map(coinId => {
      const coinData = coins.find((coin: CoinData) => coin.id === coinId);
      return coinData || { id: coinId, name: coinId, symbol: coinId, image: '', current_price: 0, market_cap_rank: 0 };
    });
    
    const unhideAllCoins = async () => {
      for (const coinId of hiddenCoins) {
        try {
          await toggleCoinVisibilityAPI(coinId, false, user!.uid, user!.displayName || user!.email);
        } catch (error) {
          console.error(`Failed to unhide ${coinId}:`, error);
        }
      }
      // Refresh the hidden coins data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hidden-coins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] });
      toast({
        title: "All Coins Unhidden",
        description: `${hiddenCoins.length} coins have been made visible to all users.`,
      });
    };
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-slate-900/95 backdrop-blur-lg border-white/20" style={{zIndex: 10000, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-red-400" />
              Hidden Coins Management ({hiddenCoins.length})
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              These coins are currently hidden from public view. Users cannot see them in listings, search, or access their data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {hiddenCoins.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-400 text-lg">All coins are currently visible</p>
                <p className="text-gray-500 text-sm">No coins are hidden from public listings</p>
              </div>
            ) : (
              <>
                {/* Action buttons */}
                <div className="flex items-center justify-between bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Warning: Hidden coins impact user experience</p>
                      <p className="text-red-300 text-sm">These coins are completely inaccessible to users</p>
                    </div>
                  </div>
                  <Button
                    onClick={unhideAllCoins}
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                    data-testid="button-unhide-all-coins"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Unhide All
                  </Button>
                </div>

                {/* Hidden coins list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {hiddenCoinsList.map((coin) => (
                    <Card key={coin.id} className="bg-red-500/10 backdrop-blur-lg border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {coin.image ? (
                              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                <Coins className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-white">{coin.name}</h4>
                              <p className="text-sm text-red-300">{coin.symbol.toUpperCase()}</p>
                              {coin.current_price > 0 && (
                                <p className="text-xs text-gray-400">${coin.current_price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                              HIDDEN
                            </Badge>
                            <Button
                              onClick={() => toggleCoinMutation.mutate({ 
                                coinId: coin.id, 
                                hidden: false // Always unhide since we're only showing hidden coins
                              })}
                              disabled={toggleCoinMutation.isPending}
                              variant="outline"
                              size="sm"
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                              data-testid={`button-unhide-coin-${coin.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Unhide
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // All Users Modal Component
  const AllUsersModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-slate-900/95 backdrop-blur-lg border-white/20 z-[9999]" style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
        <DialogHeader>
          <DialogTitle className="text-white">All Users Management</DialogTitle>
          <DialogDescription className="text-gray-300">
            Comprehensive user management with role editing and detailed information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* User Cards */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((userItem: AdminUser) => (
                <Card 
                  key={userItem.id} 
                  className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(userItem);
                    setIsUserModalOpen(true);
                  }}
                  data-testid={`card-user-${userItem.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userItem.photoURL || ""} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {userItem.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium text-white truncate cursor-pointer hover:text-blue-300 transition-colors"
                          onClick={() => {
                            setSelectedUserForProfile(userItem);
                            setShowUserProfileCard(true);
                          }}
                        >
                          {userItem.displayName}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">{userItem.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Role:</span>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(userItem.role)}
                          <span className="text-white capitalize">{userItem.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Type:</span>
                        <div className="flex items-center gap-1">
                          {getUserTypeIcon(userItem.userType || 'casual')}
                          <span className="text-white capitalize">{userItem.userType || 'casual'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Account:</span>
                        <div className="flex items-center gap-1">
                          {getAccountTypeIcon(userItem.accountType || 'standard')}
                          <span className="text-white capitalize">{userItem.accountType || 'standard'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <Badge 
                        variant={getUserStatus(userItem).variant}
                        className={`text-xs ${getUserStatus(userItem).color}`}
                      >
                        {getUserStatus(userItem).status}
                      </Badge>
                      <Edit3 className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Total Users Full Page Component
  const TotalUsersPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTotalUsersPage(false)}
                className="border-white/30 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-white drop-shadow-lg" />
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Total Users ({users.length})</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefreshAll}
                className="border-white/30 text-white hover:bg-white/20"
                data-testid="button-refresh-total-users"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <p className="text-gray-200 drop-shadow-md mt-2">Complete overview of all registered users</p>
        </div>

        {/* Enhanced Users Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Joined</TableHead>
                    <TableHead className="text-gray-300">Last Login</TableHead>
                    <TableHead className="text-gray-300 min-w-[250px]">User Details</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Account</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Watchlist</TableHead>
                    <TableHead className="text-gray-300">Email Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((tableUser: AdminUser) => (
                    <TableRow key={tableUser.id} className="border-white/20 hover:bg-white/5">
                      <TableCell>
                        <Badge 
                          variant={getUserStatus(tableUser).variant}
                          className={`${
                            getUserStatus(tableUser).status === 'Active' ? 'bg-green-600 text-white' : 
                            getUserStatus(tableUser).status === 'Deleted' ? 'bg-red-600 text-white' : 
                            'bg-yellow-600 text-black'
                          }`}
                        >
                          {getUserStatus(tableUser).status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-300">
                          {new Date(tableUser.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tableUser.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-300">
                          {new Date(tableUser.lastLoginAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tableUser.lastLoginAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={tableUser.photoURL || ''} 
                              alt={tableUser.displayName}
                              className="object-cover" 
                            />
                            <AvatarFallback className="bg-purple-600 text-white font-medium">
                              {tableUser.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-white font-medium">{tableUser.displayName}</div>
                            <div className="text-gray-400 text-sm">{tableUser.email}</div>
                            <div className="text-gray-500 text-xs">ID: {tableUser.uid}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getUserStatus(tableUser).status === 'Active' && (
                            <>
                              <Button
                                onClick={() => suspendUserMutation.mutate({ 
                                  userId: tableUser.id, 
                                  adminId: user?.uid || '', 
                                  suspended: true 
                                })}
                                disabled={suspendUserMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                                data-testid={`button-suspend-user-${tableUser.id}`}
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => deleteUserMutation.mutate({ 
                                  userId: tableUser.id, 
                                  adminId: user?.uid || '' 
                                })}
                                disabled={deleteUserMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 border-red-600 text-red-400 hover:bg-red-600/20"
                                data-testid={`button-delete-user-${tableUser.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {getUserStatus(tableUser).status === 'Suspended' && (
                            <>
                              <Button
                                onClick={() => suspendUserMutation.mutate({ 
                                  userId: tableUser.id, 
                                  adminId: user?.uid || '', 
                                  suspended: false 
                                })}
                                disabled={suspendUserMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 border-green-600 text-green-400 hover:bg-green-600/20"
                                data-testid={`button-activate-user-${tableUser.id}`}
                              >
                                <PlayCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => deleteUserMutation.mutate({ 
                                  userId: tableUser.id, 
                                  adminId: user?.uid || '' 
                                })}
                                disabled={deleteUserMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 border-red-600 text-red-400 hover:bg-red-600/20"
                                data-testid={`button-delete-user-${tableUser.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {getUserStatus(tableUser).status === 'Deleted' && (
                            <span className="text-gray-500 text-sm">No actions available</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(tableUser.userType || 'casual')}
                          <span className="text-white text-sm capitalize">{tableUser.userType || 'casual'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAccountTypeIcon(tableUser.accountType || 'standard')}
                          <span className="text-white text-sm capitalize">{tableUser.accountType || 'standard'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(tableUser.role)}
                          <Badge 
                            variant={tableUser.role === 'admin' ? 'default' : 'secondary'}
                            className={`${tableUser.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'}`}
                          >
                            {tableUser.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-white border-white/30">
                          {tableUser.watchlist?.length || 0} coins
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {tableUser.emailVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <X className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-400 py-12">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No users found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show Total Users page if selected
  if (showTotalUsersPage) {
    return <TotalUsersPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-white drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
          </div>
          <p className="text-gray-200 drop-shadow-md">Manage users, coins, and platform settings</p>
        </div>

        {/* Hidden Coins Alert - Display outside the main cards */}
        {hiddenCoins.length > 0 && (
          <Card className="mb-6 bg-red-500/10 backdrop-blur-md border-red-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EyeOff className="h-6 w-6 text-red-400" />
                  <div>
                    <CardTitle className="text-red-400">Hidden Coins Alert</CardTitle>
                    <CardDescription className="text-red-300">
                      {hiddenCoins.length} coin{hiddenCoins.length > 1 ? 's are' : ' is'} currently hidden from public view
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setShowHiddenCoinsModal(true)}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  data-testid="button-manage-hidden-coins"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Hidden Coins
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hiddenCoins.slice(0, 6).map((coinId) => {
                  const coin = coins.find((c: CoinData) => c.id === coinId);
                  return (
                    <div key={coinId} className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30">
                      {coin ? (
                        <>
                          <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                          <span className="text-white font-medium text-sm">{coin.name}</span>
                          <span className="text-red-300 text-xs">({coin.symbol.toUpperCase()})</span>
                        </>
                      ) : (
                        <span className="text-red-300 text-sm">{coinId}</span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleCoinMutation.mutate({ 
                          coinId: coinId, 
                          hidden: false 
                        })}
                        disabled={toggleCoinMutation.isPending}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        data-testid={`button-quick-unhide-${coinId}`}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
                {hiddenCoins.length > 6 && (
                  <div className="flex items-center px-3 py-2 text-red-300 text-sm">
                    +{hiddenCoins.length - 6} more...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-white drop-shadow-lg" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {users.filter((u: AdminUser) => u.isActive).length}
              </div>
              <p className="text-xs text-gray-400">Currently active</p>
            </CardContent>
          </Card>
          <Card 
            className="bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/15 transition-all duration-300 cursor-pointer"
            onClick={() => setShowTotalUsersPage(true)}
            data-testid="card-total-users"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white drop-shadow-lg" />
                <ChevronRight className="h-3 w-3 text-white/60" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <p className="text-xs text-gray-400">Click to view detailed users table</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Coins</CardTitle>
              <Coins className="h-4 w-4 text-white drop-shadow-lg" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{coins.length}</div>
              <p className="text-xs text-gray-400">Listed cryptocurrencies</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                onClick={() => setShowHiddenCoinsModal(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Hidden Coins</CardTitle>
              <EyeOff className="h-4 w-4 text-white drop-shadow-lg" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{hiddenCoins.length}</div>
              <p className="text-xs text-gray-400">Currently hidden - Click to manage</p>
              {hiddenCoins.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hiddenCoins.slice(0, 3).map((coinId) => (
                    <Badge key={coinId} variant="secondary" className="text-xs bg-red-600/20 text-red-300">
                      {coinId}
                    </Badge>
                  ))}
                  {hiddenCoins.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-red-600/20 text-red-300">
                      +{hiddenCoins.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/30 hover:bg-white/15 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Admin Actions</CardTitle>
              <Activity className="h-4 w-4 text-white drop-shadow-lg" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{adminActivities.length}</div>
              <p className="text-xs text-gray-400">Recent activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/10 backdrop-blur-lg border-white/30">
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="coins" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <Coins className="h-4 w-4 mr-2" />
              Coins
            </TabsTrigger>
            <TabsTrigger value="user-activities" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <Eye className="h-4 w-4 mr-2" />
              User Activities
            </TabsTrigger>
            <TabsTrigger value="admin-activities" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <History className="h-4 w-4 mr-2" />
              Admin Activities
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-all">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-gray-300">
                      View and manage all registered users
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRefreshAll}
                      className="border-white/30 text-white hover:bg-white/20"
                      data-testid="button-refresh-dashboard"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Account</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Verification</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActiveUsers.map((tableUser: AdminUser) => (
                        <TableRow key={tableUser.id} className="border-white/20">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={tableUser.photoURL || ''} 
                                  alt={tableUser.displayName}
                                  className="object-cover" 
                                />
                                <AvatarFallback className="bg-purple-600 text-white text-sm font-medium">
                                  {tableUser.displayName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div 
                                  className="text-white font-medium cursor-pointer hover:text-blue-300 transition-colors"
                                  onClick={() => {
                                    setSelectedUserForProfile(tableUser);
                                    setShowUserProfileCard(true);
                                  }}
                                  data-testid={`text-username-${tableUser.id}`}
                                >
                                  {tableUser.displayName}
                                </div>
                                <div className="text-gray-400 text-sm">{tableUser.email}</div>
                                {tableUser.emailVerified && (
                                  <div className="flex items-center gap-1 text-green-400 text-xs">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {tableUser.userType === 'institutional' && <Building className="h-4 w-4 text-purple-400" />}
                              {tableUser.userType === 'professional' && <Crown className="h-4 w-4 text-orange-400" />}
                              {tableUser.userType === 'investor' && <Diamond className="h-4 w-4 text-blue-400" />}
                              {tableUser.userType === 'trader' && <Activity className="h-4 w-4 text-green-400" />}
                              {(!tableUser.userType || tableUser.userType === 'casual') && <Users className="h-4 w-4 text-gray-400" />}
                              <Badge 
                                variant="outline"
                                className="text-white border-white/30 bg-white/10 backdrop-blur-sm"
                              >
                                {tableUser.userType || 'casual'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {tableUser.accountType === 'enterprise' && <Building className="h-4 w-4 text-purple-400" />}
                              {tableUser.accountType === 'pro' && <Crown className="h-4 w-4 text-orange-400" />}
                              {tableUser.accountType === 'premium' && <Star className="h-4 w-4 text-yellow-400" />}
                              {(!tableUser.accountType || tableUser.accountType === 'standard') && <Users className="h-4 w-4 text-gray-400" />}
                              <Badge 
                                variant="outline"
                                className={`text-white border-white/30 bg-white/10 backdrop-blur-sm ${
                                  tableUser.accountType === 'enterprise' ? 'border-purple-400' :
                                  tableUser.accountType === 'pro' ? 'border-orange-400' :
                                  tableUser.accountType === 'premium' ? 'border-yellow-400' :
                                  'border-gray-400'
                                }`}
                              >
                                {tableUser.accountType || 'standard'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={tableUser.role === 'admin' ? 'default' : 'secondary'}
                              className={tableUser.role === 'admin' ? 'bg-purple-600' : ''}
                            >
                              {tableUser.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getUserStatus(tableUser).variant}
                              className={`text-white ${
                                getUserStatus(tableUser).status === 'Active' ? 'bg-green-600' : 
                                getUserStatus(tableUser).status === 'Deleted' ? 'bg-red-600' : 
                                'bg-yellow-600'
                              }`}
                            >
                              {getUserStatus(tableUser).status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {tableUser.emailVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(tableUser);
                                  setIsUserModalOpen(true);
                                }}
                                className="border-white/30 text-white hover:bg-white/20"
                                data-testid={`button-edit-user-${tableUser.id}`}
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              
                              {getUserStatus(tableUser).status === 'Active' && (
                                <>
                                  <Button
                                    onClick={() => suspendUserMutation.mutate({ 
                                      userId: tableUser.id, 
                                      adminId: user?.uid || '', 
                                      suspended: true 
                                    })}
                                    disabled={suspendUserMutation.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                                    data-testid={`button-suspend-user-${tableUser.id}`}
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteUserMutation.mutate({ 
                                      userId: tableUser.id, 
                                      adminId: user?.uid || '' 
                                    })}
                                    disabled={deleteUserMutation.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 border-red-600 text-red-400 hover:bg-red-600/20"
                                    data-testid={`button-delete-user-${tableUser.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              
                              {getUserStatus(tableUser).status === 'Suspended' && (
                                <>
                                  <Button
                                    onClick={() => suspendUserMutation.mutate({ 
                                      userId: tableUser.id, 
                                      adminId: user?.uid || '', 
                                      suspended: false 
                                    })}
                                    disabled={suspendUserMutation.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 border-green-600 text-green-400 hover:bg-green-600/20"
                                    data-testid={`button-activate-user-${tableUser.id}`}
                                  >
                                    <PlayCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteUserMutation.mutate({ 
                                      userId: tableUser.id, 
                                      adminId: user?.uid || '' 
                                    })}
                                    disabled={deleteUserMutation.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 border-red-600 text-red-400 hover:bg-red-600/20"
                                    data-testid={`button-delete-user-${tableUser.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              
                              {getUserStatus(tableUser).status === 'Deleted' && (
                                <span className="text-gray-500 text-sm">No actions available</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">User Types</CardTitle>
                  <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Casual:</span>
                      <span>{users.filter((u: AdminUser) => u.userType === 'casual' || !u.userType).length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Trader:</span>
                      <span>{users.filter((u: AdminUser) => u.userType === 'trader').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Investor:</span>
                      <span>{users.filter((u: AdminUser) => u.userType === 'investor').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Professional:</span>
                      <span>{users.filter((u: AdminUser) => u.userType === 'professional').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Account Types</CardTitle>
                  <Shield className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Standard:</span>
                      <span>{users.filter((u: AdminUser) => u.accountType === 'standard' || !u.accountType).length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Premium:</span>
                      <span>{users.filter((u: AdminUser) => u.accountType === 'premium').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Pro:</span>
                      <span>{users.filter((u: AdminUser) => u.accountType === 'pro').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Enterprise:</span>
                      <span>{users.filter((u: AdminUser) => u.accountType === 'enterprise').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Verification Levels</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Basic:</span>
                      <span>{users.filter((u: AdminUser) => u.verificationLevel === 'basic' || !u.verificationLevel).length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Verified:</span>
                      <span>{users.filter((u: AdminUser) => u.verificationLevel === 'verified').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Premium:</span>
                      <span>{users.filter((u: AdminUser) => u.verificationLevel === 'premium').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Institutional:</span>
                      <span>{users.filter((u: AdminUser) => u.verificationLevel === 'institutional').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">Email Verification</CardTitle>
                  <Mail className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Verified:</span>
                      <span className="text-green-400">{users.filter((u: AdminUser) => u.emailVerified).length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Unverified:</span>
                      <span className="text-red-400">{users.filter((u: AdminUser) => !u.emailVerified).length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Verification Rate:</span>
                      <span className="text-blue-400">{users.length > 0 ? Math.round((users.filter((u: AdminUser) => u.emailVerified).length / users.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Activity Overview</CardTitle>
                  <CardDescription className="text-gray-300">
                    Recent user engagement and activity metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Email Verified Users</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {users.filter((u: AdminUser) => u.emailVerified).length} / {users.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Active Users (Last 24h)</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {users.filter((u: AdminUser) => {
                          const lastLogin = new Date(u.lastLoginAt);
                          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                          return lastLogin > dayAgo;
                        }).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Recent Signups (7 days)</span>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {users.filter((u: AdminUser) => {
                          const createdAt = new Date(u.createdAt);
                          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          return createdAt > weekAgo;
                        }).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Two-Factor Enabled</span>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        {users.filter((u: AdminUser) => u.security?.twoFactorEnabled).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Trading Profile Distribution</CardTitle>
                  <CardDescription className="text-gray-300">
                    User experience and risk tolerance breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-300 mb-2 block">Trading Experience</span>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Beginner:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => !u.tradingProfile?.experience || u.tradingProfile?.experience === 'beginner').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Intermediate:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => u.tradingProfile?.experience === 'intermediate').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Advanced:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => u.tradingProfile?.experience === 'advanced').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Expert:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => u.tradingProfile?.experience === 'expert').length}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="bg-white/20" />
                    <div>
                      <span className="text-sm text-gray-300 mb-2 block">Risk Tolerance</span>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Conservative:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => u.tradingProfile?.riskTolerance === 'conservative').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Moderate:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => !u.tradingProfile?.riskTolerance || u.tradingProfile?.riskTolerance === 'moderate').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Aggressive:</span>
                          <span className="text-white">{users.filter((u: AdminUser) => u.tradingProfile?.riskTolerance === 'aggressive').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coins Tab */}
          <TabsContent value="coins" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Coin Management</CardTitle>
                    <CardDescription className="text-gray-300">
                      Control which coins are displayed on the website
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search coins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">Coin</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300">Price</TableHead>
                        <TableHead className="text-gray-300">Rank</TableHead>
                        <TableHead className="text-gray-300">Visibility</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoins.map((coin: CoinData) => (
                        <TableRow key={coin.id} className="border-white/20">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img 
                                src={coin.image} 
                                alt={coin.name} 
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="text-white font-medium">{coin.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-300 uppercase">{coin.symbol}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">${coin.current_price?.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">#{coin.market_cap_rank}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={hiddenCoins.includes(coin.id) ? 'destructive' : 'default'}
                              className={hiddenCoins.includes(coin.id) ? '' : 'bg-green-600'}
                            >
                              {hiddenCoins.includes(coin.id) ? 'Hidden' : 'Visible'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={hiddenCoins.includes(coin.id) ? "default" : "outline"}
                              onClick={() => toggleCoinMutation.mutate({ 
                                coinId: coin.id, 
                                hidden: !hiddenCoins.includes(coin.id) 
                              })}
                              disabled={toggleCoinMutation.isPending}
                              className="border-white/30 text-white hover:bg-white/20"
                              data-testid={`button-toggle-coin-${coin.id}`}
                            >
                              {hiddenCoins.includes(coin.id) ? (
                                <><Eye className="h-4 w-4 mr-1" /> Show</>
                              ) : (
                                <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Activities Tab */}
          <TabsContent value="user-activities" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">User Activity Tracking</CardTitle>
                <CardDescription className="text-gray-300">
                  Monitor user interactions, watchlist changes, and coin views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Activity Type</TableHead>
                        <TableHead className="text-gray-300">Details</TableHead>
                        <TableHead className="text-gray-300">Time</TableHead>
                        <TableHead className="text-gray-300">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((tableUser: AdminUser) => 
                        (tableUser.activities || []).slice(0, 5).map((activity: any) => (
                          <TableRow key={`${tableUser.id}-${activity.id}`} className="border-white/20">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                                  {tableUser.displayName.charAt(0).toUpperCase()}
                                </div>
                                <span 
                                  className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors"
                                  onClick={() => {
                                    setSelectedUserForProfile(tableUser);
                                    setShowUserProfileCard(true);
                                  }}
                                  data-testid={`text-username-activity-${tableUser.id}`}
                                >
                                  {tableUser.displayName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {activity.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-300 text-sm">{activity.description}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-400 text-xs">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-400 text-xs">
                                  {activity.data?.coinId || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ).flat()}
                      {users.every((u: AdminUser) => !u.activities || u.activities.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No user activities tracked yet</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Activities Tab */}
          <TabsContent value="admin-activities" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Admin Activity Log</CardTitle>
                <CardDescription className="text-gray-300">
                  Track all administrative actions and system changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">Admin</TableHead>
                        <TableHead className="text-gray-300">Action</TableHead>
                        <TableHead className="text-gray-300">Target</TableHead>
                        <TableHead className="text-gray-300">Details</TableHead>
                        <TableHead className="text-gray-300">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedActivities.map((activity: any) => (
                        <TableRow key={activity.id} className="border-white/20">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-400" />
                              <span 
                                className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors"
                                onClick={() => {
                                  const adminUser = users.find((u: AdminUser) => u.uid === activity.adminId);
                                  if (adminUser) {
                                    setSelectedUserForProfile(adminUser);
                                    setShowUserProfileCard(true);
                                  }
                                }}
                                data-testid={`text-admin-name-${activity.adminId}`}
                              >
                                {users.find((u: AdminUser) => u.uid === activity.adminId)?.displayName || 'Unknown Admin'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                activity.action === 'user_delete' ? 'border-red-500 text-red-400' :
                                activity.action === 'user_suspend' ? 'border-yellow-500 text-yellow-400' :
                                activity.action === 'user_role_update' ? 'border-purple-500 text-purple-400' :
                                'border-blue-500 text-blue-400'
                              }`}
                            >
                              {activity.action.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-300 text-sm">{activity.target}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-300 text-sm">{activity.details}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-400 text-xs">
                              {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {combinedActivities.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No activities recorded yet</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Platform Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Configure global platform settings and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">Maintenance Mode</Label>
                    <p className="text-sm text-gray-400">Enable maintenance mode to restrict access</p>
                  </div>
                  <Switch data-testid="switch-maintenance-mode" />
                </div>
                
                <Separator className="bg-white/20" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white">API Rate Limiting</Label>
                    <p className="text-sm text-gray-400">Enable rate limiting for API endpoints</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-rate-limiting" />
                </div>
                
                <Separator className="bg-white/20" />
                
                <div className="space-y-3">
                  <Label className="text-white">Featured Coins</Label>
                  <p className="text-sm text-gray-400">Select coins to feature on the homepage</p>
                  <Input 
                    placeholder="bitcoin, ethereum, cardano" 
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    data-testid="input-featured-coins"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-save-settings">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab - Comprehensive User History */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Complete User Activity History</CardTitle>
                <CardDescription className="text-gray-300">
                  Real-time tracking of all user interactions: logins, page views, coin watches, and chart access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserActivityHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legacy User Detail Modal - Replaced by comprehensive UserDetailModal below */}

        {/* Interactive Modals */}
        <AllUsersModal isOpen={showAllUsers} onClose={() => setShowAllUsers(false)} />
        <HiddenCoinsModal isOpen={showHiddenCoinsModal} onClose={() => setShowHiddenCoinsModal(false)} />
        <UserDetailModal 
          user={selectedUser} 
          isOpen={isUserModalOpen} 
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUser(null);
          }} 
        />
        <UserProfileCard 
          user={selectedUserForProfile}
          isOpen={showUserProfileCard}
          onClose={() => {
            setShowUserProfileCard(false);
            setSelectedUserForProfile(null);
          }}
        />
      </div>
    </div>
  );
}