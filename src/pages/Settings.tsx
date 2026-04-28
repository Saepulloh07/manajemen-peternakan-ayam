/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  RotateCcw, 
  MessageSquare, 
  Bell, 
  Smartphone,
  ChevronRight,
  Database,
  Users,
  Home,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import Swal from 'sweetalert2';
import { useHouse } from '../HouseContext';
import { useFlock } from '../FlockContext';
import { FlockBatch } from '../types';
import Modal from '../components/Modal';
import { Calendar, Hash, User, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('HOUSES');
  const { houses, addHouse } = useHouse();

  const handleAddHouse = async () => {
    const { value: name } = await Swal.fire({
      title: 'Tambah Kandang Baru',
      input: 'text',
      inputLabel: 'Nama Kandang',
      inputPlaceholder: 'Contoh: Kandang C',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
    });

    if (name) {
      addHouse(name);
      Swal.fire({
        title: 'Berhasil!',
        text: `Kandang ${name} telah ditambahkan.`,
        icon: 'success',
        confirmButtonColor: '#0f172a',
      });
    }
  };

  const handleExport = () => {
    Swal.fire({
      title: 'Export Data?',
      text: 'Seluruh registry akan dieksport ke format .csv',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Export Now',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Exporting...',
          text: 'Harap tunggu sebentar.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            setTimeout(() => {
              Swal.fire({
                title: 'Export Berhasil!',
                text: 'File telah diunduh.',
                icon: 'success',
                confirmButtonColor: '#0f172a',
              });
            }, 1500);
          }
        });
      }
    });
  };

  const sections = [
    { id: 'HOUSES', label: 'Manajemen Kandang', icon: Home },
    { id: 'FLOCKS', label: 'Manajemen Batch/Flock', icon: Hash },
    { id: 'PROFILE', label: 'Profil Farm', icon: Smartphone },
    { id: 'SECURITY', label: 'Keamanan & Role', icon: ShieldCheck },
    { id: 'NOTIF', label: 'Notifikasi (WA)', icon: MessageSquare },
    { id: 'DATA', label: 'Backup & Arsip', icon: Database },
  ];

  // --- Flock Management Logic ---
  const { flocks, addFlock, updateFlock, deleteFlock } = useFlock();
  const { selectedHouseId } = useHouse();
  const [isFlockModalOpen, setIsFlockModalOpen] = useState(false);
  const [editingFlock, setEditingFlock] = useState<FlockBatch | null>(null);

  const houseFlocks = flocks.filter(f => f.houseId === selectedHouseId);

  const calculateCurrentAge = (arrivalDate: string, arrivalAgeWeeks: number) => {
    const start = new Date(arrivalDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const totalDays = diffDays + (arrivalAgeWeeks * 7);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    
    return { weeks, days };
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-500 text-sm mt-1">Konfigurasi hak akses, notifikasi WhatsApp, dan cadangan data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border-r border-slate-100 pr-4 space-y-1.5">
            {sections.map((section) => (
                <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                        "w-full flex items-center justify-between p-4 rounded-sm transition-all",
                        activeSection === section.id 
                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <div className="flex items-center space-x-3">
                        <section.icon size={18} className={activeSection === section.id ? "text-amber-500" : "text-slate-400"} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{section.label}</span>
                    </div>
                </button>
            ))}
        </div>

        <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
                {activeSection === 'FLOCKS' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key="flocks"
                        className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm relative">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Flock & Cycle Control</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Kelola batch ayam, umur, dan populasi aktif.</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setEditingFlock(null);
                                        setIsFlockModalOpen(true);
                                    }}
                                    className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {houseFlocks.length === 0 && (
                                    <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada batch di kandang ini</p>
                                    </div>
                                )}
                                {houseFlocks.map((flock) => {
                                    const age = calculateCurrentAge(flock.arrivalDate, flock.arrivalAgeWeeks);
                                    return (
                                        <div key={flock.id} className={cn(
                                            "p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group",
                                            flock.isActive ? "bg-white border-amber-500 shadow-md ring-1 ring-amber-500/10" : "bg-slate-50 border-slate-100 opacity-70"
                                        )}>
                                            <div className="flex items-center space-x-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-sm flex flex-col items-center justify-center font-black italic",
                                                    flock.isActive ? "bg-amber-500 text-slate-900" : "bg-slate-200 text-slate-400"
                                                )}>
                                                    <span className="text-sm leading-none">{age.weeks}</span>
                                                    <span className="text-[7px] uppercase tracking-tighter">Minggu</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] font-black uppercase text-slate-900 tracking-tighter">{flock.strain}</p>
                                                        {flock.isActive && <span className="text-[7px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Aktif</span>}
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                        Datang: {new Date(flock.arrivalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} | Populasi: {flock.currentCount} Ekor
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <div className="text-right mr-4 hidden md:block">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">{age.weeks} Minggu {age.days} Hari</p>
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Umur Saat Ini</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setEditingFlock(flock);
                                                        setIsFlockModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Hapus Batch?',
                                                            text: 'Seluruh data batch ini akan dihapus permanen.',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#e11d48',
                                                            confirmButtonText: 'Ya, Hapus',
                                                            cancelButtonText: 'Batal'
                                                        }).then(result => {
                                                            if (result.isConfirmed) deleteFlock(flock.id);
                                                        });
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <Modal
                            isOpen={isFlockModalOpen}
                            onClose={() => setIsFlockModalOpen(false)}
                            title={editingFlock ? "Edit Batch/Flock" : "Tambah Batch Baru"}
                        >
                            <FlockForm 
                                houseId={selectedHouseId}
                                flock={editingFlock}
                                onSave={(data) => {
                                    if (editingFlock) {
                                        updateFlock(editingFlock.id, data);
                                    } else {
                                        addFlock(data);
                                    }
                                    setIsFlockModalOpen(false);
                                }}
                            />
                        </Modal>
                    </motion.div>
                )}

                {activeSection === 'HOUSES' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key="houses"
                        className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm relative">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Multi-House Management</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Konfigurasi dan pemisahan data antar kandang.</p>
                                </div>
                                <button 
                                    onClick={handleAddHouse}
                                    className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {houses.map((house) => (
                                    <div key={house.id} className="p-6 bg-slate-50 border border-slate-100 hover:border-amber-500 transition-all flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 group-hover:text-amber-500">
                                                <Home size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase text-slate-900 tracking-tighter">{house.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{house.location || 'Section Default'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900" />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="p-4 bg-amber-50 border border-amber-100 flex items-center space-x-3">
                                    <ShieldCheck size={16} className="text-amber-600" />
                                    <p className="text-[9px] text-amber-800 font-bold uppercase tracking-widest leading-relaxed">
                                        Data produksi, stok, dan keuangan dipisahkan secara otomatis berdasarkan Kandang yang aktif dipilih di top bar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'DATA' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key="data"
                        className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
                            <div className="flex items-center space-x-6">
                                <div className="p-4 bg-slate-50 border border-slate-100 text-slate-500">
                                    <RotateCcw size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Registry Integrity & Backup</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Archive snapshot of production cycle (24 Months Cycle).</p>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner">
                                <div className="flex items-center space-x-4">
                                    <Database size={20} className="text-amber-600" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Main Archive Node</p>
                                        <p className="text-[9px] text-slate-400 font-black italic uppercase tracking-tighter">Last Snapshot: 1 hour ago</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleExport}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 shadow-md border border-slate-800 transition-colors"
                                >
                                    Export SQL/CSV
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest italic">
                                    * Eggly provides automated daily cloud redundancy. Manual archiving is recommended at the end of each bird strain cycle.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'NOTIF' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key="notif"
                        className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm space-y-8 relative">
                            <div className="flex items-center space-x-6">
                                <div className="p-4 bg-slate-50 border border-slate-100 text-slate-500">
                                    <MessageSquare size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">WhatsApp Integration Node</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Configure operational alerts and HDP summary broadcast.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Stock Criticality Alert</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter italic mt-0.5">Broadcast when inventory drops below RE-ORDER point.</p>
                                    </div>
                                    <div className="bg-amber-500 w-10 h-5 rounded-sm relative shadow-sm border border-amber-600 cursor-pointer">
                                        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-sm shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 opacity-60">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">HDP Performance Digest</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter italic mt-0.5">Automated morning production snapshot (09:00 WIB).</p>
                                    </div>
                                    <div className="bg-slate-200 w-10 h-5 rounded-sm relative border border-slate-300">
                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-sm shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'SECURITY' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key="security"
                        className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 transform rotate-45 translate-x-12 -translate-y-12 border-b border-l border-slate-100"></div>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">RBAC Control Panel</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Manage user roles and permission inheritance.</p>
                                </div>
                                <button className="text-slate-300 hover:text-slate-900 transition-colors"><Users size={20} /></button>
                            </div>
                            
                            <div className="space-y-3">
                                {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WORKER].map((role) => (
                                    <div key={role} className="flex items-center justify-between p-4 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer group">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-1.5 h-6 bg-slate-900 group-hover:bg-amber-500 transition-colors" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">{role.replace('_', ' ')}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic mt-0.5">
                                                    {role === UserRole.WORKER ? "Production Input Layer Only" : "Full Financial & Audit Access"}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface FlockFormProps {
    houseId: string;
    flock: FlockBatch | null;
    onSave: (data: Omit<FlockBatch, 'id'>) => void;
}

function FlockForm({ houseId, flock, onSave }: FlockFormProps) {
    const [strain, setStrain] = useState(flock?.strain || '');
    const [arrivalDate, setArrivalDate] = useState(flock?.arrivalDate || new Date().toISOString().split('T')[0]);
    const [arrivalAgeWeeks, setArrivalAgeWeeks] = useState(flock?.arrivalAgeWeeks || 0);
    const [initialCount, setInitialCount] = useState(flock?.initialCount || 0);
    const [isActive, setIsActive] = useState(flock?.isActive ?? true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            houseId,
            strain,
            arrivalDate,
            arrivalAgeWeeks,
            initialCount,
            currentCount: flock?.currentCount || initialCount,
            isActive
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Strain / Jenis Ayam</label>
                    <input
                        type="text"
                        required
                        value={strain}
                        onChange={(e) => setStrain(e.target.value)}
                        placeholder="Contoh: Isa Brown, Lohmann, Hisex"
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Tanggal Datang</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            required
                            value={arrivalDate}
                            onChange={(e) => setArrivalDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-12 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                        />
                    </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Umur Saat Datang (Mg)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        value={arrivalAgeWeeks}
                        onChange={(e) => setArrivalAgeWeeks(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Populasi Awal (Ekor)</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="number"
                            required
                            min="1"
                            value={initialCount}
                            onChange={(e) => setInitialCount(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-12 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                        />
                    </div>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-end">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 border border-slate-100 w-full hover:bg-slate-100 transition-colors">
                        <div className={cn(
                            "w-5 h-5 rounded-sm border flex items-center justify-center transition-all",
                            isActive ? "bg-amber-500 border-amber-600 shadow-inner" : "bg-white border-slate-200"
                        )}>
                            {isActive && <CheckCircle2 size={14} className="text-white" />}
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Batch Aktif</span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg"
            >
                Simpan Konfigurasi Batch
            </button>
        </form>
    );
}
