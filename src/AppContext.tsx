/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from './types';

// ─── Mock Users for Demo ──────────────────────────────────────────────────────
export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Owner Farm',
    role: UserRole.SUPER_ADMIN,
    username: 'owner',
    email: 'owner@farm.com',
    password: 'owner123',
    assignedHouses: [],
  },
  {
    id: 'u2',
    name: 'Admin Gudang',
    role: UserRole.ADMIN,
    username: 'admin',
    email: 'admin@farm.com',
    password: 'admin123',
    assignedHouses: ['h1', 'h2'],
  },
  {
    id: 'u3',
    name: 'Budi (Anak Kandang)',
    role: UserRole.WORKER,
    username: 'worker',
    email: 'worker@farm.com',
    password: 'worker123',
    assignedHouses: ['h1'],
  },
];

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AppContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  sidebarPermissions: Record<UserRole, string[]>;
  updatePermissions: (role: UserRole, permissions: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('poultry_users');
    if (saved) return JSON.parse(saved);
    // Initialize with mock data if no saved users
    return MOCK_USERS.map(u => ({
      ...u,
      username: (u as any).username || u.email.split('@')[0],
      salary: u.role === UserRole.WORKER ? 3500000 : 5000000
    })) as User[];
  });

  const [sidebarPermissions, setSidebarPermissions] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem('poultry_permissions');
    return saved ? JSON.parse(saved) : {
      [UserRole.SUPER_ADMIN]: ['dashboard', 'production', 'feedFormulation', 'vaccine', 'sales', 'inventory', 'finance', 'workers', 'settings'],
      [UserRole.ADMIN]: ['dashboard', 'production', 'feedFormulation', 'vaccine', 'sales', 'inventory'],
      [UserRole.WORKER]: ['production', 'vaccine'],
    };
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('poultry_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading] = useState(false);

  // Persistence
  React.useEffect(() => {
    localStorage.setItem('poultry_users', JSON.stringify(users));
  }, [users]);

  React.useEffect(() => {
    localStorage.setItem('poultry_permissions', JSON.stringify(sidebarPermissions));
  }, [sidebarPermissions]);

  const login = (email: string, password: string): boolean => {
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser as User);
      localStorage.setItem('poultry_session', JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const loginAs = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser as User);
      localStorage.setItem('poultry_session', JSON.stringify(safeUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('poultry_session');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: `u${Date.now()}` };
    setUsers(prev => [...prev, newUser as User]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('poultry_session', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (user?.id === id) logout();
  };

  const updatePermissions = (role: UserRole, permissions: string[]) => {
    setSidebarPermissions(prev => ({ ...prev, [role]: permissions }));
  };

  return (
    <AppContext.Provider value={{ 
      user, users, isLoading, login, loginAs, logout, 
      addUser, updateUser, deleteUser,
      sidebarPermissions, updatePermissions 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
