"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Waiter } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Phone,
  Layers,
  AlertTriangle,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

/**
 * Extracts 1-2 uppercase letters from waiter's name for fallback avatar.
 */
function getInitials(name: string): string {
  if (!name) return 'W';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'W';
  if (parts.length === 1) {
    return clean.substring(0, Math.min(2, clean.length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Checks whether a string is a valid web image URL.
 */
function isImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  );
}

interface WaiterAvatarProps {
  name: string;
  avatar?: string;
  size?: 'md' | 'lg';
}

/**
 * Renders waiter profile image with object-fit: cover, rounded corners,
 * and graceful fallback to initials badge if URL is missing or fails to load.
 */
function WaiterAvatar({ name, avatar, size = 'md' }: WaiterAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const hasUrl = isImageUrl(avatar);

  // Reset error state if avatar prop updates
  useEffect(() => {
    setImgError(false);
  }, [avatar]);

  const dimensionClasses = size === 'lg' ? 'w-14 h-14 text-base' : 'w-12 h-12 text-sm';

  return (
    <div
      className={`${dimensionClasses} rounded-xl overflow-hidden shrink-0 bg-rose-50 text-rose-700 border border-rose-200/70 flex items-center justify-center font-extrabold tracking-wide select-none shadow-2xs relative`}
    >
      {hasUrl && !imgError ? (
        <img
          src={avatar}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      ) : (
        <span className="uppercase">{initials}</span>
      )}
    </div>
  );
}

export default function WaitersView() {
  const { waiters, addWaiter, updateWaiter, deleteWaiter } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<'On Duty' | 'Off Duty'>('On Duty');
  const [assignedTables, setAssignedTables] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deletingWaiter, setDeletingWaiter] = useState<Waiter | null>(null);

  const allTablesList = [
    'T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06',
    'T-07', 'T-08', 'T-09', 'T-10', 'T-11', 'T-12',
  ];

  const handleOpenAdd = () => {
    setEditingWaiter(null);
    setName('');
    setPhone('+91 ');
    setAvatar('');
    setStatus('On Duty');
    setAssignedTables([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (waiter: Waiter) => {
    setEditingWaiter(waiter);
    setName(waiter.name);
    setPhone(waiter.phone);
    setAvatar(isImageUrl(waiter.avatar) ? (waiter.avatar || '') : '');
    setStatus(waiter.status || 'On Duty');
    setAssignedTables(waiter.assignedTables || []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = (waiter: Waiter) => {
    const nextStatus = waiter.status === 'On Duty' ? 'Off Duty' : 'On Duty';
    updateWaiter({
      ...waiter,
      status: nextStatus,
    });
  };

  const toggleTableAssignment = (tableNum: string) => {
    if (assignedTables.includes(tableNum)) {
      setAssignedTables(assignedTables.filter((t) => t !== tableNum));
    } else {
      setAssignedTables([...assignedTables, tableNum]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Waiter name is required');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setFormError('Valid contact phone is required');
      return;
    }

    const cleanAvatar = avatar.trim() || undefined;

    if (editingWaiter) {
      updateWaiter({
        ...editingWaiter,
        name: name.trim(),
        phone: phone.trim(),
        status,
        assignedTables,
        avatar: cleanAvatar,
      });
    } else {
      addWaiter({
        name: name.trim(),
        phone: phone.trim(),
        pin: '1234',
        status,
        assignedTables,
        avatar: cleanAvatar,
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingWaiter) {
      deleteWaiter(deletingWaiter.id);
      setDeletingWaiter(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Waiters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage floor servers, contact info, and assigned dining tables
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Waiter</span>
        </button>
      </div>

      {/* Compact Waiter Cards Grid */}
      {waiters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <p className="text-sm font-bold text-slate-700">No waiters registered</p>
          <p className="text-xs text-slate-400 mt-1">Add your floor servers and assign their tables.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition cursor-pointer"
          >
            + Add Waiter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {waiters.map((waiter) => {
            const tables = waiter.assignedTables || [];

            return (
              <div
                key={waiter.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name, Phone, and On/Off Duty Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <WaiterAvatar name={waiter.name} avatar={waiter.avatar} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-base leading-tight truncate" title={waiter.name}>
                          {waiter.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{waiter.phone}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(waiter)}
                      className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                        waiter.status === 'On Duty'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70'
                      }`}
                      title="Click to toggle status"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          waiter.status === 'On Duty' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{waiter.status}</span>
                    </button>
                  </div>

                  {/* Assigned Tables */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Assigned Tables:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {tables.length} {tables.length === 1 ? 'table' : 'tables'}
                      </span>
                    </div>

                    {tables.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No tables assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {tables.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Edit & Delete */}
                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {waiter.totalOrders ? `${waiter.totalOrders} orders served` : 'Active floor staff'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(waiter)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                      title="Edit Waiter Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingWaiter(waiter)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                      title="Remove Waiter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Waiter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <WaiterAvatar name={name || 'Waiter'} avatar={avatar} size="lg" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingWaiter ? 'Edit Waiter' : 'Add New Waiter'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingWaiter ? 'Update profile and assigned tables' : 'Register new floor staff member'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Waiter Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Waiter Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError('');
                  }}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFormError('');
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Profile Photo / Avatar URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Profile Photo URL (optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave blank for initials"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-red-600"
                  />
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave empty to use initials fallback avatar.
                </p>
              </div>

              {/* Duty Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duty Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('On Duty')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === 'On Duty'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>On Duty</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Off Duty')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === 'Off Duty'
                        ? 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Off Duty</span>
                  </button>
                </div>
              </div>

              {/* Assigned Tables */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Dining Tables
                </label>
                <p className="text-[10px] text-slate-400 mb-2">
                  Click tables to assign or unassign this staff member:
                </p>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1">
                  {allTablesList.map((t) => {
                    const isAssigned = assignedTables.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTableAssignment(t)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center justify-center gap-1 ${
                          isAssigned
                            ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isAssigned && <Check className="w-3 h-3 text-red-600" />}
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
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
                  Save Waiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Remove {deletingWaiter.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this staff member from the waiter roster?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWaiter(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
