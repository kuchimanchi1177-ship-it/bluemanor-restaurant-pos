"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import { formatINR, formatRelativeTime } from '@/utils/formatters';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  XCircle,
  UtensilsCrossed,
  Filter,
  Layers,
  ArrowRight,
  Flame,
  Search,
} from 'lucide-react';

interface WaiterMyOrdersProps {
  onNavigateToTakeOrder: () => void;
}

export default function WaiterMyOrders({ onNavigateToTakeOrder }: WaiterMyOrdersProps) {
  const { orders, currentUser, updateOrderStatus } = useApp();

  const waiterName = currentUser?.name || 'Waiter';

  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Served'>('Active');
  const [searchQuery, setSearchQuery] = useState('');

  // Orders created by this waiter
  const myOrders = orders.filter((o) => o.waiterName === waiterName);

  // Filtered orders
  const filteredOrders = myOrders.filter((order) => {
    // Status Filter
    const isActive =
      order.status === 'New' ||
      order.status === 'Kitchen' ||
      order.status === 'Preparing' ||
      order.status === 'Ready';

    if (statusFilter === 'Active' && !isActive) return false;
    if (statusFilter === 'Served' && order.status !== 'Served') return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchTbl = order.tableNumber.toLowerCase().includes(q);
      const matchCust = order.customerName.toLowerCase().includes(q);
      const matchItems = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchTbl && !matchCust && !matchItems) return false;
    }

    return true;
  });

  const activeCount = myOrders.filter(
    (o) =>
      o.status === 'New' ||
      o.status === 'Kitchen' ||
      o.status === 'Preparing' ||
      o.status === 'Ready'
  ).length;

  const servedCount = myOrders.filter((o) => o.status === 'Served').length;

  return (
    <div className="space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              My Table Tickets
            </h2>
            <p className="text-[11px] text-slate-500">
              Orders created by <strong className="text-slate-800">{waiterName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToTakeOrder}
            className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>+ Take Order</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('Active')}
            className={`py-2 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              statusFilter === 'Active'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Active ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Served')}
            className={`py-2 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              statusFilter === 'Served'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Served ({servedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`py-2 px-2 rounded-lg transition cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({myOrders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number, table, or dish..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 shadow-2xs">
          <p className="text-sm font-bold text-slate-700">No matching tickets</p>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'Active'
              ? 'No active kitchen tickets for your tables right now.'
              : 'No orders found for the selected filter.'}
          </p>
          <button
            type="button"
            onClick={onNavigateToTakeOrder}
            className="mt-4 py-2 px-4 rounded-xl bg-red-600 text-white font-bold text-xs shadow-xs hover:bg-red-700 transition"
          >
            + Create New Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'New';
            const isKitchen = order.status === 'Kitchen' || order.status === 'Preparing';
            const isServed = order.status === 'Served';
            const isCancelled = order.status === 'Cancelled';

            const vegItems = order.items.filter((it) => it.foodType === 'VEG');
            const nonVegItems = order.items.filter((it) => it.foodType === 'NON_VEG');

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-4 shadow-2xs transition ${
                  isKitchen
                    ? 'border-blue-200/90 ring-1 ring-blue-100'
                    : isNew
                    ? 'border-amber-200/90 ring-1 ring-amber-100'
                    : isServed
                    ? 'border-emerald-200/80'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Top Row: Order Number, Table, Status & Time */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {order.tableNumber === 'Takeaway' ? '🛍️ Takeaway' : `Table ${order.tableNumber}`}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatRelativeTime(order.createdAt)}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">{order.customerName}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      isNew
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : isKitchen
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : isServed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="py-2.5 space-y-1.5 text-xs text-slate-800">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FoodTypeBadge type={it.foodType} size="xs" />
                        <span className="font-medium truncate">
                          {it.name} <strong className="text-slate-900 font-bold">× {it.quantity}</strong>
                        </span>
                      </div>
                      <span className="font-mono text-slate-600 shrink-0">
                        {formatINR(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}

                  {order.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 mt-1 italic">
                      Note: {order.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Total & Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Bill
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {formatINR(order.grandTotal)}
                    </span>
                  </div>

                  {/* Waiter Quick Actions */}
                  <div>
                    {(isKitchen || isNew) && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'Served')}
                        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Served</span>
                      </button>
                    )}

                    {isServed && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Food Delivered</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
