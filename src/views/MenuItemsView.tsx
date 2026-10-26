"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MenuItem, FoodType } from '@/types';
import { FoodTypeBadge } from '@/components/FoodTypeBadge';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Utensils,
  AlertTriangle,
  Upload,
  Check,
  X,
} from 'lucide-react';

export default function MenuItemsView() {
  const {
    categories,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Starters',
    price: 150,
    description: '',
    foodType: 'VEG' as FoodType,
    isVeg: true,
    isAvailable: true,
    image: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delete modal
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    const isVeg = item.foodType === 'VEG' || item.isVeg;
    if (foodTypeFilter === 'Veg' && !isVeg) return false;
    if (foodTypeFilter === 'Non-Veg' && isVeg) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: categories.find((c) => c.name !== 'All')?.name || 'Starters',
      price: 120,
      description: '',
      foodType: 'VEG',
      isVeg: true,
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    const fType = item.foodType || (item.isVeg ? 'VEG' : 'NON_VEG');
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      foodType: fType,
      isVeg: fType === 'VEG',
      isAvailable: item.isAvailable,
      image: item.image || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = 'Item name is required';
    if (!formData.price || formData.price <= 0) errs.price = 'Please enter a valid price';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        description: formData.description.trim(),
        foodType: formData.foodType,
        isVeg: formData.foodType === 'VEG',
        isAvailable: formData.isAvailable,
        image: formData.image,
      });
    } else {
      addMenuItem({
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        description: formData.description.trim(),
        foodType: formData.foodType,
        isVeg: formData.foodType === 'VEG',
        isAvailable: formData.isAvailable,
        image: formData.image,
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteMenuItem(deletingItem.id);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Title & Add Item Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Menu Items</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your restaurant dishes, prices, and stock availability
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search dish name, category, description..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
          />
        </div>

        {/* Veg / Non-Veg filter & Category filter */}
        <div className="flex items-center gap-2">
          {/* Food Type */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFoodTypeFilter('All')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                foodTypeFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFoodTypeFilter('Veg')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                foodTypeFilter === 'Veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
              }`}
            >
              <FoodTypeBadge type="VEG" size="xs" />
              <span>Veg</span>
            </button>
            <button
              type="button"
              onClick={() => setFoodTypeFilter('Non-Veg')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                foodTypeFilter === 'Non-Veg' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700'
              }`}
            >
              <FoodTypeBadge type="NON_VEG" size="xs" />
              <span>Non-Veg</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-red-600"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <p className="text-sm font-bold text-slate-700">No menu items found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or add a new menu item.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition cursor-pointer"
          >
            + Add First Dish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between ${
                !item.isAvailable ? 'opacity-70 bg-slate-50/50' : ''
              }`}
            >
              <div>
                {/* Food Image / Placeholder */}
                <div className="w-full h-32 rounded-xl bg-slate-100 mb-3 overflow-hidden relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Utensils className="w-8 h-8" />
                    </div>
                  )}

                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-2 left-2 p-1 rounded-md bg-white/95 backdrop-blur-xs shadow-xs border border-slate-200">
                    <FoodTypeBadge type={item.foodType} size="xs" />
                  </div>

                  {/* Category */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {item.name}
                  </h3>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Bottom: Price, Availability, Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-base font-black text-slate-900">
                    ₹{item.price}
                  </span>

                  {/* Availability Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Click to toggle availability"
                  >
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Item Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chicken 65, Paneer Tikka"
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none ${
                    formErrors.name ? 'border-red-500' : 'border-slate-200 focus:border-red-600'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Food Type: Veg or Non-Veg */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Food Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, foodType: 'VEG', isVeg: true })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      formData.foodType === 'VEG'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FoodTypeBadge type="VEG" size="xs" />
                    <span>Vegetarian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, foodType: 'NON_VEG', isVeg: false })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      formData.foodType === 'NON_VEG'
                        ? 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FoodTypeBadge type="NON_VEG" size="xs" />
                    <span>Non-Vegetarian</span>
                  </button>
                </div>
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    {categories
                      .filter((c) => c.name !== 'All')
                      .map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border bg-white text-slate-900 focus:outline-none ${
                      formErrors.price ? 'border-red-500' : 'border-slate-200 focus:border-red-600'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.price}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Food Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, preparation style or portion notes..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Available in Stock</div>
                  <div className="text-[10px] text-slate-400">Can be ordered by cashiers and guests</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Delete &quot;{deletingItem.name}&quot;?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This item will be permanently removed from the menu catalog and POS screen.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
