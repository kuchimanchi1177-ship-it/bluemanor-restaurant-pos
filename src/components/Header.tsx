"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Menu,
  PlusCircle,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const { brand, updateBrand, activeTab, setActiveTab, loginAsWaiter } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'orders':
        return {
          title: 'Live Orders',
          subtitle: 'Active floor and kitchen orders in real time',
        };
      case 'pos':
        return {
          title: 'Admin POS',
          subtitle: 'Create customer orders and calculate bills',
        };
      case 'menu':
        return {
          title: 'Menu Items',
          subtitle: 'Catalog of restaurant dishes and stock availability',
        };
      case 'categories':
        return {
          title: 'Categories',
          subtitle: 'Organize menu items by course and type',
        };
      case 'waiters':
        return {
          title: 'Waiters',
          subtitle: 'Staff registry and table assignments',
        };
      case 'feedbacks':
        return {
          title: 'Feedbacks',
          subtitle: 'Customer reviews and ratings',
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Restaurant profile, billing options, and demo configuration',
        };
      default:
        return {
          title: 'Live Orders',
          subtitle: 'Active floor and kitchen orders in real time',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  const toggleStoreStatus = () => {
    updateBrand({ storeOpen: !brand.storeOpen });
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime || '02:30 PM'}</span>
        </div>

        {/* Store Open/Closed Toggle */}
        <button
          onClick={toggleStoreStatus}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
            brand.storeOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100/70'
          }`}
          title="Click to toggle store status"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              brand.storeOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span>{brand.storeOpen ? 'Store Open' : 'Store Closed'}</span>
        </button>

        {/* Quick Switch to Waiter Mode for testing */}
        <button
          type="button"
          onClick={() => loginAsWaiter('waiter-1', '1234')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          title="Preview Waiter Mobile Interface"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-red-600" />
          <span>Waiter View</span>
        </button>

        {/* Quick New Order Button (if not on POS) */}
        {activeTab !== 'pos' && (
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">+ New Order</span>
          </button>
        )}
      </div>
    </header>
  );
}
