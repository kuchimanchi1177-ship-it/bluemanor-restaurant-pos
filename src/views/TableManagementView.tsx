"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RestaurantTable, TableSection, TableStatus } from '@/types';
import { formatINR } from '@/utils/formatters';
import {
  Layers,
  Plus,
  Users,
  Utensils,
  Receipt,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function TableManagementView() {
  const {
    tables,
    waiters,
    updateTable,
    assignWaiterToTable,
    setTableStatus,
    addTable,
    deleteTable,
    startPOSForTable,
  } = useApp();

  const [selectedSection, setSelectedSection] = useState<TableSection | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | 'All'>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState({
    tableNumber: 'T-13',
    capacity: 4,
    section: 'Indoor AC' as TableSection,
    status: 'Available' as TableStatus,
    assignedWaiterName: 'Rahul Sharma',
  });

  // Table summary counts
  const summaryCounts = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'Available').length,
    occupied: tables.filter((t) => t.status === 'Occupied').length,
    billed: tables.filter((t) => t.status === 'Billed').length,
    reserved: tables.filter((t) => t.status === 'Reserved').length,
  };

  const filteredTables = tables.filter((t) => {
    if (selectedSection !== 'All' && t.section !== selectedSection) return false;
    if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: `T-${tables.length + 1 < 10 ? '0' : ''}${tables.length + 1}`,
      capacity: 4,
      section: 'Indoor AC',
      status: 'Available',
      assignedWaiterName: waiters[0]?.name || 'Rahul Sharma',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      section: table.section,
      status: table.status,
      assignedWaiterName: table.assignedWaiterName || 'Rahul Sharma',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      updateTable({
        ...editingTable,
        ...formData,
      });
    } else {
      addTable(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Tables
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{summaryCounts.total}</div>
          <span className="text-[10px] text-slate-400">All Sections</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available
          </span>
          <div className="text-2xl font-black text-emerald-950 mt-1">{summaryCounts.available}</div>
          <span className="text-[10px] text-emerald-700">Ready for Seating</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Occupied
          </span>
          <div className="text-2xl font-black text-rose-950 mt-1">{summaryCounts.occupied}</div>
          <span className="text-[10px] text-rose-700">Dining In Progress</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Billed
          </span>
          <div className="text-2xl font-black text-amber-950 mt-1">{summaryCounts.billed}</div>
          <span className="text-[10px] text-amber-700">Settling Payment</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-purple-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Reserved
          </span>
          <div className="text-2xl font-black text-purple-950 mt-1">{summaryCounts.reserved}</div>
          <span className="text-[10px] text-purple-700">Advance Bookings</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Section Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Indoor AC', 'Outdoor Lawn', 'First Floor', 'Family Hall'] as const).map(
            (sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedSection === sec
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec === 'All' ? 'All Sections' : sec}
              </button>
            )
          )}
        </div>

        {/* Status Dropdown & Add Button */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">🟢 Available</option>
            <option value="Occupied">🔴 Occupied</option>
            <option value="Billed">🟡 Billed</option>
            <option value="Reserved">🟣 Reserved</option>
          </select>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isAvail = table.status === 'Available';
          const isOccupied = table.status === 'Occupied';
          const isBilled = table.status === 'Billed';
          const isReserved = table.status === 'Reserved';

          return (
            <div
              key={table.id}
              className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'border-rose-300 ring-2 ring-rose-500/10'
                  : isBilled
                  ? 'border-amber-300 ring-2 ring-amber-500/10'
                  : isReserved
                  ? 'border-purple-300'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-black text-base flex items-center justify-center shadow-xs">
                      {table.tableNumber}
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        {table.section}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        🪑 {table.capacity} Seater
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isAvail
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isOccupied
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : isBilled
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {table.status}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(table)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                      title="Edit Table"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Assigned Waiter & Reassignment */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                    <span>Assigned Server</span>
                    <Users className="w-3 h-3 text-slate-400" />
                  </div>

                  <select
                    value={table.assignedWaiterName || 'Rahul Sharma'}
                    onChange={(e) => assignWaiterToTable(table.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    {waiters.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name} ({w.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Order details if occupied or billed */}
                {(isOccupied || isBilled) && (
                  <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80 text-xs mb-3 space-y-1">
                    <div className="flex justify-between font-mono text-[11px] text-rose-900 font-bold">
                      <span>{table.currentOrderId || 'ORD-1043'}</span>
                      <span>{formatINR(table.currentBillAmount || 483)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Seated Duration:</span>
                      <span className="font-semibold text-slate-700">{table.occupiedSince || '20m ago'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {isAvail && (
                  <button
                    type="button"
                    onClick={() => startPOSForTable(table.tableNumber)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>Take Order (POS)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                )}

                {isOccupied && (
                  <div className="w-full flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startPOSForTable(table.tableNumber)}
                      className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                    >
                      + Add Dishes
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableStatus(table.id, 'Available')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition"
                      title="Clear & Free Table"
                    >
                      Free
                    </button>
                  </div>
                )}

                {isBilled && (
                  <button
                    type="button"
                    onClick={() => setTableStatus(table.id, 'Available')}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Clear & Make Available</span>
                  </button>
                )}

                {isReserved && (
                  <button
                    type="button"
                    onClick={() => setTableStatus(table.id, 'Occupied')}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
                  >
                    Seat Reserved Guests
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              {editingTable ? 'Edit Table Configuration' : 'Add New Dining Table'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure table number, seating capacity, and floor section.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    placeholder="e.g. T-14"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seating Capacity
                  </label>
                  <select
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-900 bg-white"
                  >
                    <option value={2}>2 Guests (Cozy)</option>
                    <option value={4}>4 Guests (Standard)</option>
                    <option value={6}>6 Guests (Family)</option>
                    <option value={8}>8 Guests (Large Group)</option>
                    <option value={10}>10+ Guests (Party)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-900 bg-white"
                  >
                    <option value="Indoor AC">Indoor AC</option>
                    <option value="Outdoor Lawn">Outdoor Lawn</option>
                    <option value="First Floor">First Floor</option>
                    <option value="Family Hall">Family Hall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-900 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Billed">Billed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Assigned Waiter
                </label>
                <select
                  value={formData.assignedWaiterName}
                  onChange={(e) => setFormData({ ...formData, assignedWaiterName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-900 bg-white"
                >
                  {waiters.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                {editingTable ? (
                  <button
                    type="button"
                    onClick={() => {
                      deleteTable(editingTable.id);
                      setIsModalOpen(false);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Delete Table
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                  >
                    {editingTable ? 'Save Table' : 'Create Table'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
