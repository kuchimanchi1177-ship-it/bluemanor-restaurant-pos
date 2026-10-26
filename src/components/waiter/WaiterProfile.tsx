"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/utils/formatters';
import {
  User,
  Phone,
  Layers,
  TrendingUp,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  KeyRound,
} from 'lucide-react';

export default function WaiterProfile() {
  const { currentUser, logout, waiters, updateWaiter, orders, brand } = useApp();

  const waiterName = currentUser?.name || 'Waiter';
  const waiterRecord = waiters.find((w) => w.name === waiterName || w.id === currentUser?.waiterId);

  // Orders created by this waiter
  const myOrders = orders.filter((o) => o.waiterName === waiterName && o.status !== 'Cancelled');
  const todayOrdersCount = myOrders.length;
  const todaySales = myOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const isOnDuty = waiterRecord?.status === 'On Duty';

  const toggleDutyStatus = () => {
    if (waiterRecord) {
      updateWaiter({
        ...waiterRecord,
        status: isOnDuty ? 'Off Duty' : 'On Duty',
      });
    }
  };

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] max-w-lg mx-auto">
      {/* 1. Profile Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-center space-y-3">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 border-2 border-rose-200 overflow-hidden mx-auto flex items-center justify-center font-black text-2xl text-rose-700 shadow-sm">
            {waiterRecord?.avatar && (waiterRecord.avatar.startsWith('http') || waiterRecord.avatar.startsWith('/')) ? (
              <img src={waiterRecord.avatar} alt={waiterName} className="w-full h-full object-cover" />
            ) : (
              <span>{waiterName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
              isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{waiterName}</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{waiterRecord?.phone || currentUser?.phone || '+91 98765 11223'}</span>
          </p>
        </div>

        {/* Duty Status Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={toggleDutyStatus}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-2 ${
              isOnDuty
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/70'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
            <span>{isOnDuty ? 'Currently On Duty (Tap to Clock Out)' : 'Currently Off Duty (Tap to Clock In)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Assigned Floor Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Assigned Service Tables
          </h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Tables designated for your service shift:
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {waiterRecord?.assignedTables && waiterRecord.assignedTables.length > 0 ? (
            waiterRecord.assignedTables.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 text-slate-800 border border-slate-200"
              >
                Table {t}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No assigned tables</span>
          )}
        </div>
      </div>

      {/* 3. Performance Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Shift Performance
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Today&apos;s Tickets
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {todayOrdersCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Today&apos;s Sales
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block text-emerald-600">
              {formatINR(todaySales)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Lifetime Orders Served</span>
          <span className="font-bold text-slate-800">
            {(waiterRecord?.totalOrders || 0) + todayOrdersCount}
          </span>
        </div>
      </div>

      {/* 4. Terminal & Security Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 text-slate-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Terminal Access</span>
          </span>
          <span className="font-bold text-slate-900">Waiter Interface</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-600 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Shift Security PIN</span>
          </span>
          <span className="font-mono font-bold text-slate-800">•••• ({waiterRecord?.pin || '1234'})</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-600 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Store Location</span>
          </span>
          <span className="font-bold text-slate-800">{brand.name || 'BLUEMANOR'}</span>
        </div>
      </div>

      {/* 5. Secure Logout */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-3 px-4 rounded-xl bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>End Waiter Shift & Sign Out</span>
      </button>
    </div>
  );
}
