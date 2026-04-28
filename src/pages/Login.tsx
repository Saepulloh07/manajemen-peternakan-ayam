/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Egg, Key, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';

export default function Login() {
  const { setUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(UserRole.SUPER_ADMIN);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: '1',
        name: role === UserRole.SUPER_ADMIN ? 'Owner Farm' : role === UserRole.ADMIN ? 'Farm Manager' : 'Staff Kandang',
        role: role,
        email: 'user@poultry.com'
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white border border-slate-200 p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
          <div className="mb-12 text-center">
            <div className="bg-slate-900 w-16 h-16 rounded-sm flex items-center justify-center mx-auto mb-6 shadow-xl relative group">
              <Egg className="text-white group-hover:text-amber-500 transition-colors" size={32} />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white"></div>
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">Eggly</h1>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] mt-2 italic shadow-slate-100">Smart Poultry Analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Node Identity (Email)</label>
              <div className="relative">
                <input 
                  type="email" 
                  defaultValue="admin@eggly.farm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 text-sm focus:outline-none focus:border-amber-500 transition-all font-bold placeholder:slate-300 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Access Key (Password)</label>
              <div className="relative">
                <input 
                  type="password" 
                  defaultValue="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 text-sm focus:outline-none focus:border-amber-500 transition-all font-bold shadow-inner"
                />
                <Key size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1 mb-4 italic">Security Inheritance Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "py-3 rounded-sm text-[9px] font-black uppercase tracking-tighter transition-all border",
                      role === r 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 text-white rounded-sm py-5 font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center space-x-3 border border-slate-800"
            >
              {isLoading ? <Loader2 className="animate-spin text-amber-500" size={20} /> : <span>Authorize Access</span>}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <button className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-600 transition-colors underline underline-offset-4 decoration-2">
              Lupa password? Hubungi Admin
            </button>
          </div>
        </div>
        
        <p className="text-center mt-12 text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">
          Eggly Systems • Build 2026.04
        </p>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
