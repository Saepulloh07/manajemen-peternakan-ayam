/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Finance from './pages/Finance';
import Workers from './pages/Workers';
import Settings from './pages/Settings';
import Login from './pages/Login';

import { HouseProvider } from './HouseContext';

function AppContent() {
  const { user, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-sm mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative">
            <div className="absolute inset-0 border-2 border-amber-500 animate-ping opacity-20"></div>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em]">Initializing Node...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'production': return <Production />;
      case 'sales': return <Sales />;
      case 'inventory': return <Inventory />;
      case 'finance': return <Finance />;
      case 'workers': return <Workers />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HouseProvider>
        <AppContent />
      </HouseProvider>
    </AppProvider>
  );
}
