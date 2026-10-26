"use client";

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import InvoiceModal from '@/components/InvoiceModal';
import LoginScreen from '@/components/LoginScreen';

import LiveOrdersView from '@/views/LiveOrdersView';
import POSView from '@/views/POSView';
import MenuItemsView from '@/views/MenuItemsView';
import CategoriesView from '@/views/CategoriesView';
import WaitersView from '@/views/WaitersView';
import FeedbacksView from '@/views/FeedbacksView';
import SettingsView from '@/views/SettingsView';

function MainAppShell() {
  const { activeTab, isLoggedIn } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If user is not logged in, show BLUEMANOR login gate
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'orders':
        return <LiveOrdersView />;
      case 'pos':
        return <POSView />;
      case 'menu':
        return <MenuItemsView />;
      case 'categories':
        return <CategoriesView />;
      case 'waiters':
        return <WaitersView />;
      case 'feedbacks':
        return <FeedbacksView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <LiveOrdersView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Persistent White Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Scrollable Main View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <Toast />
      <InvoiceModal />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
