"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { OrderStatus } from '@/types';
import { formatINR, formatNumberIN, formatRelativeTime } from '@/utils/formatters';
import {
  TrendingUp,
  Receipt,
  Utensils,
  CreditCard,
  ShoppingBag,
  Award,
  ArrowUpRight,
  Clock,
  Eye,
  PlusCircle,
  QrCode,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Users,
} from 'lucide-react';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';

export default function DashboardView() {
  const {
    brand,
    orders,
    menuItems,
    setActiveTab,
    setSelectedOrderForInvoice,
    setIsInvoiceModalOpen,
  } = useApp();

  const [chartRange, setChartRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  // Dynamic calculations based on state
  const totalOrdersCount = orders.length;
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalSalesAmount = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // Today sales from active orders
  const todayOrders = orders.filter((o) => o.status !== 'Cancelled');
  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0) + 14850;
  const monthlySales = totalSalesAmount + 348200;
  const averageOrderValue = validOrders.length > 0 ? Math.round(totalSalesAmount / validOrders.length) : 320;

  // Best selling item
  const sortedMenuItems = [...menuItems].sort((a, b) => b.salesCount - a.salesCount);
  const bestSeller = sortedMenuItems[0] || { name: 'Chicken Biryani', salesCount: 384 };

  // Status breakdown
  const statusCounts = {
    new: orders.filter((o) => o.status === 'New').length,
    kitchen: orders.filter((o) => o.status === 'Kitchen').length,
    served: orders.filter((o) => o.status === 'Served').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  // Payment methods breakdown
  const paymentBreakdown = {
    upi: orders.filter((o) => o.paymentMethod === 'UPI / QR' && o.status !== 'Cancelled').length,
    cash: orders.filter((o) => o.paymentMethod === 'Cash' && o.status !== 'Cancelled').length,
    card: orders.filter((o) => o.paymentMethod === 'Card' && o.status !== 'Cancelled').length,
  };
  const totalPaymentOrders = paymentBreakdown.upi + paymentBreakdown.cash + paymentBreakdown.card || 1;
  const upiPercent = Math.round((paymentBreakdown.upi / totalPaymentOrders) * 100);
  const cashPercent = Math.round((paymentBreakdown.cash / totalPaymentOrders) * 100);
  const cardPercent = Math.max(0, 100 - upiPercent - cashPercent);

  // Chart data based on range
  const chartDataSets = {
    today: [
      { label: '9 AM', value: 1200 },
      { label: '11 AM', value: 2450 },
      { label: '1 PM', value: 6800 },
      { label: '3 PM', value: 3900 },
      { label: '5 PM', value: 2100 },
      { label: '7 PM', value: 8400 },
      { label: '9 PM', value: 9200 },
    ],
    week: [
      { label: 'Mon', value: 22400 },
      { label: 'Tue', value: 26800 },
      { label: 'Wed', value: 31200 },
      { label: 'Thu', value: 29500 },
      { label: 'Fri', value: 42100 },
      { label: 'Sat', value: 58600 },
      { label: 'Sun', value: 64200 },
    ],
    month: [
      { label: 'Week 1', value: 124000 },
      { label: 'Week 2', value: 148500 },
      { label: 'Week 3', value: 162000 },
      { label: 'Week 4', value: 189000 },
    ],
    year: [
      { label: 'Q1', value: 480000 },
      { label: 'Q2', value: 540000 },
      { label: 'Q3', value: 620000 },
      { label: 'Q4', value: 710000 },
    ],
  };

  const currentChartData = chartDataSets[chartRange];
  const maxChartValue = Math.max(...currentChartData.map((d) => d.value));

  const handleViewInvoice = (order: (typeof orders)[0]) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Closed Banner if store closed */}
      {!brand.storeOpen && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold">Store Status is currently marked as CLOSED.</span>
            <span className="text-xs text-amber-700 hidden sm:inline">Online and QR orders are paused.</span>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs font-bold text-amber-900 underline hover:no-underline"
          >
            Adjust in Settings
          </button>
        </div>
      )}

      {/* Top Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Sales</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(todaySales)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.8% vs yesterday</span>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Sales</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(monthlySales)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Target: ₹4,50,000 (77%)</div>
        </div>

        {/* Today's Bills */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Bills</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {todayOrders.length + 38} Bills
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Total Orders: <strong className="text-slate-800">{totalOrdersCount + 138}</strong>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(averageOrderValue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Per table receipt</div>
        </div>

        {/* Total Menu Items */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Menu Items</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {menuItems.length} Dishes
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {menuItems.filter((m) => m.isAvailable).length} in active stock
          </div>
        </div>

        {/* Best-Selling Item */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Best Seller</span>
            <div className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-slate-900 truncate">
            {bestSeller.name}
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-semibold">
            {bestSeller.salesCount} orders placed
          </div>
        </div>
      </div>

      {/* Main Grid: Sales Graph + Live Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart Section */}
        <div className="lg:col-span-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Revenue Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time dine-in & takeaway collections</p>
            </div>

            {/* Range Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-600">
              {(['today', 'week', 'month', 'year'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                    chartRange === r
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
            {currentChartData.map((bar, i) => {
              const heightPercent = Math.max(12, Math.round((bar.value / maxChartValue) * 100));
              const isHighest = bar.value === maxChartValue;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-9 z-10 px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-mono whitespace-nowrap shadow-md transition-opacity">
                    {formatINR(bar.value)}
                  </div>

                  <div className="w-full bg-slate-100 rounded-t-xl h-48 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 group-hover:opacity-90 ${
                        isHighest
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-sm'
                          : 'bg-gradient-to-t from-slate-800 to-slate-600'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 transition">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Peak Period</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                <span>Standard Volume</span>
              </div>
            </div>
            <span className="font-mono text-slate-700">Currency: Indian Rupee (INR)</span>
          </div>
        </div>

        {/* Order Status & Payment Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Kitchen & Floor Status */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Live Order Status</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                View Live
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80">
                <div className="flex items-center justify-between text-amber-700 text-xs font-semibold mb-1">
                  <span>New Orders</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                </div>
                <div className="text-2xl font-black text-amber-950">{statusCounts.new}</div>
                <div className="text-[10px] text-amber-700 mt-0.5">Needs acceptance</div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80">
                <div className="flex items-center justify-between text-sky-700 text-xs font-semibold mb-1">
                  <span>Kitchen Cooking</span>
                  <Flame className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-sky-950">{statusCounts.kitchen}</div>
                <div className="text-[10px] text-sky-700 mt-0.5">In preparation</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
                  <span>Served Tables</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-950">{statusCounts.served}</div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Billed & delivered</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-600 text-xs font-semibold mb-1">Cancelled</div>
                <div className="text-2xl font-black text-slate-800">{statusCounts.cancelled}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Refunded/void</div>
              </div>
            </div>
          </div>

          {/* Cash, UPI, and Card Collections */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Cash, UPI & Card Collections</h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    UPI Collections ({upiPercent}%)
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatINR(Math.round(todaySales * (upiPercent / 100)))}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${upiPercent}%` }} className="bg-indigo-600 h-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Card Collections ({cardPercent}%):
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatINR(Math.round(todaySales * (cardPercent / 100)))}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${cardPercent}%` }} className="bg-emerald-600 h-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-amber-600" />
                    Cash Collections ({cashPercent}%):
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatINR(Math.round(todaySales * (cashPercent / 100)))}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${cashPercent}%` }} className="bg-amber-600 h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders Table + Popular Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Billed Orders</h3>
              <p className="text-xs text-slate-500">Latest active table tickets and takeaways</p>
            </div>
            <button
              onClick={() => setActiveTab('pos')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Order
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-left">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer / Table</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const statusColors: Record<OrderStatus, string> = {
                    New: 'bg-amber-50 text-amber-800 border-amber-200',
                    Preparing: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    Kitchen: 'bg-sky-50 text-sky-800 border-sky-200',
                    Ready: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                    Served: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    Cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="text-rose-600 font-medium">{order.tableNumber}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(order.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 max-w-[200px] truncate text-slate-600">
                        {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {formatINR(order.grandTotal)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            statusColors[order.status]
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleViewInvoice(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition inline-flex items-center gap-1"
                          title="View and print bill"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-[11px] font-medium">Bill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="lg:col-span-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Top Ordered Dishes</h3>
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Full Menu
            </button>
          </div>

          <div className="space-y-3">
            {sortedMenuItems.slice(0, 5).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <FoodTypeBadge type={item.foodType} size="xs" />
                      <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                    </div>
                    <div className="text-[11px] text-slate-500">{item.category} • ₹{item.price}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">{item.salesCount} sold</div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {formatINR(item.salesCount * item.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
