"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/utils/formatters';
import BrandLogo from '@/components/BrandLogo';
import {
  Printer,
  X,
  Share2,
  CheckCircle,
  FileText,
  Receipt,
} from 'lucide-react';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';

export default function InvoiceModal() {
  const {
    brand,
    selectedOrderForInvoice,
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    setSelectedOrderForInvoice,
    showToast,
  } = useApp();

  const [receiptStyle, setReceiptStyle] = useState<'thermal' | 'tax_invoice'>('thermal');

  if (!isInvoiceModalOpen || !selectedOrderForInvoice) return null;

  const order = selectedOrderForInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `*${brand.name || 'BLUEMANOR'} - Receipt*\nOrder: ${order.orderNumber}\nTable: ${order.tableNumber}\nItems:\n${order.items.map(i => `- [${i.foodType === 'NON_VEG' ? 'NON-VEG' : 'VEG'}] ${i.name} x${i.quantity}: ₹${i.price * i.quantity}`).join('\n')}\nTotal: ₹${order.grandTotal}\nPayment: ${order.paymentMethod} (Paid)\nThank you! Visit again.`;
    navigator.clipboard?.writeText(text);
    showToast({
      type: 'success',
      title: 'Bill Summary Copied',
      message: 'Receipt text ready to send via WhatsApp or SMS.',
    });
  };

  const handleClose = () => {
    setIsInvoiceModalOpen(false);
    setSelectedOrderForInvoice(null);
  };

  const vegItems = order.items.filter((i) => i.foodType === 'VEG');
  const nonVegItems = order.items.filter((i) => i.foodType === 'NON_VEG');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-lg my-6 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Actions bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Format:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setReceiptStyle('thermal')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  receiptStyle === 'thermal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal Slip (80mm)
              </button>
              <button
                type="button"
                onClick={() => setReceiptStyle('tax_invoice')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  receiptStyle === 'tax_invoice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standard Bill
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopySummary}
              title="Copy receipt summary"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto font-sans" id="printable-receipt">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="flex justify-center mb-2">
              <BrandLogo
                logoUrl={brand.logoUrl}
                name={brand.name || 'BLUEMANOR'}
                size="lg"
              />
            </div>
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">
              {brand.name || 'BLUEMANOR'}
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto mt-0.5 leading-snug">
              {brand.address}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Ph: <span className="font-medium text-slate-800">{brand.phone}</span> | GSTIN:{' '}
              <span className="font-mono text-slate-800">{brand.gstin || '36AABCB5512K1Z8'}</span>
            </p>
          </div>

          {/* Meta Information */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="font-bold text-slate-900">Bill No: {order.orderNumber}</span>
              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Time: {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                {order.orderType === 'Dine-in' ? `Table: ${order.tableNumber}` : 'Takeaway'}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Customer: <strong className="text-slate-900">{order.customerName}</strong></span>
              <span>Ph: {order.customerPhone}</span>
            </div>
            {order.waiterName && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Server: {order.waiterName}</span>
                <span>Type: {order.orderType}</span>
              </div>
            )}
          </div>

          {/* Items Table with Veg & Non-Veg Grouping */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 pb-1 font-semibold text-left">
                  <th className="pb-1.5 w-1/2">Item</th>
                  <th className="pb-1.5 text-center w-12">Qty</th>
                  <th className="pb-1.5 text-right w-16">Rate</th>
                  <th className="pb-1.5 text-right w-16">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Veg Items Subheading */}
                {vegItems.length > 0 && (
                  <>
                    <tr className="bg-emerald-50/60 text-emerald-800 font-bold text-[10px]">
                      <td colSpan={4} className="py-1 px-1">
                        <span className="inline-flex items-center gap-1">
                          <FoodTypeBadge type="VEG" size="xs" />
                          <span>VEG ITEMS</span>
                        </span>
                      </td>
                    </tr>
                    {vegItems.map((item, idx) => (
                      <tr key={`veg-${idx}`} className="text-slate-800">
                        <td className="py-1.5 pr-1 font-medium">
                          {item.name}
                        </td>
                        <td className="py-1.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-1.5 text-right text-slate-600">₹{item.price}</td>
                        <td className="py-1.5 text-right font-semibold text-slate-900">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Non-Veg Items Subheading */}
                {nonVegItems.length > 0 && (
                  <>
                    <tr className="bg-red-50/60 text-red-800 font-bold text-[10px]">
                      <td colSpan={4} className="py-1 px-1">
                        <span className="inline-flex items-center gap-1">
                          <FoodTypeBadge type="NON_VEG" size="xs" />
                          <span>NON-VEG ITEMS</span>
                        </span>
                      </td>
                    </tr>
                    {nonVegItems.map((item, idx) => (
                      <tr key={`nonveg-${idx}`} className="text-slate-800">
                        <td className="py-1.5 pr-1 font-medium">
                          {item.name}
                        </td>
                        <td className="py-1.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-1.5 text-right text-slate-600">₹{item.price}</td>
                        <td className="py-1.5 text-right font-semibold text-slate-900">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount {order.discountPercentage ? `(${order.discountPercentage}%)` : ''}:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>CGST ({brand.gstRate / 2}%):</span>
              <span>₹{order.cgst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>SGST ({brand.gstRate / 2}%):</span>
              <span>₹{order.sgst.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-base font-black text-slate-950">
              <span>GRAND TOTAL:</span>
              <span className="text-lg text-red-600">{formatINR(order.grandTotal)}</span>
            </div>
          </div>

          {/* Payment & Footer */}
          <div className="pt-3 text-center text-xs text-slate-600 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Paid via {order.paymentMethod}
            </div>

            <div className="text-[11px] text-slate-500 pt-2 font-mono">
              *** Thank You! Please Visit BLUEMANOR Again ***
            </div>
            <div className="text-[10px] text-slate-400">
              BLUEMANOR Restaurant Billing POS Demo
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs hover:shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-red-400" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
