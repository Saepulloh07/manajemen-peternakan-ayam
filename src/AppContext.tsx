/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from './types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock initial session
  useEffect(() => {
    const timer = setTimeout(() => {
      // For demo purposes, we standard to Super Admin
      setUser({
        id: '1',
        name: 'Owner Farm',
        role: UserRole.SUPER_ADMIN,
        email: 'owner@poultry.com'
      });
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
