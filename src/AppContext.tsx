/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from './types';

// ─── Mock Users for Demo ──────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Owner Farm',
    role: UserRole.SUPER_ADMIN,
    email: 'owner@farm.com',
    password: 'owner123',
    assignedHouses: [],
  },
  {
    id: 'u2',
    name: 'Admin Gudang',
    role: UserRole.ADMIN,
    email: 'admin@farm.com',
    password: 'admin123',
    assignedHouses: ['h1', 'h2'],
  },
  {
    id: 'u3',
    name: 'Budi (Anak Kandang)',
    role: UserRole.WORKER,
    email: 'worker@farm.com',
    password: 'worker123',
    assignedHouses: ['h1'],
  },
];

// ─── Context Type ─────────────────────────────────────────────────────────────
interface AppContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  loginAs: (userId: string) => void;  // quick-login for demo
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('poultry_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading] = useState(false);

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('poultry_session', JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const loginAs = (userId: string) => {
    const found = MOCK_USERS.find(u => u.id === userId);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('poultry_session', JSON.stringify(safeUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('poultry_session');
  };

  return (
    <AppContext.Provider value={{ user, isLoading, login, loginAs, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
