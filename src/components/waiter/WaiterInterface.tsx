"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import Toast from '@/components/Toast';

import WaiterDashboard from './WaiterDashboard';
import WaiterTakeOrder from './WaiterTakeOrder';
import WaiterMyOrders from './WaiterMyOrders';
import WaiterProfile from './WaiterProfile';

import {
  Layers,
  UtensilsCrossed,
  Clock,
  User,
  PlusCircle,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';

export type WaiterTab = 'dashboard' | 'take-order' | 'my-orders' | 'profile';

export default function WaiterInterface() {
  const { brand, currentUser, logout, orders, login } = useApp();

  const [activeTab, setActiveTab] = useState<WaiterTab>('dashboard');
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<string>('T-01');

  const waiterName = currentUser?.name || 'Waiter';

  // Active orders count for badge
  const activeOrdersCount = orders.filter(
    (o) =>
      o.waiterName === waiterName &&
      (o.status === 'New' || o.status === 'Kitchen' || o.status === 'Preparing' || o.status === 'Ready')
  ).length;

  const handleStartOrderForTable = (tableNumber: string) => {
    setSelectedTableForOrder(tableNumber);
    setActiveTab('take-order');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Mobile & Tablet Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <BrandLogo
            logoUrl={brand.logoUrl}
            name={brand.name || 'BLUEMANOR'}
            size="sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight uppercase text-slate-900 leading-tight">
                {brand.name || 'BLUEMANOR'}
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 tracking-wider">
                Waiter
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Floor Terminal • {waiterName}
            </p>
          </div>
        </div>

        {/* Right Header: Switch to POS Admin (Demo Convenience) & Waiter Avatar */}
        <div className="flex items-center gap-2">
          {/* Quick Switch to Admin POS if demo testing */}
          <button
            type="button"
            onClick={() => login('admin@bluemanor.com', 'Owner / Admin')}
            className="hidden xs:flex items-center gap-1 py-1.5 px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-bold transition cursor-pointer"
            title="Switch back to Admin POS view"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Admin POS</span>
          </button>

          {/* Waiter Mini Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-800 shadow-2xs hover:border-slate-300 transition cursor-pointer"
          >
            {currentUser?.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/')) ? (
              <img src={currentUser.avatar} alt={waiterName} className="w-full h-full object-cover" />
            ) : (
              <span>{waiterName.slice(0, 2).toUpperCase()}</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. Scrollable Viewport Body */}
      <main className="flex-1 p-3.5 sm:p-6 max-w-4xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <WaiterDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectTableForOrder={handleStartOrderForTable}
          />
        )}

        {activeTab === 'take-order' && (
          <WaiterTakeOrder
            initialTable={selectedTableForOrder}
            onOrderCompleted={() => setActiveTab('my-orders')}
          />
        )}

        {activeTab === 'my-orders' && (
          <WaiterMyOrders
            onNavigateToTakeOrder={() => setActiveTab('take-order')}
          />
        )}

        {activeTab === 'profile' && <WaiterProfile />}
      </main>

      {/* 3. Fixed Bottom Navigation Bar (Optimized for Mobile Phones & Tablets) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] px-3 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Dashboard Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* Take Order Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('take-order')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'take-order'
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Take Order</span>
          </button>

          {/* My Orders Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('my-orders')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer relative ${
              activeTab === 'my-orders'
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <Clock className="w-5 h-5" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Tickets</span>
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'text-red-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>
        </div>
      </nav>

      {/* Global Toasts */}
      <Toast />
    </div>
  );
}
