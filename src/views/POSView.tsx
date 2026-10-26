"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/utils/formatters';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  ShoppingBag,
  Utensils,
} from 'lucide-react';

export default function POSView() {
  const {
    brand,
    categories,
    menuItems,
    cart,
    cartMeta,
    setCartMeta,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    waiters,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  // Filter menu items combining category, food type, and search
  const filteredItems = menuItems.filter((item) => {
    // 1. Category Filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // 2. Food Type Filter: All / Veg / Non-Veg
    const isVeg = item.foodType === 'VEG' || item.isVeg;
    if (foodTypeFilter === 'Veg' && !isVeg) return false;
    if (foodTypeFilter === 'Non-Veg' && isVeg) return false;

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc) return false;
    }

    return true;
  });

  // Calculate bill totals
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  let discountAmount = 0;
  if (cartMeta.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * (cartMeta.discountValue || 0)) / 100);
  } else {
    discountAmount = Math.min(cartMeta.discountValue || 0, subtotal);
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const gstRate = brand.gstRate || 5;
  const totalTax = (discountedSubtotal * gstRate) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax / 2) * 100) / 100;
  const grandTotal = Math.round(discountedSubtotal + cgst + sgst);

  // Group cart items into Veg and Non-Veg
  const vegCartItems = cart.filter((c) => c.menuItem.foodType === 'VEG');
  const nonVegCartItems = cart.filter((c) => c.menuItem.foodType === 'NON_VEG');

  const tablesList = [
    'T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06',
    'T-07', 'T-08', 'T-09', 'T-10', 'T-11', 'T-12'
  ];

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin POS</h2>
          <p className="text-xs text-slate-500">Point of sale and new customer billing terminal</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Menu Area */}
        <div className="xl:col-span-7 2xl:col-span-8 space-y-4">
          {/* Search & Food Type Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Menu Items */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu items (e.g. Masala Dosa, Biryani, Chai)..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                />
              </div>

              {/* FOOD TYPE FILTERS: All, Veg, Non-Veg */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('All')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    foodTypeFilter === 'All'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('Veg')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    foodTypeFilter === 'Veg'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/50'
                  }`}
                >
                  <FoodTypeBadge type="VEG" size="xs" />
                  <span>Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('Non-Veg')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    foodTypeFilter === 'Non-Veg'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-red-700 hover:text-red-900 hover:bg-red-50/50'
                  }`}
                >
                  <FoodTypeBadge type="NON_VEG" size="xs" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
              <p className="text-sm font-bold text-slate-700">No dishes match your filter</p>
              <p className="text-xs text-slate-400 mt-1">
                Try switching between Veg / Non-Veg or selecting another category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setFoodTypeFilter('All');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredItems.map((item) => {
                const cartItem = cart.find((c) => c.menuItem.id === item.id);
                const currentQty = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.isAvailable && currentQty === 0) {
                        addToCart(item);
                      }
                    }}
                    className={`bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition flex flex-col justify-between cursor-pointer select-none group ${
                      !item.isAvailable ? 'opacity-60 pointer-events-none' : ''
                    } ${currentQty > 0 ? 'ring-1 ring-red-500/40 border-red-200' : ''}`}
                  >
                    <div>
                      {/* Image or Placeholder Thumbnail */}
                      <div className="w-full h-24 rounded-xl bg-slate-100 mb-2 overflow-hidden relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}

                        {/* Veg / Non-Veg Indicator Badge */}
                        <div className="absolute top-2 left-2 p-1 rounded-md bg-white/95 backdrop-blur-xs shadow-xs border border-slate-200">
                          <FoodTypeBadge type={item.foodType} size="xs" />
                        </div>

                        {/* Category Badge */}
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/70 text-white backdrop-blur-xs">
                          {item.category}
                        </span>

                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1" title={item.name}>
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        ₹{item.price}
                      </span>

                      {item.isAvailable && (
                        <div>
                          {currentQty === 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg p-0.5"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentQty > 1) {
                                    updateCartQuantity(item.id, currentQty - 1);
                                  } else {
                                    removeFromCart(item.id);
                                  }
                                }}
                                className="w-5 h-5 rounded bg-white text-red-600 hover:bg-red-100 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-4 text-center text-xs font-bold text-red-900">
                                {currentQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.id, currentQty + 1)}
                                className="w-5 h-5 rounded bg-red-600 text-white hover:bg-red-700 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Current Order Panel */}
        <div className="xl:col-span-5 2xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-20">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-slate-900 text-sm">Current Order</h3>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-600 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Table Number vs Takeaway Selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCartMeta((prev) => ({ ...prev, orderType: 'Dine-in' }))}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  cartMeta.orderType === 'Dine-in'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🍽️ Dine-in Table
              </button>
              <button
                type="button"
                onClick={() => setCartMeta((prev) => ({ ...prev, orderType: 'Takeaway' }))}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  cartMeta.orderType === 'Takeaway'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛍️ Takeaway / Parcel
              </button>
            </div>

            {/* Table & Waiter Selection */}
            <div className="grid grid-cols-2 gap-3">
              {cartMeta.orderType === 'Dine-in' ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Table Number
                  </label>
                  <select
                    value={cartMeta.tableNumber}
                    onChange={(e) => setCartMeta((prev) => ({ ...prev, tableNumber: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-red-600"
                  >
                    {tablesList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Order Type
                  </label>
                  <div className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-slate-50">
                    Parcel Counter
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Assigned Waiter
                </label>
                <select
                  value={cartMeta.waiterName}
                  onChange={(e) => setCartMeta((prev) => ({ ...prev, waiterName: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-red-600"
                >
                  {waiters.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={cartMeta.customerName}
                  onChange={(e) => setCartMeta((prev) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Guest Customer"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={cartMeta.customerPhone}
                  onChange={(e) => setCartMeta((prev) => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+91 99999 00000"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Selected Items List with VEG AND NON-VEG ORDER SEPARATION */}
          <div className="py-3 border-b border-slate-200 max-h-60 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No items selected</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click any dish from the menu to add to bill</p>
              </div>
            ) : (
              <>
                {/* 1. VEG ITEMS SECTION */}
                {vegCartItems.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                      <FoodTypeBadge type="VEG" size="xs" />
                      <span>Veg Items ({vegCartItems.reduce((acc, it) => acc + it.quantity, 0)})</span>
                    </div>

                    <div className="space-y-1.5">
                      {vegCartItems.map((item) => (
                        <div
                          key={item.menuItem.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 truncate">
                              {item.menuItem.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ₹{item.menuItem.price} each
                            </div>
                          </div>

                          {/* Quantity Controls (never drops below 1) */}
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateCartQuantity(item.menuItem.id, item.quantity - 1);
                                }
                              }}
                              disabled={item.quantity <= 1}
                              className={`w-5 h-5 rounded text-slate-600 flex items-center justify-center font-bold ${
                                item.quantity <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'
                              }`}
                              title={item.quantity <= 1 ? 'Quantity cannot fall below 1' : 'Decrease'}
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center font-bold text-slate-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                              className="w-5 h-5 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[50px] font-bold text-slate-900 text-xs">
                            ₹{item.menuItem.price * item.quantity}
                          </div>

                          {/* Remove Item Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. NON-VEG ITEMS SECTION */}
                {nonVegCartItems.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-red-800 uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md border border-red-200/60">
                      <FoodTypeBadge type="NON_VEG" size="xs" />
                      <span>Non-Veg Items ({nonVegCartItems.reduce((acc, it) => acc + it.quantity, 0)})</span>
                    </div>

                    <div className="space-y-1.5">
                      {nonVegCartItems.map((item) => (
                        <div
                          key={item.menuItem.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 truncate">
                              {item.menuItem.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ₹{item.menuItem.price} each
                            </div>
                          </div>

                          {/* Quantity Controls (never drops below 1) */}
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateCartQuantity(item.menuItem.id, item.quantity - 1);
                                }
                              }}
                              disabled={item.quantity <= 1}
                              className={`w-5 h-5 rounded text-slate-600 flex items-center justify-center font-bold ${
                                item.quantity <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'
                              }`}
                              title={item.quantity <= 1 ? 'Quantity cannot fall below 1' : 'Decrease'}
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center font-bold text-slate-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                              className="w-5 h-5 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[50px] font-bold text-slate-900 text-xs">
                            ₹{item.menuItem.price * item.quantity}
                          </div>

                          {/* Remove Item Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Special Notes */}
          <div className="py-2.5 border-b border-slate-200">
            <input
              type="text"
              value={cartMeta.notes}
              onChange={(e) => setCartMeta((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Kitchen instructions (e.g. less spice, extra lime)..."
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Discount Selector */}
          <div className="py-2.5 border-b border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600">Discount:</span>
              <span className="text-xs font-bold text-emerald-600">
                {cartMeta.discountValue > 0 ? `${cartMeta.discountValue}% applied` : 'None'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {[0, 5, 10, 15].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    setCartMeta((prev) => ({
                      ...prev,
                      discountType: 'percentage',
                      discountValue: val,
                    }))
                  }
                  className={`py-1 rounded-lg border text-xs transition cursor-pointer ${
                    cartMeta.discountValue === val
                      ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val === 0 ? 'None' : `${val}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Bill Calculation Breakdown */}
          <div className="py-3 border-b border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({cartMeta.discountValue}%)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>CGST ({gstRate / 2}%)</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>SGST ({gstRate / 2}%)</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900 text-sm">Grand Total</span>
              <span className="font-black text-red-600 text-xl">{formatINR(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="py-3 border-b border-slate-200">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              {(['UPI / QR', 'Cash', 'Card'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setCartMeta((prev) => ({ ...prev, paymentMethod: method }))}
                  className={`py-1.5 rounded-xl border transition cursor-pointer ${
                    cartMeta.paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Actions: Clear & Place Order */}
          <div className="pt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={clearCart}
              disabled={cart.length === 0}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => placeOrder()}
              disabled={cart.length === 0}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Place Order • {formatINR(grandTotal)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
