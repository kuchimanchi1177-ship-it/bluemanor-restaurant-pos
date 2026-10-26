"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_USERS } from '@/data/mockData';
import { UserRole } from '@/types';
import BrandLogo from '@/components/BrandLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function LoginScreen() {
  const { brand, login } = useApp();

  const [identifier, setIdentifier] = useState('admin@bluemanor.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner / Admin');
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickFill = (user: typeof DEMO_USERS[0]) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Match demo user role if available
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === identifier.trim().toLowerCase()
    );

    login(identifier.trim(), matched?.role || selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Brand Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 bg-white">
          <div className="flex justify-center mb-4">
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

        {/* Quick Demo Role Selector */}
        <div className="px-8 pt-5 pb-2 bg-slate-50/70 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <span>Demo Quick Access</span>
            <span className="text-red-600 font-semibold">1-Click Fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((u) => {
              const isSelected = selectedRole === u.role && identifier === u.email;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickFill(u)}
                  className={`p-2.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-base mb-1">{u.avatar}</div>
                  <div className="font-bold text-[11px] leading-tight truncate">
                    {u.role.split(' ')[0]}
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {u.name.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

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
            <span>Sign In to POS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Demo disclaimer */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demo Environment • Sample credentials:{' '}
              <strong className="text-slate-600">admin@bluemanor.com</strong> /{' '}
              <strong className="text-slate-600">admin123</strong>
            </p>
          </div>
        </form>
      </div>

      {/* Footer text */}
      <p className="mt-4 text-xs text-slate-400 text-center">
        BLUEMANOR Restaurant Management Platform • Demo Mode
      </p>
    </div>
  );
}
