import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const apiKey = "AIzaSyBF8MObbKYAh0FAACHEX1WPbHbssQsSHOQ";
  const projectId = "movie-da146";

  const appId = "1:348002068886:web:bfddd1888b5bb6afbe95b7";
  
  if (!apiKey || !projectId || !appId) {
    console.error('Missing Firebase configuration. Please check your environment variables:');
    console.error('VITE_FIREBASE_API_KEY:', !!apiKey ? 'present' : 'missing');
    console.error('VITE_FIREBASE_PROJECT_ID:', !!projectId ? 'present' : 'missing');
    console.error('VITE_FIREBASE_APP_ID:', !!appId ? 'present' : 'missing');
    return false;
  }
  
  return { apiKey, projectId, appId };
};

const configValidation = validateFirebaseConfig();

// Initialize Firebase only if configuration is valid
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (configValidation) {
  const firebaseConfig = {
    apiKey: configValidation.apiKey,
    authDomain: `${configValidation.projectId}.firebaseapp.com`,
    projectId: configValidation.projectId,
    storageBucket: `${configValidation.projectId}.appspot.com`,
    messagingSenderId: "123456789",
    appId: configValidation.appId,
  };

  // Only log in development to avoid console spam
  if (import.meta.env.DEV) {
    console.log('Firebase config initialized:', {
      projectId: configValidation.projectId,
      hasApiKey: true,
      hasAppId: true
    });
  }

  try {
    // Check if Firebase app is already initialized
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.warn('Firebase not initialized due to missing configuration. Authentication features will not work.');
}

export { auth, db, storage };

// Email/Password authentication functions

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    const { sendEmailVerification } = await import('firebase/auth');
    await sendEmailVerification(userCredential.user);
    
    console.log('User created and verification email sent');
    return userCredential;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

export const signInWithEmail = (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  if (!auth) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('Firebase not initialized. Authentication state changes will not be tracked.');
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

// Watchlist functions

// Fallback storage keys
const WATCHLIST_STORAGE_KEY = 'crypto_watchlist_';
const OFFLINE_CHANGES_KEY = 'crypto_watchlist_offline_changes_';

// Helper function to get fallback watchlist from localStorage
const getFallbackWatchlist = (userId: string): string[] => {
  try {
    const key = WATCHLIST_STORAGE_KEY + userId;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting fallback watchlist:', error);
    return [];
  }
};

// Helper function to save fallback watchlist to localStorage
const saveFallbackWatchlist = (userId: string, watchlist: string[]) => {
  try {
    const key = WATCHLIST_STORAGE_KEY + userId;
    localStorage.setItem(key, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getUserWatchlist = async (userId: string): Promise<string[]> => {
  if (!db) {
    console.warn('Firebase not initialized. Using localStorage fallback for watchlist.');
    return getFallbackWatchlist(userId);
  }
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const firebaseWatchlist = userSnap.data().watchlist || [];
      // Update localStorage with Firebase data
      saveFallbackWatchlist(userId, firebaseWatchlist);
      return firebaseWatchlist;
    }
    return [];
  } catch (error) {
    console.error('Error getting user watchlist from Firebase, using localStorage fallback:', error);
    // Return fallback data from localStorage
    return getFallbackWatchlist(userId);
  }
};

export const getUserProfile = async (userId: string) => {
  if (!db) {
    console.warn('Firebase not initialized. Profile features will not work.');
    return null;
  }
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// New function to fetch user auth details from crypto_app_users collection
export const getUserAuthDetails = async (userId: string) => {
  if (!db) {
    console.warn('Firebase not initialized. Auth details features will not work.');
    return null;
  }
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      // Return only auth-related fields
      return {
        uid: userData.uid,
        email: userData.email,
        emailVerified: userData.emailVerified || false,
        emailVerifiedAt: userData.emailVerifiedAt,
        lastVerificationEmailSent: userData.lastVerificationEmailSent,
        isActive: userData.isActive,
        role: userData.role,
        userType: userData.userType,
        accountType: userData.accountType,
        verificationLevel: userData.verificationLevel,
        lastLoginAt: userData.lastLoginAt,
        createdAt: userData.createdAt,
        lastUpdated: userData.lastUpdated
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user auth details:', error);
    return null;
  }
};

export const createUserProfile = async (user: User) => {
  try {
    // Use separate collection for this website's user authentication system
    const userRef = doc(db, "crypto_app_users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || null,
        avatarURL: user.photoURL || null,
        avatarUpdatedAt: null,
        bio: '',
        location: '',
        website: '',
        phoneNumber: '',
        watchlist: [],
        role: user.email === 'hmzali24@gmail.com' ? 'admin' : 'user',
        isActive: true,
        emailVerified: user.emailVerified || false,
        emailVerifiedAt: user.emailVerified ? new Date().toISOString() : null,
        lastVerificationEmailSent: null,
        
        // User types and account levels
        userType: 'casual',
        accountType: 'standard',
        verificationLevel: 'basic',
        
        // Basic preferences
        preferences: {
          theme: 'dark',
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            priceAlerts: false
          }
        },
        
        // Basic stats
        stats: {
          totalPortfolioValue: 0,
          totalGainLoss: 0,
          favoriteCoins: [],
          tradingExperience: 'beginner'
        },
        
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      console.log('User profile created successfully in crypto_app_users collection');
    } else {
      await updateDoc(userRef, {
        lastLoginAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        displayName: user.displayName || userSnap.data().displayName || user.email?.split('@')[0] || 'User',
        role: userSnap.data().role || (user.email === 'hmzali24@gmail.com' ? 'admin' : 'user'),
        isActive: userSnap.data().isActive !== undefined ? userSnap.data().isActive : true,
        emailVerified: user.emailVerified || userSnap.data().emailVerified || false,
        emailVerifiedAt: user.emailVerified && !userSnap.data().emailVerifiedAt ? new Date().toISOString() : userSnap.data().emailVerifiedAt
      });
      console.log('User profile updated successfully');
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
  }
};

export const addToWatchlist = async (userId: string, coinId: string): Promise<void> => {
  // First, update localStorage immediately for instant UI feedback
  const currentWatchlist = getFallbackWatchlist(userId);
  if (!currentWatchlist.includes(coinId)) {
    const updatedWatchlist = [...currentWatchlist, coinId];
    saveFallbackWatchlist(userId, updatedWatchlist);
  }

  try {
    const userRef = doc(db, "crypto_app_users", userId);
    
    // Try to update the document first
    await updateDoc(userRef, {
      watchlist: arrayUnion(coinId),
      lastUpdated: new Date().toISOString()
    });
    
    // Track activity
    await addActivity(userId, 'watchlist_add', `Added ${coinId.toUpperCase()} to watchlist`, { coin: coinId });
    
    console.log(`Successfully added ${coinId} to watchlist for user ${userId}`);
  } catch (error) {
    console.error('Error adding to watchlist, using localStorage fallback:', error);
    
    // If document doesn't exist, try to create it
    if ((error as any).code === 'not-found') {
      try {
        const userRef = doc(db, "crypto_app_users", userId);
        await setDoc(userRef, {
          uid: userId,
          watchlist: [coinId],
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
        console.log(`Created user document and added ${coinId} to watchlist`);
        return;
      } catch (createError) {
        console.error('Error creating user document:', createError);
      }
    }
    
    // If Firebase is unavailable, the localStorage update above is our fallback
    // The data will sync when Firebase becomes available again
    console.log(`Watchlist updated in localStorage as fallback for user ${userId}`);
  }
};

export const removeFromWatchlist = async (userId: string, coinId: string): Promise<void> => {
  // First, update localStorage immediately for instant UI feedback
  const currentWatchlist = getFallbackWatchlist(userId);
  const updatedWatchlist = currentWatchlist.filter(id => id !== coinId);
  saveFallbackWatchlist(userId, updatedWatchlist);

  try {
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      watchlist: arrayRemove(coinId),
      lastUpdated: new Date().toISOString()
    });
    
    // Track activity
    await addActivity(userId, 'watchlist_remove', `Removed ${coinId.toUpperCase()} from watchlist`, { coin: coinId });
    
    console.log(`Successfully removed ${coinId} from watchlist for user ${userId}`);
  } catch (error) {
    console.error('Error removing from watchlist, using localStorage fallback:', error);
    // The localStorage update above is our fallback
    // The data will sync when Firebase becomes available again
    console.log(`Watchlist updated in localStorage as fallback for user ${userId}`);
  }
};

// Function to sync localStorage watchlist with Firebase when connection is restored
export const syncWatchlistWithFirebase = async (userId: string): Promise<void> => {
  try {
    const localWatchlist = getFallbackWatchlist(userId);
    if (localWatchlist.length === 0) return;

    const userRef = doc(db, "crypto_app_users", userId);
    await setDoc(userRef, {
      uid: userId,
      watchlist: localWatchlist,
      lastUpdated: new Date().toISOString(),
      syncedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Successfully synced watchlist with Firebase for user ${userId}`);
  } catch (error) {
    console.error('Error syncing watchlist with Firebase:', error);
  }
};

// Activity tracking function
export const addActivity = async (userId: string, type: string, description: string, data?: any) => {
  if (!db) return;
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentData = userSnap.data();
      const activities = currentData.activities || [];
      
      // Add new activity
      const newActivity = {
        id: Date.now().toString(),
        type,
        description,
        timestamp: new Date().toISOString(),
        data
      };
      
      // Keep only last 20 activities
      const updatedActivities = [newActivity, ...activities].slice(0, 20);
      
      await updateDoc(userRef, {
        activities: updatedActivities
      });
    }
  } catch (error) {
    console.error('Error adding activity:', error);
  }
};

// Profile management functions
export const updateUserProfile = async (userId: string, profileData: {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
}): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      ...profileData,
      lastUpdated: new Date().toISOString()
    });
    
    // Track profile update activity
    const changes = [];
    if (profileData.displayName) changes.push('name');
    if (profileData.bio) changes.push('bio');
    if (profileData.location) changes.push('location');
    if (profileData.website) changes.push('website');
    
    if (changes.length > 0) {
      await addActivity(userId, 'profile_update', `Updated profile: ${changes.join(', ')}`, { fields: changes });
    }
    
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Avatar upload and management functions
// Compress and save avatar directly to Firebase database with other profile data
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  if (!db) {
    throw new Error('Firebase database not initialized. Please check your configuration.');
  }
  
  // Validate file size (max 5MB original)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size too large. Maximum size allowed is 5MB.');
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please select an image file.');
  }
  
  try {
    console.log('Starting avatar upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    // Compress image to fit database limits
    const compressedBase64 = await compressImageForDatabase(file);
    console.log('Image compressed, base64 length:', compressedBase64.length);
    
    // Save directly to Firebase database with other profile data
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      avatarURL: compressedBase64,
      photoURL: compressedBase64,
      avatarUpdatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Avatar saved successfully to Firebase database');
    return compressedBase64;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Avatar upload failed: ${errorMessage}`);
  }
};

// Helper function to compress image to fit database size limits
const compressImageForDatabase = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions to keep image under 800KB when base64 encoded
      let { width, height } = calculateCompressedDimensions(img.width, img.height);
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw compressed image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels to stay under size limit
      let quality = 0.8;
      let base64: string;
      
      do {
        base64 = canvas.toDataURL('image/jpeg', quality);
        if (base64.length < 800000) break; // Target 800KB to be safe
        quality -= 0.1;
      } while (quality > 0.1);
      
      console.log(`Image compressed to ${width}x${height} at ${quality} quality`);
      resolve(base64);
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

// Calculate compressed dimensions
const calculateCompressedDimensions = (originalWidth: number, originalHeight: number) => {
  const maxDimension = 300; // Keep images small for database storage
  
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const ratio = Math.min(maxDimension / originalWidth, maxDimension / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
};

export const deleteAvatar = async (userId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  
  try {
    // Update user profile to remove avatar URL
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      photoURL: null,
      avatarURL: null,
      avatarUpdatedAt: null,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Avatar deleted successfully');
  } catch (error) {
    console.error('Error deleting avatar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to delete avatar: ${errorMessage}`);
  }
};

// Enhanced profile management functions
export const updateUserPreferences = async (userId: string, preferences: {
  theme?: 'light' | 'dark' | 'auto';
  currency?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    priceAlerts?: boolean;
  };
  privacy?: {
    profileVisible?: boolean;
    activityVisible?: boolean;
  };
}): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      preferences: preferences,
      lastUpdated: new Date().toISOString()
    });
    console.log('User preferences updated successfully');
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const updateUserStats = async (userId: string, stats: {
  totalPortfolioValue?: number;
  totalGainLoss?: number;
  totalGainLossPercentage?: number;
  favoriteCoins?: string[];
  tradingExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      stats: stats,
      lastUpdated: new Date().toISOString()
    });
    console.log('User stats updated successfully');
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const resendEmailVerification = async (userId: string) => {
  if (!auth || !db) {
    throw new Error('Firebase not initialized');
  }

  try {
    // Check rate limiting - 1 email per hour
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const lastSent = userData.lastVerificationEmailSent;
      
      if (lastSent) {
        const oneHourAgo = new Date().getTime() - (60 * 60 * 1000);
        const lastSentTime = new Date(lastSent).getTime();
        
        if (lastSentTime > oneHourAgo) {
          const nextAllowed = new Date(lastSentTime + (60 * 60 * 1000));
          throw new Error(`Verification email already sent. Next email allowed at ${nextAllowed.toLocaleTimeString()}`);
        }
      }
      
      // Send verification email
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        
        // Update last sent timestamp
        await updateDoc(userRef, {
          lastVerificationEmailSent: new Date().toISOString()
        });
        
        return 'Verification email sent successfully';
      } else {
        throw new Error('User already verified or not logged in');
      }
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Admin functions

// Check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  if (!db) return false;
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === 'admin' || userData.role === 'super_admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const isUserActive = async (userId: string): Promise<boolean> => {
  if (!db) return true; // Default to active if DB not available
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.isActive !== false; // Default to true if not explicitly false
    }
    return true; // Default to active for new users
  } catch (error) {
    console.error('Error checking user active status:', error);
    return true; // Default to active on error
  }
};

// Get all users (admin function)
export const getAllUsers = async (): Promise<any[]> => {
  if (!db) return [];
  
  try {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const usersRef = collection(db, "crypto_app_users");
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Delete user (admin function) - Deletes from both Firestore and Firebase Auth
export const deleteUser = async (userId: string, adminId: string): Promise<void> => {
  if (!db || !auth) throw new Error('Firebase not initialized');
  
  try {
    // Make API call to backend which handles both Firestore and Firebase Auth deletion
    const response = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, adminId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }

    const result = await response.json();
    console.log(`User ${userId} deleted successfully: ${result.message}`);
    
    if (result.authDeleted) {
      console.log('User deleted from both Firebase Auth and Firestore - user can now create a new account with the same email');
    } else {
      console.warn('User deleted from Firestore only - Firebase Auth deletion may have failed');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Suspend user (admin function)
export const suspendUser = async (userId: string, adminId: string, suspended: boolean): Promise<void> => {
  if (!db) throw new Error('Firebase not initialized');
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      isActive: !suspended,
      lastUpdated: new Date().toISOString(),
      suspendedAt: suspended ? new Date().toISOString() : null
    });
    
    // Log admin activity
    await logAdminActivity(adminId, 'user_suspend', userId, `${suspended ? 'Suspended' : 'Unsuspended'} user account`, { suspended });
    
    // Log user activity in their history
    await addActivity(userId, 'account_status', `Account ${suspended ? 'suspended' : 'activated'} by admin`, { adminId, suspended });
    
    console.log(`User ${userId} ${suspended ? 'suspended' : 'unsuspended'} successfully`);
  } catch (error) {
    console.error('Error suspending/unsuspending user:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, adminId: string, newRole: 'user' | 'admin' | 'super_admin'): Promise<void> => {
  if (!db) throw new Error('Firebase not initialized');
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    await updateDoc(userRef, {
      role: newRole,
      lastUpdated: new Date().toISOString(),
      roleUpdatedAt: new Date().toISOString()
    });
    
    // Log admin activity
    await logAdminActivity(adminId, 'user_role_update', userId, `Updated user role to ${newRole}`, { oldRole: 'previous_role', newRole });
    
    // Log user activity in their history
    await addActivity(userId, 'role_change', `Role updated to ${newRole} by admin`, { adminId, newRole });
    
    console.log(`User ${userId} role updated to ${newRole} successfully`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Hide/show coin (admin function)
export const toggleCoinVisibility = async (adminId: string, coinId: string, hidden: boolean): Promise<void> => {
  if (!db) throw new Error('Firebase not initialized');
  
  try {
    const configRef = doc(db, "siteConfig", "main");
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentConfig = configSnap.data();
      let hiddenCoins = currentConfig.hiddenCoins || [];
      
      if (hidden) {
        if (!hiddenCoins.includes(coinId)) {
          hiddenCoins.push(coinId);
        }
      } else {
        hiddenCoins = hiddenCoins.filter((id: string) => id !== coinId);
      }
      
      await updateDoc(configRef, {
        hiddenCoins,
        lastUpdated: new Date().toISOString(),
        updatedBy: adminId
      });
      
      // Log admin activity
      await logAdminActivity(adminId, hidden ? 'coin_hide' : 'coin_show', coinId, `${hidden ? 'Hidden' : 'Shown'} coin ${coinId}`, { coinId, hidden });
      
      console.log(`Coin ${coinId} ${hidden ? 'hidden' : 'shown'} successfully`);
    }
  } catch (error) {
    console.error('Error toggling coin visibility:', error);
    throw error;
  }
};

// Log admin activity
export const logAdminActivity = async (adminId: string, action: string, target: string, details: string, metadata?: any): Promise<void> => {
  if (!db) return;
  
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    const activitiesRef = collection(db, "adminActivities");
    
    await addDoc(activitiesRef, {
      adminId,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Get admin activities (admin function)
export const getAdminActivities = async (limit: number = 50): Promise<any[]> => {
  if (!db) return [];
  
  try {
    const { collection, getDocs, query, orderBy, limitToLast } = await import('firebase/firestore');
    const activitiesRef = collection(db, "adminActivities");
    const q = query(activitiesRef, orderBy('timestamp', 'desc'), limitToLast(limit));
    const querySnapshot = await getDocs(q);
    
    const activities: any[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({ ...doc.data(), id: doc.id });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting admin activities:', error);
    return [];
  }
};

// Get user activities for a specific user (admin function)
export const getUserActivities = async (userId: string): Promise<any[]> => {
  if (!db) return [];
  
  try {
    const userRef = doc(db, "crypto_app_users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.activities || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user activities:', error);
    return [];
  }
};