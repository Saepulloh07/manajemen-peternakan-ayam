/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Clock,
  Settings,
  Save,
  Upload,
  FileText
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

import { useHouse } from '../HouseContext';
import { useGlobalData } from '../GlobalContext';

export default function Inventory() {
  const { activeHouse } = useHouse();
  const { inventory, updateInventory, addInventoryItem, addTransaction, transactions, productionLogs } = useGlobalData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ id: '', name: '', quantity: 0, unit: 'kg', price: 0 });

  const stockItems = inventory;

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.quantity <= 0) {
      Swal.fire({
        title: 'Input Invalid',
        text: 'Mohon isi nama barang dan jumlah yang valid.',
        icon: 'warning',
        confirmButtonColor: '#0f172a',
      });
      return;
    }

    Swal.fire({
      title: 'Konfirmasi Stok',
      text: `Tambah ${newItem.quantity} ${newItem.unit} ${newItem.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Ya, Tambah',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Update Inventory
        const targetItem = inventory.find(i => i.name.toLowerCase() === newItem.name.toLowerCase());
        if (targetItem) {
            updateInventory(targetItem.id, newItem.quantity);
        } else {
            addInventoryItem({
                name: newItem.name,
                stock: newItem.quantity,
                unit: newItem.unit,
                minStock: 100 // Default min stock
            });
        }

        // Add Financial Transaction
        if (newItem.price > 0) {
            addTransaction({
                date: new Date().toISOString().split('T')[0],
                description: `Pembelian Stok: ${newItem.name}`,
                qty: `${newItem.quantity} ${newItem.unit}`,
                price: newItem.price,
                total: newItem.quantity * newItem.price,
                account: 'Kas Tunai',
                type: 'EXPENSE'
            });
        }

        Swal.fire({
          title: 'Stok Ditambahkan!',
          icon: 'success',
          confirmButtonColor: '#0f172a',
        });
        setIsModalOpen(false);
        setNewItem({ id: '', name: '', quantity: 0, unit: 'kg', price: 0 });
      }
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stok Pakan & Logistik</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor stok porsi harian dan jadwal pengiriman luar kota.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Tambah Stok Baru</span>
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Input Stok Logistik"
      >
        <form onSubmit={handleAddStock} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Barang / SKU</label>
            <input 
              type="text"
              placeholder="Contoh: Jagung Giling"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Jumlah</label>
              <input 
                type="number"
                placeholder="0"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Satuan</label>
              <select 
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all"
              >
                <option value="kg">KILOGRAM (KG)</option>
                <option value="sak">SAK (50KG)</option>
                <option value="liter">LITER</option>
                <option value="btl">BOTOL</option>
              </select>
            </div>
            <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Harga Satuan (Est.)</label>
                <input 
                    type="number"
                    placeholder="0"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all font-mono"
                />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Unggah Faktur / Bukti Bayar</label>
            <div className="relative border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-white transition-all group cursor-pointer">
                <Upload size={24} className="text-slate-300 group-hover:text-amber-500 transition-colors mb-2" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Klik atau drag file ke sini</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl group"
            >
              <Save size={16} className="group-hover:text-amber-500 transition-colors" />
              <span>Simpan ke Database</span>
            </button>
          </div>
        </form>
      </Modal>

      {stockItems.some(i => i.quantity <= i.minStock) && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-between px-6 py-4"
        >
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-100 rounded-sm border border-amber-200">
                    <AlertCircle className="text-amber-600" size={24} />
                </div>
                <div>
                    <h4 className="text-amber-900 font-bold text-sm uppercase tracking-tight">Critical Warning: Stock Level</h4>
                    <p className="text-slate-600 text-xs mt-0.5">Jagung/Konsentrat menipis. Estimasi lead time Payakumbuh: 3-5 hari. Order diperlukan hari ini.</p>
                </div>
            </div>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                Order Online
            </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stockItems.map((item) => (
                    <div key={item.id} className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-56">
                        <div className={cn(
                            "absolute top-0 right-0 w-1.5 h-full",
                            item.quantity <= item.minStock ? "bg-amber-500" : "bg-slate-100"
                        )} />
                        
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-50 border border-slate-100 shadow-inner">
                                    <Package size={24} className="text-slate-500" />
                                </div>
                                <div className="flex items-center space-x-1 text-slate-400">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{item.leadTime}</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 text-base uppercase tracking-tight">{item.name}</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{activeHouse?.name} / SKU: {item.id}</p>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="flex items-baseline space-x-2">
                                <span className={cn(
                                    "text-4xl font-black italic tracking-tighter",
                                    item.stock <= item.minStock ? "text-amber-600" : "text-slate-900"
                                )}>
                                    {item.stock}
                                </span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase">{item.unit}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditingItem(item);
                                    setIsEditModalOpen(true);
                                }}
                                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-700">Stock Velocity & Logs</h3>
                    <div className="flex space-x-2">
                        <button className="p-2 bg-white border border-slate-200 text-slate-400"><ArrowDownCircle size={18} /></button>
                        <button className="p-2 bg-white border border-slate-200 text-slate-400"><ArrowUpCircle size={18} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 uppercase">
                                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400">Inventory Item</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400">Variance</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400">Final Bal.</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-slate-400">Authorized By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.filter(t => t.type === 'EXPENSE').slice(-5).reverse().map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-tight">{tx.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-rose-600 font-bold text-sm italic">-{tx.qty}</span>
                                        <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Purchased</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-900 font-mono">{formatCurrency(tx.total)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{tx.account}</td>
                                </tr>
                            ))}
                            {productionLogs.filter(p => p.houseId === activeHouse?.id).slice(-3).reverse().map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors bg-slate-50/30">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-tight italic">Daily Feed Usage</td>
                                    <td className="px-6 py-4">
                                        <span className="text-rose-400 font-bold text-sm italic">-{log.feedConsumed} kg</span>
                                        <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Consumed</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400 font-mono">Internal</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">Auto-Logged</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform translate-x-12 -translate-y-8">
                    <Package size={160} />
                </div>
                <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.25em] mb-8">Efficiency Analytics</h3>
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                             <p className="text-3xl font-black italic tracking-tighter">
                                {productionLogs.length > 0 ? (productionLogs[productionLogs.length - 1].feedConsumed / 10).toFixed(1) : 0}g
                             </p>
                             <span className="text-[10px] font-bold text-emerald-500">OPTIMAL</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cons. vs Target /Bird</p>
                        <div className="w-full h-1.5 bg-slate-800 mt-4 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '82%' }}
                                className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                            />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-black italic tracking-tighter">
                            {(() => {
                                const houseLogs = productionLogs.filter(p => p.houseId === activeHouse?.id);
                                const totalFeed = houseLogs.reduce((a, b) => a + b.feedConsumed, 0);
                                const totalEggs = houseLogs.reduce((a, b) => a + b.totalKg, 0);
                                return totalEggs > 0 ? (totalFeed / totalEggs).toFixed(2) : '0.00';
                            })()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">FCR (Feed Conversion Ratio)</p>
                        <div className="p-3 bg-slate-800/50 border border-slate-800 mt-4">
                            <p className="text-[9px] text-slate-500 italic leading-relaxed uppercase tracking-tighter font-medium">Real-time FCR based on {productionLogs.filter(p => p.houseId === activeHouse?.id).length} log entries.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Inventory Item"
      >
        <div className="space-y-6">
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Item</label>
                <input 
                    type="text"
                    value={editingItem?.name || ''}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                />
            </div>
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Stok Saat Ini ({editingItem?.unit})</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="number"
                        value={editingItem?.stock || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button 
                        onClick={() => {
                            updateInventory(editingItem.id, editingItem.stock - inventory.find((i: any) => i.id === editingItem.id)!.stock);
                            setIsEditModalOpen(false);
                            Swal.fire({ title: 'Berhasil', text: 'Stok telah diperbarui secara manual.', icon: 'success' });
                        }}
                        className="bg-slate-900 text-white px-6 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                    >
                        Update
                    </button>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 italic">* Gunakan ini hanya untuk koreksi stok manual (opname).</p>
            </div>
        </div>
      </Modal>
    </div>
  );
}
