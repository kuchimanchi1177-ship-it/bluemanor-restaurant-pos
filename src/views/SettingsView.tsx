"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import {
  Store,
  Receipt,
  RotateCcw,
  Upload,
  Printer,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsView() {
  const {
    brand,
    updateBrand,
    orders,
    setSelectedOrderForInvoice,
    setIsInvoiceModalOpen,
    resetDemo,
    showToast,
  } = useApp();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: brand.name || 'BLUEMANOR',
    address: brand.address || 'Plot 14, Grand Boulevard, Financial District, Hyderabad, 500032',
    phone: brand.phone || '+91 98765 43210',
    email: brand.email || 'contact@bluemanor.com',
    gstin: brand.gstin || '36AABCB5512K1Z8',
    gstRate: brand.gstRate || 5,
    storeOpen: brand.storeOpen ?? true,
    logoUrl: brand.logoUrl || '',
    currency: brand.currency || 'INR',
  });

  // Bill Settings State
  const [defaultDiscount, setDefaultDiscount] = useState<number>(0);

  // Reset Demo Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand(profileForm);
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Restaurant profile and billing settings updated successfully.',
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setProfileForm((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleInvoicePreview = () => {
    const sampleOrder = orders[0] || {
      id: 'ord-preview',
      orderNumber: 'ORD-1044',
      customerName: 'Aman Verma',
      customerPhone: '+91 98765 43210',
      tableNumber: 'T-04',
      orderType: 'Dine-in' as const,
      items: [
        { menuItemId: 'item-1', name: 'Masala Dosa', price: 60, quantity: 2, foodType: 'VEG' as const },
        { menuItemId: 'item-2', name: 'Hyderabadi Chicken Biryani', price: 240, quantity: 1, foodType: 'NON_VEG' as const },
      ],
      subtotal: 360,
      discount: 0,
      gstRate: brand.gstRate || 5,
      cgst: 9,
      sgst: 9,
      grandTotal: 378,
      status: 'Served' as const,
      createdAt: new Date().toISOString(),
      paymentMethod: 'UPI / QR' as const,
      paymentStatus: 'Paid' as const,
      waiterName: 'Rahul Sharma',
    };
    setSelectedOrderForInvoice(sampleOrder);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintBill = () => {
    handleInvoicePreview();
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleConfirmReset = () => {
    resetDemo();
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage restaurant profile, bill calculation parameters, and demo database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. RESTAURANT PROFILE (Left/Wide) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Restaurant Profile</h3>
              <p className="text-xs text-slate-400">Official business details for POS invoices and customer receipts</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Logo Upload & Preview */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Restaurant Logo
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="shrink-0 flex items-center justify-center">
                  <BrandLogo
                    logoUrl={profileForm.logoUrl}
                    name={profileForm.name}
                    size="xl"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    {profileForm.logoUrl ? 'Custom Logo Applied' : 'Default BLUEMANOR Emblem'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Upload your high-resolution restaurant emblem or brand mark (PNG, JPG, SVG).
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {profileForm.logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition cursor-pointer"
                      >
                        Reset to Placeholder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="BLUEMANOR"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Plot 14, Grand Boulevard, Financial District..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 resize-none"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="contact@bluemanor.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* GSTIN & Configurable GST Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GSTIN (Tax ID)
                </label>
                <input
                  type="text"
                  value={profileForm.gstin}
                  onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                  placeholder="36AABCB5512K1Z8"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Configurable GST Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="28"
                    step="0.5"
                    value={profileForm.gstRate}
                    onChange={(e) => setProfileForm({ ...profileForm, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 pr-8 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:border-red-600"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                    %
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Split equally into CGST & SGST on thermal bills.</p>
              </div>
            </div>

            {/* Store Status: Open / Closed Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">Restaurant Store Status</div>
                <div className="text-[11px] text-slate-400">
                  {profileForm.storeOpen ? 'Accepting dine-in and takeaway orders' : 'Store is marked closed'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileForm({ ...profileForm, storeOpen: !profileForm.storeOpen })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                  profileForm.storeOpen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    profileForm.storeOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span>{profileForm.storeOpen ? 'Store Open' : 'Store Closed'}</span>
              </button>
            </div>

            {/* Save Profile Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition cursor-pointer"
              >
                Save Restaurant Profile
              </button>
            </div>
          </form>
        </div>

        {/* 2. BILL SETTINGS & 3. DEMO SETTINGS (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          {/* BILL SETTINGS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Receipt className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Bill Settings</h3>
                <p className="text-xs text-slate-400">Invoice formatting & default rates</p>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Currency
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Indian Rupee (INR)</span>
                <span className="font-mono text-slate-500">₹</span>
              </div>
            </div>

            {/* Default Discount Settings */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Discount Setting
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                {[0, 5, 10, 15].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setDefaultDiscount(val);
                      showToast({
                        type: 'info',
                        title: 'Default Discount Updated',
                        message: `${val}% preset selected for new POS bills.`,
                      });
                    }}
                    className={`py-1.5 rounded-xl border transition cursor-pointer text-center ${
                      defaultDiscount === val
                        ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {val === 0 ? 'None' : `${val}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Preview & Print Option */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={handleInvoicePreview}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Invoice Preview</span>
              </button>

              <button
                type="button"
                onClick={handlePrintBill}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Print Bill Option</span>
              </button>
            </div>
          </div>

          {/* DEMO SETTINGS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <RotateCcw className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Demo Settings</h3>
                <p className="text-xs text-slate-400">Restore application demo state</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Reset Demo clears your local browser storage and reinitializes BLUEMANOR with pristine default menu items, categories, demo orders, and staff records.
            </p>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">Reset All Demo Data?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will clear any newly added orders, menu dishes, and categories, returning BLUEMANOR to default demo state.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
