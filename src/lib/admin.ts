import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import type { AppUser, UserRole, UserPermissions, WebhookConfig } from '@/types';

// Check if user is admin
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    const userData = userDoc.data() as AppUser;
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Get user data with role and permissions
export async function getUserData(uid: string): Promise<AppUser | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    return userDoc.data() as AppUser;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Initialize user in Firestore (call after first login)
export async function initializeUser(
  uid: string,
  email: string,
  displayName?: string,
  photoURL?: string
): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    // Only initialize if user doesn't exist
    if (!userDoc.exists()) {
      const defaultPermissions: UserPermissions = {
        chatWebhook: true,
        historyWebhook: true,
        canManageUsers: false,
        canManageWebhooks: false,
      };

      const newUser: AppUser = {
        uid,
        email,
        displayName,
        photoURL,
        role: 'user', // Default role
        permissions: defaultPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), newUser);
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    throw error;
  }
}

// Update user role (admin only)
export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      role,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Update user permissions (admin only)
export async function updateUserPermissions(
  uid: string,
  permissions: Partial<UserPermissions>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentData = userDoc.data() as AppUser;
    const updatedPermissions = { ...currentData.permissions, ...permissions };

    await setDoc(userRef, {
      permissions: updatedPermissions,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

// Get all users (admin only)
export async function getAllUsers(): Promise<AppUser[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as AppUser);
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// Delete user (admin only)
export async function deleteUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    // Note: Firebase Auth user deletion requires admin SDK on server
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Create/Update user with full details (admin only)
export async function upsertUser(
  uid: string,
  userData: Partial<AppUser>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const existingDoc = await getDoc(userRef);
    
    const data: Partial<AppUser> = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    if (!existingDoc.exists()) {
      data.createdAt = new Date().toISOString();
    }

    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

// Check if user has specific permission
export async function hasPermission(
  uid: string,
  permission: keyof UserPermissions
): Promise<boolean> {
  try {
    const userData = await getUserData(uid);
    if (!userData) return false;
    return userData.permissions[permission] === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Webhook Management Functions

// Get global webhook settings
export async function getGlobalWebhookSettings(): Promise<{ chatWebhook: string; historyWebhook: string } | null> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'webhooks'));
    if (!settingsDoc.exists()) return null;
    return settingsDoc.data() as { chatWebhook: string; historyWebhook: string };
  } catch (error) {
    console.error('Error getting global webhook settings:', error);
    return null;
  }
}

// Update global webhook settings
export async function updateGlobalWebhookSettings(
  chatWebhook: string,
  historyWebhook: string
): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'webhooks'), {
      chatWebhook,
      historyWebhook,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating global webhook settings:', error);
    throw error;
  }
}

// Get all webhook configs
export async function getAllWebhookConfigs(): Promise<WebhookConfig[]> {
  try {
    const webhooksSnapshot = await getDocs(collection(db, 'webhookConfigs'));
    return webhooksSnapshot.docs.map(doc => doc.data() as WebhookConfig);
  } catch (error) {
    console.error('Error getting webhook configs:', error);
    throw error;
  }
}

// Get webhook config for specific user
export async function getUserWebhookConfig(userId: string): Promise<WebhookConfig | null> {
  try {
    const webhookDoc = await getDoc(doc(db, 'webhookConfigs', userId));
    if (!webhookDoc.exists()) return null;
    return webhookDoc.data() as WebhookConfig;
  } catch (error) {
    console.error('Error getting user webhook config:', error);
    return null;
  }
}

// Create/Update webhook config for user
export async function upsertWebhookConfig(
  userId: string,
  chatWebhookUrl: string,
  historyWebhookUrl: string,
  isActive: boolean = true
): Promise<void> {
  try {
    const webhookRef = doc(db, 'webhookConfigs', userId);
    const existingDoc = await getDoc(webhookRef);
    
    const data: WebhookConfig = {
      id: userId,
      userId,
      chatWebhookUrl,
      historyWebhookUrl,
      isActive,
      createdAt: existingDoc.exists() ? (existingDoc.data() as WebhookConfig).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(webhookRef, data);
  } catch (error) {
    console.error('Error upserting webhook config:', error);
    throw error;
  }
}

// Delete webhook config
export async function deleteWebhookConfig(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'webhookConfigs', userId));
  } catch (error) {
    console.error('Error deleting webhook config:', error);
    throw error;
  }
}

// Test webhook URL
export async function testWebhookUrl(url: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, message: 'Test from admin panel' }),
    });

    if (response.ok) {
      return { success: true, message: 'Webhook is reachable and responding' };
    } else {
      return { success: false, message: `Webhook returned ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, message: `Failed to reach webhook: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

