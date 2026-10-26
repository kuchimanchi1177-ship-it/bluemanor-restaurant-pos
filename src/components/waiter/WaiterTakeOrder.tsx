"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MenuItem, FoodType, OrderType } from '@/types';
import { formatINR } from '@/utils/formatters';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  X,
  CheckCircle2,
  Trash2,
  ChefHat,
  Layers,
  ArrowRight,
  Flame,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WaiterCartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface WaiterTakeOrderProps {
  initialTable?: string;
  onOrderCompleted: () => void;
}

export default function WaiterTakeOrder({
  initialTable,
  onOrderCompleted,
}: WaiterTakeOrderProps) {
  const {
    brand,
    categories,
    menuItems,
    tables,
    currentUser,
    createOrder,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  // Order Details
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [tableNumber, setTableNumber] = useState<string>(initialTable || 'T-01');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Cart State local to waiter session
  const [cart, setCart] = useState<WaiterCartItem[]>([]);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter Menu Items
  const filteredItems = menuItems.filter((item) => {
    // 1. Category
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    // 2. Veg / Non-Veg
    const isVeg = item.foodType === 'VEG' || item.isVeg;
    if (foodTypeFilter === 'Veg' && !isVeg) return false;
    if (foodTypeFilter === 'Non-Veg' && isVeg) return false;
    // 3. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  // Cart manipulation
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    setErrorMsg('');
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as WaiterCartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const clearLocalCart = () => {
    setCart([]);
    setIsCartSheetOpen(false);
  };

  // Calculations
  const totalItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const subtotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const gstRate = brand.gstRate || 5;
  const totalTax = Math.round((subtotal * gstRate) / 100);
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;
  const grandTotal = subtotal + totalTax;

  // Group cart items into Veg and Non-Veg
  const vegCartItems = cart.filter((c) => c.menuItem.foodType === 'VEG' || c.menuItem.isVeg);
  const nonVegCartItems = cart.filter((c) => c.menuItem.foodType === 'NON_VEG' && !c.menuItem.isVeg);

  // Submit Order to shared AppContext
  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      setErrorMsg('Cart is empty. Add dishes before confirming.');
      return;
    }
    if (orderType === 'Dine-in' && !tableNumber) {
      setErrorMsg('Please select a dining table.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = createOrder({
        tableNumber: orderType === 'Dine-in' ? tableNumber : 'Takeaway',
        orderType,
        customerName: customerName.trim() || `Table ${tableNumber} Guest`,
        customerPhone: customerPhone.trim(),
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          name: c.menuItem.name,
          price: c.menuItem.price,
          quantity: c.quantity,
          foodType: c.menuItem.foodType || (c.menuItem.isVeg ? 'VEG' : 'NON_VEG'),
          notes: c.notes,
        })),
        notes: orderNotes.trim(),
        waiterName: currentUser?.name || 'Waiter',
        status: 'Kitchen',
        paymentStatus: 'Unpaid',
      });

      if (created) {
        clearLocalCart();
        setIsSubmitting(false);
        onOrderCompleted();
      } else {
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error('Order placement failed', e);
      setIsSubmitting(false);
      setErrorMsg('Failed to place order. Please try again.');
    }
  };

  return (
    <div
      className={`space-y-4 ${
        cart.length > 0
          ? 'pb-[calc(10.5rem+env(safe-area-inset-bottom,0px))]'
          : 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))]'
      }`}
    >
      {/* 1. Top Order Meta (Table & Guest Bar) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-red-600" />
              Table Details
            </span>
          </div>

          {/* Dine-in vs Takeaway Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setOrderType('Dine-in')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                orderType === 'Dine-in'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Dine-In
            </button>
            <button
              type="button"
              onClick={() => setOrderType('Takeaway')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                orderType === 'Takeaway'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Takeaway
            </button>
          </div>
        </div>

        {/* Table Selector Grid for Dine-in */}
        {orderType === 'Dine-in' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Dining Table *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-32 overflow-y-auto p-0.5">
              {tables.map((t) => {
                const isSelected = tableNumber === t.tableNumber;
                const isOccupied = t.status === 'Occupied';
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTableNumber(t.tableNumber)}
                    className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-red-600 border-red-600 text-white shadow-xs ring-2 ring-red-200'
                        : isOccupied
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/70'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black">{t.tableNumber}</span>
                    <span
                      className={`text-[9px] font-bold mt-0.5 ${
                        isSelected
                          ? 'text-red-100'
                          : isOccupied
                          ? 'text-amber-700'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isOccupied ? 'Occupied' : 'Free'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Guest Name & Phone (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Guest Name (optional)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Guest Phone (optional)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* 2. Menu Search & Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Biryani, Dosa, Paneer)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Quick Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shrink-0 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setFoodTypeFilter('All')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                foodTypeFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFoodTypeFilter('Veg')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                foodTypeFilter === 'Veg'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <FoodTypeBadge type="VEG" size="xs" />
              <span>Veg</span>
            </button>
            <button
              type="button"
              onClick={() => setFoodTypeFilter('Non-Veg')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                foodTypeFilter === 'Non-Veg'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <FoodTypeBadge type="NON_VEG" size="xs" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Menu Item Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          const cartEntry = cart.find((c) => c.menuItem.id === item.id);
          const quantity = cartEntry?.quantity || 0;
          const isAvailable = item.isAvailable !== false;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-3.5 flex items-center justify-between gap-3 shadow-2xs transition ${
                !isAvailable
                  ? 'opacity-60 border-slate-200 bg-slate-50/50'
                  : quantity > 0
                  ? 'border-red-300 ring-1 ring-red-300 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Item Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <FoodTypeBadge type={item.foodType} size="xs" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug truncate" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-xs font-black text-slate-900 mt-1">
                  {formatINR(item.price)}
                </p>
              </div>

              {/* Action Controls */}
              <div className="shrink-0">
                {!isAvailable ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-200 text-slate-600">
                    Sold Out
                  </span>
                ) : quantity === 0 ? (
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-black transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-red-700 shadow-2xs hover:bg-red-100 flex items-center justify-center font-black transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-black text-xs text-red-950">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-red-600 text-white shadow-2xs hover:bg-red-700 flex items-center justify-center font-black transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
          <p className="text-xs font-semibold">No menu dishes found</p>
          <p className="text-[11px] text-slate-400 mt-1">Try another category or search keyword.</p>
        </div>
      )}

      {/* 4. Floating Cart Summary Bar (Mobile / Tablet) */}
      {cart.length > 0 && !isCartSheetOpen && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] inset-x-4 max-w-lg mx-auto z-30 animate-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setIsCartSheetOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs">
                {totalItemCount}
              </div>
              <div className="text-left">
                <p className="text-xs font-black leading-tight">
                  {orderType === 'Dine-in' ? `Table ${tableNumber}` : 'Takeaway Order'}
                </p>
                <p className="text-[11px] text-slate-300">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} • Tap to review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black">{formatINR(grandTotal)}</span>
              <div className="py-1.5 px-3 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1">
                <span>Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 5. Cart & Bill Review Modal / Bottom Sheet */}
      {isCartSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs">
                  {totalItemCount}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    Review Table Order
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {orderType === 'Dine-in' ? `Table ${tableNumber}` : 'Takeaway'} • {customerName || 'Guest'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in Cart */}
            {errorMsg && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sheet Scrollable Items */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* VEG ITEMS SECTION */}
              {vegCartItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                    <FoodTypeBadge type="VEG" size="xs" />
                    <span>Vegetarian Items ({vegCartItems.reduce((acc, it) => acc + it.quantity, 0)})</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {vegCartItems.map((c) => (
                      <div key={c.menuItem.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{c.menuItem.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatINR(c.menuItem.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => updateQuantity(c.menuItem.id, -1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-xs">{c.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(c.menuItem.id, 1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-xs text-slate-900 w-16 text-right">
                            {formatINR(c.menuItem.price * c.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NON-VEG ITEMS SECTION */}
              {nonVegCartItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-1 rounded-md border border-rose-200/60">
                    <FoodTypeBadge type="NON_VEG" size="xs" />
                    <span>Non-Vegetarian Items ({nonVegCartItems.reduce((acc, it) => acc + it.quantity, 0)})</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {nonVegCartItems.map((c) => (
                      <div key={c.menuItem.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{c.menuItem.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatINR(c.menuItem.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => updateQuantity(c.menuItem.id, -1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-xs">{c.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(c.menuItem.id, 1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-xs text-slate-900 w-16 text-right">
                            {formatINR(c.menuItem.price * c.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kitchen Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kitchen Notes (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Less spicy, serve drinks first, extra napkins"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Tax & Total Summary */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold font-mono">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({gstRate}%)</span>
                  <span className="font-bold font-mono">{formatINR(totalTax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-red-700">{formatINR(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Sheet Footer Actions */}
            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-slate-100 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={clearLocalCart}
                className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="Discard Order"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={handleConfirmOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending to Kitchen...</span>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5" />
                    <span>Confirm & Send to Kitchen ({formatINR(grandTotal)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
