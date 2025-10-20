'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { getUserData, isAdmin } from '@/lib/admin';
import type { AppUser } from '@/types';

export function useAdmin() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setUserData(null);
        setIsAdminUser(false);
        setLoading(false);
        return;
      }

      try {
        const [data, adminStatus] = await Promise.all([
          getUserData(user.uid),
          isAdmin(user.uid),
        ]);

        setUserData(data);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setUserData(null);
        setIsAdminUser(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return {
    userData,
    isAdmin: isAdminUser,
    loading,
    hasPermission: (permission: keyof AppUser['permissions']) => {
      return userData?.permissions[permission] === true;
    },
  };
}

