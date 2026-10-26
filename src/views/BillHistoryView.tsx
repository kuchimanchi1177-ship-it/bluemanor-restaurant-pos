"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, PaymentMethod, OrderType } from '@/types';
import { formatINR, formatRelativeTime } from '@/utils/formatters';
import {
  Search,
  Filter,
  Calendar,
  Receipt,
  Printer,
  Eye,
  Download,
  Share2,
  Database,
  ArrowUpDown,
  CreditCard,
  QrCode,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function BillHistoryView() {
  const { orders, setSelectedOrderForInvoice, setIsInvoiceModalOpen, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'All'>('All');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');

  // Filter bills
  const filteredBills = orders.filter((order) => {
    // Payment filter
    if (paymentFilter !== 'All' && order.paymentMethod !== paymentFilter) return false;

    // Type filter
    if (orderTypeFilter !== 'All' && order.orderType !== orderTypeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchTable = order.tableNumber.toLowerCase().includes(q);
      if (!matchNumber && !matchCustomer && !matchPhone && !matchTable) return false;
    }

    return true;
  });

  const totalRevenue = filteredBills
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const totalTaxCollected = filteredBills
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.cgst + o.sgst, 0);

  const totalDiscount = filteredBills.reduce((sum, o) => sum + o.discount, 0);

  const handleReprint = (order: Order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Bill Number', 'Date', 'Customer', 'Phone', 'Table', 'Type', 'Server', 'Subtotal', 'Discount', 'Taxes', 'Grand Total', 'Payment Mode'];
    const rows = filteredBills.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      o.customerName,
      o.customerPhone,
      o.tableNumber,
      o.orderType,
      o.waiterName || 'Staff',
      o.subtotal,
      o.discount,
      (o.cgst + o.sgst).toFixed(2),
      o.grandTotal,
      o.paymentMethod,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bills_history_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Bills Exported to CSV',
      message: `${filteredBills.length} records exported for accounting.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Production Storage Advisory */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-600" />
          <span>
            <strong>Demo Bill Registry:</strong> In production deployment, historical bills are retained
            for 6+ months with automated daily cloud backups, GST audit logs, and tally export.
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settled Invoices
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {filteredBills.filter((o) => o.status !== 'Cancelled').length} Bills
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Tax Compliant</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Billed Revenue
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {formatINR(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-400">Inclusive of GST</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total GST Collected
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(totalTaxCollected)}
          </div>
          <span className="text-[11px] text-slate-500">CGST + SGST Ledger</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Discounts Granted
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatINR(totalDiscount)}
          </div>
          <span className="text-[11px] text-slate-400">Promotions & Loyalty</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by bill #, customer name, phone, or table..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="All">All Payment Modes</option>
            <option value="UPI / QR">UPI / QR</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card POS</option>
          </select>

          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="All">All Types</option>
            <option value="Dine-in">Dine-in</option>
            <option value="Takeaway">Takeaway</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-left">
                <th className="py-3.5 px-4 font-semibold">Bill Number</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Customer / Table</th>
                <th className="py-3.5 px-4 font-semibold">Server</th>
                <th className="py-3.5 px-4 font-semibold">Payment</th>
                <th className="py-3.5 px-4 font-semibold text-right">Subtotal</th>
                <th className="py-3.5 px-4 font-semibold text-right">Taxes</th>
                <th className="py-3.5 px-4 font-semibold text-right">Grand Total</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((order) => {
                const isCancelled = order.status === 'Cancelled';

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="font-semibold text-rose-600">{order.tableNumber}</span>
                        <span>•</span>
                        <span>{order.orderType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {order.waiterName || 'Staff'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700">₹{order.subtotal}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                      ₹{(order.cgst + order.sgst).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-extrabold text-sm ${isCancelled ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                        {formatINR(order.grandTotal)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleReprint(order)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        title="View and reprint thermal receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Reprint</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
