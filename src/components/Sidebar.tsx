"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import {
  Flame,
  PlusCircle,
  UtensilsCrossed,
  Tags,
  Users,
  Star,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const {
    brand,
    activeTab,
    setActiveTab,
    orders,
    currentUser,
    logout,
  } = useApp();

  // Count active live orders (New, Kitchen, Preparing)
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'New' || o.status === 'Kitchen' || o.status === 'Preparing'
  ).length;

  // STRICTLY ONLY 7 categories
  const navItems = [
    {
      id: 'orders',
      label: 'Live Orders',
      icon: Flame,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : null,
    },
    {
      id: 'pos',
      label: 'POS (New Order)',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'menu',
      label: 'Menu Items',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tags,
      badge: null,
    },
    {
      id: 'waiters',
      label: 'Waiters',
      icon: Users,
      badge: null,
    },
    {
      id: 'feedbacks',
      label: 'Feedbacks',
      icon: Star,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Persistent White Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: BLUEMANOR Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <BrandLogo
              logoUrl={brand.logoUrl}
              name={brand.name || 'BLUEMANOR'}
              size="md"
              showText={true}
              textClassName="text-sm font-black"
              subtext="Restaurant Billing POS"
            />

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links: Exactly 7 Categories */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-600 font-bold border-l-4 border-red-600 shadow-2xs pl-2.5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-red-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: User Info & Logout Button */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-2 flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                {currentUser?.avatar || '👤'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {currentUser?.name || 'Staff User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {currentUser?.role || 'Cashier'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
