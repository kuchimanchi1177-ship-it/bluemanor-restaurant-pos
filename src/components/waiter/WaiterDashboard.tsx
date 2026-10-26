"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/utils/formatters';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface WaiterDashboardProps {
  onNavigate: (tab: 'take-order' | 'my-orders' | 'profile') => void;
  onSelectTableForOrder: (tableNumber: string) => void;
}

export default function WaiterDashboard({
  onNavigate,
  onSelectTableForOrder,
}: WaiterDashboardProps) {
  const { currentUser, orders, tables, waiters } = useApp();

  const waiterName = currentUser?.name || 'Waiter';
  const waiterRecord = waiters.find((w) => w.name === waiterName || w.id === currentUser?.waiterId);
  const assignedTables = waiterRecord?.assignedTables || ['T-01', 'T-02', 'T-03'];

  // Orders created by this waiter
  const myOrders = orders.filter((o) => o.waiterName === waiterName);
  const activeOrders = myOrders.filter(
    (o) => o.status === 'New' || o.status === 'Kitchen' || o.status === 'Preparing' || o.status === 'Ready'
  );
  const completedOrders = myOrders.filter((o) => o.status === 'Served');

  const todaySales = myOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      {/* 1. Welcome Card with Quick Duty Status */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border border-slate-700/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Floor Service Live
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 truncate">
              Welcome, {waiterName} 👋
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Assigned Tables:{' '}
              <span className="font-semibold text-white">
                {assignedTables.join(', ') || 'General Floor'}
              </span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 shrink-0 overflow-hidden flex items-center justify-center font-extrabold text-base">
            {currentUser?.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/')) ? (
              <img src={currentUser.avatar} alt={waiterName} className="w-full h-full object-cover" />
            ) : (
              <span>{waiterName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => onNavigate('take-order')}
          className="w-full mt-4 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Take New Table Order</span>
        </button>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Active Orders */}
        <button
          type="button"
          onClick={() => onNavigate('my-orders')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 text-left shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{activeOrders.length}</p>
        </button>

        {/* Completed Orders */}
        <button
          type="button"
          onClick={() => onNavigate('my-orders')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 text-left shadow-2xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Served</p>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{completedOrders.length}</p>
        </button>

        {/* Today's Sales */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Shift Total</p>
          <p className="text-sm sm:text-base font-black text-slate-900 mt-1 truncate">
            {formatINR(todaySales)}
          </p>
        </div>
      </div>

      {/* 3. Assigned Dining Tables Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Your Floor Tables
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Tap a table to start order
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {assignedTables.map((tblNum) => {
            const tableObj = tables.find((t) => t.tableNumber === tblNum);
            const isOccupied = tableObj?.status === 'Occupied';
            const isBilled = tableObj?.status === 'Billed';

            return (
              <button
                key={tblNum}
                type="button"
                onClick={() => onSelectTableForOrder(tblNum)}
                className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                  isOccupied
                    ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                    : isBilled
                    ? 'bg-purple-50/70 border-purple-300 text-purple-900'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                }`}
              >
                <span className="text-sm font-black">{tblNum}</span>
                <span className="text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-md bg-white/80 border border-black/5">
                  {isOccupied ? 'Occupied' : isBilled ? 'Billed' : 'Available'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Live Kitchen Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Active Table Tickets ({activeOrders.length})
            </h3>
          </div>
          {activeOrders.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('my-orders')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <p className="text-xs font-semibold">No active kitchen orders right now</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Take an order to send tickets to the kitchen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeOrders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                onClick={() => onNavigate('my-orders')}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-2 transition cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">{ord.orderNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      Table {ord.tableNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                    {ord.status}
                  </span>
                  <p className="text-xs font-black text-slate-900 mt-1">{formatINR(ord.grandTotal)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
