"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_USERS } from '@/data/mockData';
import { UserRole, Waiter } from '@/types';
import BrandLogo from '@/components/BrandLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function LoginScreen() {
  const { brand, login, loginAsWaiter, waiters } = useApp();

  const [authMode, setAuthMode] = useState<'admin' | 'waiter'>('waiter');

  // Admin / Cashier form state
  const [identifier, setIdentifier] = useState('admin@bluemanor.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner / Admin');

  // Waiter PIN form state
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(
    waiters[0]?.id || 'waiter-1'
  );
  const [waiterPin, setWaiterPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminQuickFill = (user: typeof DEMO_USERS[0]) => {
    setIdentifier(user.email);
    setPassword(
      user.role === 'Owner / Admin'
        ? 'admin123'
        : user.role === 'Cashier'
        ? 'pos123'
        : 'waiter123'
    );
    setSelectedRole(user.role);
    setErrorMessage('');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === identifier.trim().toLowerCase()
    );

    login(identifier.trim(), matched?.role || selectedRole);
  };

  const handleWaiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaiterId) {
      setErrorMessage('Please select a waiter profile.');
      return;
    }
    if (!waiterPin.trim()) {
      setErrorMessage('Please enter your 4-digit PIN.');
      return;
    }

    const success = loginAsWaiter(selectedWaiterId, waiterPin.trim());
    if (!success) {
      setErrorMessage('Invalid PIN. Please check and try again.');
    }
  };

  const selectedWaiter: Waiter | undefined = waiters.find((w) => w.id === selectedWaiterId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Brand Header */}
        <div className="p-7 pb-5 text-center border-b border-slate-100 bg-white">
          <div className="flex justify-center mb-3">
            <BrandLogo
              logoUrl={brand.logoUrl}
              name={brand.name || 'BLUEMANOR'}
              size="xl"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {brand.name || 'BLUEMANOR'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Restaurant Billing & Point of Sale System
          </p>
        </div>

        {/* Dual Mode Switcher: Waiter Floor Staff vs Management */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('waiter');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMode === 'waiter'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Waiter Floor Staff</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('admin');
              setErrorMessage('');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMode === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin & Cashier</span>
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. WAITER PIN LOGIN MODE */}
        {authMode === 'waiter' && (
          <form onSubmit={handleWaiterSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Waiter Profile
              </label>
              <div className="grid grid-cols-2 gap-2">
                {waiters.map((w) => {
                  const isSelected = selectedWaiterId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedWaiterId(w.id);
                        setWaiterPin(w.pin || '1234');
                        setErrorMessage('');
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 border-red-300 ring-1 ring-red-300 text-red-950 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center font-bold text-sm">
                        {w.avatar && (w.avatar.startsWith('http') || w.avatar.startsWith('/')) ? (
                          <img src={w.avatar} alt={w.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-700">{w.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate leading-tight">{w.name}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {w.assignedTables?.slice(0, 2).join(', ') || 'No tables'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Waiter PIN Entry */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  4-Digit Security PIN
                </label>
                {selectedWaiter && (
                  <span className="text-[10px] text-slate-400">
                    Default PIN: <strong className="text-slate-600 font-mono">{selectedWaiter.pin || '1234'}</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={waiterPin}
                  onChange={(e) => {
                    setWaiterPin(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter 4-digit PIN"
                  className="w-full pl-10 pr-10 py-2.5 text-base tracking-widest text-center rounded-xl border border-slate-200 bg-white text-slate-900 font-mono font-bold focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Waiter Login */}
            <button
              type="submit"
              className="w-full py-3 mt-1 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs hover:shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In as {selectedWaiter?.name || 'Waiter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
              Floor staff terminal • Direct access to table ordering & live ticket status
            </p>
          </form>
        )}

        {/* 2. ADMIN & CASHIER LOGIN MODE */}
        {authMode === 'admin' && (
          <div>
            {/* Quick Demo Role Selector */}
            <div className="px-6 pt-4 pb-2 bg-slate-50/70 border-b border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Quick Role Demo</span>
                <span className="text-red-600 font-semibold">1-Click Fill</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.slice(0, 2).map((u) => {
                  const isSelected = selectedRole === u.role && identifier === u.email;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleAdminQuickFill(u)}
                      className={`p-2.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-base mb-1">{u.avatar}</div>
                      <div className="font-bold text-[11px] leading-tight truncate">
                        {u.role}
                      </div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {u.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Form */}
            <form onSubmit={handleAdminSubmit} className="p-6 space-y-3.5">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="admin@bluemanor.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs hover:shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to POS Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Management console • Full billing, settings & reports access
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer text */}
      <p className="mt-4 text-xs text-slate-400 text-center">
        BLUEMANOR Restaurant Management Platform • POS & Waitstaff Sync
      </p>
    </div>
  );
}
