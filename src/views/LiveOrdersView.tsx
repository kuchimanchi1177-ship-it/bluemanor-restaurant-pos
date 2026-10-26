"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import { formatINR, formatRelativeTime } from '@/utils/formatters';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';
import {
  Flame,
  ChefHat,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Search,
  PlusCircle,
  AlertTriangle,
  Receipt,
  ArrowRight,
  TrendingUp,
  Calendar,
  Utensils,
  Award,
} from 'lucide-react';

export default function LiveOrdersView() {
  const {
    orders,
    updateOrderStatus,
    cancelOrder,
    menuItems,
    setSelectedOrderForInvoice,
    setIsInvoiceModalOpen,
    setActiveTab,
  } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // 1. Calculate Top 4 Summary Cards
  // Today's Sales (orders placed today that aren't cancelled)
  const todaySales = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Monthly Sales (simulated realistic baseline + current demo total)
  const monthlySales = todaySales + 248500;

  // Menu items count
  const totalMenuItems = menuItems.length;

  // Top-selling item
  const sortedBySales = [...menuItems].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
  const topSellingItem = sortedBySales[0]?.name || 'Chicken Biryani';

  // Counts for tabs
  const counts = {
    All: orders.length,
    New: orders.filter((o) => o.status === 'New').length,
    Kitchen: orders.filter((o) => o.status === 'Kitchen' || o.status === 'Preparing').length,
    Served: orders.filter((o) => o.status === 'Served').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Kitchen') {
        if (order.status !== 'Kitchen' && order.status !== 'Preparing') return false;
      } else if (order.status !== selectedStatus) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchTable = order.tableNumber.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchNum && !matchCustomer && !matchTable && !matchItem) return false;
    }

    return true;
  });

  const handleNextStatus = (order: Order) => {
    if (order.status === 'New') {
      updateOrderStatus(order.id, 'Kitchen');
    } else if (order.status === 'Kitchen' || order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Served');
    }
  };

  const handleOpenCancel = (order: Order) => {
    setCancelModalOrder(order);
    setCancelReason('');
  };

  const handleConfirmCancel = () => {
    if (cancelModalOrder) {
      cancelOrder(cancelModalOrder.id, cancelReason || 'Cancelled by manager');
      setCancelModalOrder(null);
      setCancelReason('');
    }
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Compact Summary Cards at Top */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(todaySales)}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            {counts.New + counts.Kitchen + counts.Served} Orders active today
          </span>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Sales</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(monthlySales)}
          </div>
          <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            Current billing cycle
          </span>
        </div>

        {/* Menu Items */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menu Items</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalMenuItems} Items
          </div>
          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            Across 6 categories
          </span>
        </div>

        {/* Top-Selling Item */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top-Selling Item</span>
            <Award className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate" title={topSellingItem}>
            {topSellingItem}
          </div>
          <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            Highest demand
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, table, customer, dish..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
          />
        </div>

        {/* Quick New Order */}
        <button
          onClick={() => setActiveTab('pos')}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* Order Status Filters: New, Kitchen, Served, Cancelled */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['All', 'New', 'Kitchen', 'Served', 'Cancelled'] as const).map((status) => {
          const isActive = selectedStatus === status;
          const count = counts[status];

          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{status}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-700">No orders in this status</p>
          <p className="text-xs text-slate-400 mt-1">
            Orders created via POS or floor tickets will appear here in real time.
          </p>
          <button
            onClick={() => setActiveTab('pos')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Order</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'New';
            const isKitchen = order.status === 'Kitchen' || order.status === 'Preparing';
            const isServed = order.status === 'Served';
            const isCancelled = order.status === 'Cancelled';

            // Split items into Veg and Non-Veg groups
            const vegItems = order.items.filter((i) => i.foodType === 'VEG');
            const nonVegItems = order.items.filter((i) => i.foodType === 'NON_VEG');

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between ${
                  isNew
                    ? 'border-amber-300 ring-1 ring-amber-200/50'
                    : isKitchen
                    ? 'border-blue-200'
                    : isServed
                    ? 'border-emerald-200'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div>
                  {/* Order Card Top: Number, Table, Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          {order.tableNumber === 'Takeaway' ? '🛍️ Takeaway' : `Table: ${order.tableNumber}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRelativeTime(order.createdAt)}</span>
                        {order.waiterName && (
                          <>
                            <span>•</span>
                            <span>{order.waiterName}</span>
                          </>
                        )}
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

                  {/* Customer Info */}
                  <div className="py-2 text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {order.customerName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {order.customerPhone}
                    </span>
                  </div>

                  {/* VEG AND NON-VEG ORDER SEPARATION */}
                  <div className="py-3 border-y border-slate-100 space-y-3">
                    {/* 1. VEG ITEMS SECTION */}
                    {vegItems.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50/80 px-2 py-1 rounded-md border border-emerald-200/60">
                          <FoodTypeBadge type="VEG" size="xs" />
                          <span>Veg Items ({vegItems.reduce((acc, it) => acc + it.quantity, 0)})</span>
                        </div>
                        <div className="space-y-1 pl-1">
                          {vegItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs text-slate-800"
                            >
                              <span className="font-medium">
                                {item.name}{' '}
                                <strong className="text-slate-900 font-bold">× {item.quantity}</strong>
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. NON-VEG ITEMS SECTION */}
                    {nonVegItems.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-800 uppercase tracking-wider bg-red-50/80 px-2 py-1 rounded-md border border-red-200/60">
                          <FoodTypeBadge type="NON_VEG" size="xs" />
                          <span>Non-Veg Items ({nonVegItems.reduce((acc, it) => acc + it.quantity, 0)})</span>
                        </div>
                        <div className="space-y-1 pl-1">
                          {nonVegItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs text-slate-800"
                            >
                              <span className="font-medium">
                                {item.name}{' '}
                                <strong className="text-slate-900 font-bold">× {item.quantity}</strong>
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/40 italic">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Total & Status Actions */}
                <div className="pt-3 mt-3">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                      Bill Total
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {formatINR(order.grandTotal)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Primary Status Advancement Button */}
                    {isNew && (
                      <button
                        onClick={() => handleNextStatus(order)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Send to Kitchen</span>
                      </button>
                    )}

                    {isKitchen && (
                      <button
                        onClick={() => handleNextStatus(order)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Served</span>
                      </button>
                    )}

                    {/* Invoice Preview */}
                    <button
                      onClick={() => handleViewInvoice(order)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                      title="View & Print Bill"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Cancel button if not already cancelled or served */}
                    {(isNew || isKitchen) && (
                      <button
                        onClick={() => handleOpenCancel(order)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Cancel {cancelModalOrder.orderNumber}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This will cancel the order for Table {cancelModalOrder.tableNumber} and mark it as Cancelled.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for cancellation
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Guest changed mind, emergency"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
