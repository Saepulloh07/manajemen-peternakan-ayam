/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Egg, Key, Loader2, ChevronRight, Shield, User as UserIcon, Wrench } from 'lucide-react';
import { useApp, MOCK_USERS } from '../AppContext';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

const ROLE_META = {
  [UserRole.SUPER_ADMIN]: { label: 'Owner', color: 'bg-amber-500', icon: Shield, desc: 'Akses penuh ke seluruh sistem' },
  [UserRole.ADMIN]:       { label: 'Admin',  color: 'bg-slate-600', icon: UserIcon, desc: 'Inventory, Produksi, Penjualan' },
  [UserRole.WORKER]:      { label: 'Worker', color: 'bg-slate-400', icon: Wrench, desc: 'Hanya Input Produksi Harian' },
};

export default function Login() {
  const { login, loginAs } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (!success) {
        setError('Email atau password salah. Coba gunakan akun demo di bawah.');
      }
      setIsLoading(false);
    }, 600);
  };

  const handleQuickLogin = (userId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAs(userId);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Header */}
          <div className="px-10 pt-12 pb-8 text-center">
            <div className="bg-slate-900 w-14 h-14 rounded-sm flex items-center justify-center mx-auto mb-5 shadow-xl relative">
              <Egg className="text-white" size={26} />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-white" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">Eggly<span className="text-amber-500 text-xs font-bold not-italic ml-1">PRO</span></h1>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] mt-1">Smart Poultry Management</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="px-10 space-y-5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@farm.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
                />
                <Key size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-3 py-2 rounded-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white rounded-sm py-4 font-bold text-[11px] uppercase tracking-[0.25em] shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin text-amber-500" size={18} /> : (
                <><span>Masuk</span><ChevronRight size={14} /></>
              )}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="px-10 py-8 mt-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Demo Cepat</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid gap-2">
              {MOCK_USERS.map(u => {
                const meta = ROLE_META[u.role];
                const Icon = meta.icon;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.id)}
                    disabled={isLoading}
                    className="flex items-center gap-3 w-full border border-slate-100 bg-slate-50 hover:border-amber-200 hover:bg-amber-50 px-4 py-3 text-left transition-all group"
                  >
                    <div className={cn('w-7 h-7 rounded-sm flex items-center justify-center shrink-0', meta.color)}>
                      <Icon size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{u.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium truncate">{meta.desc}</p>
                    </div>
                    <ChevronRight size={12} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-slate-600 text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
          Eggly Systems • Build 2026.04 • RBAC v2
        </p>
      </div>
    </div>
  );
}
