/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Egg, ShoppingCart, Package, Wallet, Users,
  Settings, LogOut, Menu, Plus, Home, PillBottle, ChevronRight,
  Shield, User as UserIcon, Wrench, Syringe, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { useHouse } from './HouseContext';
import { UserRole } from './types';
import { cn } from './lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  key?: React.Key;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  badge?: string;
}

function SidebarItem({ icon: Icon, label, active, onClick, collapsed, badge }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center w-full p-3 rounded-sm transition-all duration-200 group mb-0.5 relative',
        active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      )}
    >
      <Icon size={18} className={cn(active ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300')} />
      {!collapsed && (
        <>
          <span className="ml-3 font-bold text-[10px] uppercase tracking-widest flex-1 text-left">{label}</span>
          {badge && <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-sm">{badge}</span>}
        </>
      )}
      {active && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber-500 rounded-r" />}
    </button>
  );
}

// ─── RBAC Menu Config ─────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  { id: 'population',      label: 'Populasi & DOC', icon: Activity,        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
  { id: 'production',      label: 'Produksi Harian', icon: Egg,             roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
  { id: 'feedFormulation', label: 'Formulasi Pakan', icon: PillBottle,      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  { id: 'vaccine',         label: 'Vaksin & Biosekuriti', icon: Syringe,    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
  { id: 'sales',           label: 'Penjualan Telur', icon: ShoppingCart,    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  { id: 'inventory',       label: 'Stok Gudang',   icon: Package,         roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  { id: 'finance',         label: 'Keuangan & Aset', icon: Wallet,          roles: [UserRole.SUPER_ADMIN], badge: 'Owner' },
  { id: 'workers',         label: 'SDM & Payroll',   icon: Users,           roles: [UserRole.SUPER_ADMIN], badge: 'Owner' },
  { id: 'settings',        label: 'Konfigurasi',     icon: Settings,        roles: [UserRole.SUPER_ADMIN] },
];

const ROLE_COLOR: Record<UserRole, string> = {

  [UserRole.SUPER_ADMIN]: 'bg-amber-600',
  [UserRole.ADMIN]:       'bg-slate-600',
  [UserRole.WORKER]:      'bg-slate-500',
};

const ROLE_ICON: Record<UserRole, React.ElementType> = {
  [UserRole.SUPER_ADMIN]: Shield,
  [UserRole.ADMIN]:       UserIcon,
  [UserRole.WORKER]:      Wrench,
};

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, logout, sidebarPermissions } = useApp();
  const { houses, selectedHouseId, setSelectedHouseId } = useHouse();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) return <>{children}</>;

  const RoleIcon = ROLE_ICON[user.role];

  // Filter menu by dynamic permissions
  const rolePermissions = sidebarPermissions[user.role] || [];
  const filteredMenu = MENU_ITEMS.filter(item => rolePermissions.includes(item.id));

  // Filter houses for WORKER — only their assignedHouses
  const visibleHouses = user.role === UserRole.WORKER && user.assignedHouses?.length
    ? houses.filter(h => user.assignedHouses!.includes(h.id))
    : houses;

  const collapsed = !isSidebarOpen && !isMobileMenuOpen;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        'bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-[70] fixed lg:relative h-full',
        isSidebarOpen ? 'w-64' : 'w-0 lg:w-[60px]',
        isMobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 overflow-hidden border-b border-slate-800">
          <div className="w-9 h-9 bg-amber-500 rounded-sm flex items-center justify-center shrink-0">
            <Egg className="text-slate-900" size={18} />
          </div>
          {!collapsed && (
            <span className="font-black text-xl text-white tracking-tighter italic uppercase truncate">
              Eggly<span className="text-amber-500 font-bold not-italic font-sans text-[8px] ml-1 bg-white/10 px-1 rounded-sm">PRO</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {filteredMenu.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              badge={item.badge}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* User Panel */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className={cn(
              'w-8 h-8 rounded-sm flex items-center justify-center text-white shrink-0',
              ROLE_COLOR[user.role]
            )}>
              <RoleIcon size={14} />
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight truncate italic">{user.name}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
                </div>
                <button onClick={logout} className="text-slate-500 hover:text-rose-400 p-1 transition-colors" title="Logout">
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
              <Menu size={22} />
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block text-slate-300 hover:text-slate-600 transition-colors p-1">
              <Menu size={18} />
            </button>

            {/* House Selector */}
            {visibleHouses.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-sm">
                <Home size={12} className="text-slate-400" />
                <select
                  value={selectedHouseId}
                  onChange={e => setSelectedHouseId(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-tight text-slate-800 focus:outline-none cursor-pointer"
                >
                  {visibleHouses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <div className={cn(
              'hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-sm border',
              user.role === UserRole.SUPER_ADMIN
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : user.role === UserRole.ADMIN
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
            )}>
              <RoleIcon size={11} />
              <span className="text-[9px] font-black uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
            </div>

            <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-sm flex items-center justify-center">
              <Plus size={16} className="text-amber-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedHouseId}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
