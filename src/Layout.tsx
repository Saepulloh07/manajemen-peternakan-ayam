/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Egg,
  ShoppingCart,
  Package,
  Wallet,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  Home,
  PillBottle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { useHouse } from './HouseContext';
import { UserRole } from './types';
import { cn } from './lib/utils';

interface SidebarItemProps {
  key?: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

function SidebarItem({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full p-3 rounded-sm transition-all duration-200 group mb-1",
        active
          ? "bg-slate-800 text-white shadow-sm"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
      )}
    >
      <Icon size={20} className={cn(active ? "text-amber-500" : "text-slate-500 group-hover:text-slate-300")} />
      {!collapsed && (
        <span className="ml-3 font-bold text-[10px] uppercase tracking-widest">{label}</span>
      )}
    </button>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { user, setUser } = useApp();
  const { houses, selectedHouseId, setSelectedHouseId, activeHouse } = useHouse();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'production', label: 'Produksi Harian', icon: Egg, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
    { id: 'feedFormulation', label: 'Formulasi Pakan', icon: PillBottle, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
    { id: 'sales', label: 'Penjualan Telur', icon: ShoppingCart, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'inventory', label: 'Stok Logistik', icon: Package, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
    { id: 'finance', label: 'Keuangan & Aset', icon: Wallet, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER] },
    { id: 'workers', label: 'SDM & Payroll', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'settings', label: 'Konfigurasi', icon: Settings, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-[70] fixed lg:relative h-full",
          isSidebarOpen ? "w-64" : "w-0 lg:w-20",
          isMobileMenuOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-sm flex items-center justify-center shrink-0">
              <Egg className="text-slate-900" size={20} />
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="font-black text-xl text-white tracking-tighter italic uppercase truncate">Eggly<span className="text-amber-500 font-bold not-italic font-sans text-[8px] ml-1 bg-white/10 px-1 rounded-sm vertical-top">PRO</span></span>
            )}
          </div>
        </div>

        <nav className={cn(
          "flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide shrink-0",
          !isSidebarOpen && !isMobileMenuOpen && "opacity-0 invisible lg:visible lg:opacity-100"
        )}>
          {filteredItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              collapsed={!isSidebarOpen && !isMobileMenuOpen}
            />
          ))}
        </nav>

        <div className="mt-auto p-6 border-t border-slate-800 bg-slate-900/30 shrink-0 overflow-hidden">
          <div className={cn(
            "flex items-center gap-3",
            !isSidebarOpen && !isMobileMenuOpen && "justify-center"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-sm flex items-center justify-center text-white font-bold shrink-0 shadow-inner border border-slate-700",
              user.role === UserRole.SUPER_ADMIN ? "bg-amber-600" : "bg-slate-800"
            )}>
              {user.name.charAt(0)}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-white uppercase tracking-tight truncate italic">{user.name}</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest truncate">{user.role}</p>
              </div>
            )}
            {(isSidebarOpen || isMobileMenuOpen) && (
              <button
                onClick={() => setUser(null)}
                className="text-slate-500 hover:text-amber-500 p-1"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Universal Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0 z-40 relative">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block text-slate-300 hover:text-slate-600 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block w-px h-6 bg-slate-200 mx-2"></div>

            {/* Multi-House Selector */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1.5 rounded-sm">
              <Home size={14} className="text-slate-400 ml-1" />
              <select
                value={selectedHouseId}
                onChange={(e) => setSelectedHouseId(e.target.value)}
                className="bg-transparent text-[10px] lg:text-xs font-black uppercase tracking-tight text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {houses.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-black uppercase text-slate-900 tracking-tighter">Node Synchronized</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date())}</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-amber-50 border border-amber-100 rounded-sm flex items-center justify-center text-amber-600">
                <Plus size={18} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedHouseId}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.15 }}
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
