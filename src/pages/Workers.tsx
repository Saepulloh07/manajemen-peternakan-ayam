/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  DollarSign, 
  FileText, 
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  Briefcase,
  Settings,
  Save
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

export default function Workers() {
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Daftarkan Personel?',
      text: 'Data karyawan baru akan disimpan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Ya, Daftar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Berhasil!', text: 'Personel telah didaftarkan.', icon: 'success', confirmButtonColor: '#0f172a' });
        setIsWorkerModalOpen(false);
      }
    });
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Update Model Borongan?',
      text: 'Aturan upah baru akan diberlakukan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Ya, Update',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Berhasil!', text: 'Model upah telah diperbarui.', icon: 'success', confirmButtonColor: '#0f172a' });
        setIsRateModalOpen(false);
      }
    });
  };
  const workers = [
    { id: '1', name: 'Budi Santoso', role: UserRole.WORKER, performance: 98, baseSalary: 3500000, pieceRateTotal: 450000 },
    { id: '2', name: 'Agus Salim', role: UserRole.WORKER, performance: 92, baseSalary: 3500000, pieceRateTotal: 280000 },
    { id: '3', name: 'Siti Aminah', role: UserRole.ADMIN, performance: 100, baseSalary: 5500000, pieceRateTotal: 0 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SDM & Penggajian</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data karyawan dan rincian gaji (reguler + borongan).</p>
        </div>
        <button 
            onClick={() => setIsWorkerModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center space-x-2 border border-slate-800 group"
        >
            <Plus size={16} className="group-hover:text-amber-500 transition-colors" />
            <span>Tambah Personel Baru</span>
        </button>
      </div>

      <Modal 
        isOpen={isWorkerModalOpen} 
        onClose={() => setIsWorkerModalOpen(false)} 
        title="Pendaftaran Personel Baru"
      >
        <form onSubmit={handleAddWorker} className="space-y-6">
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Lengkap</label>
                <input type="text" placeholder="Contoh: Ahmad Subarjo" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Role / Jabatan</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                        <option value={UserRole.WORKER}>KANDANG (WORKER)</option>
                        <option value={UserRole.ADMIN}>ADMINISTRASI</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Gaji Pokok (IDR)</label>
                    <input type="number" placeholder="3500000" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 font-mono" />
                </div>
            </div>
            <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl group">
                    <Save size={16} className="group-hover:text-amber-500 transition-colors" />
                    <span>Daftarkan ke Sistem</span>
                </button>
            </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-700">Manpower Registry</h3>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{workers.length} Active Personnel</div>
                </div>
                <div className="divide-y divide-slate-50">
                    {workers.map((worker) => (
                        <div key={worker.id} className="p-6 hover:bg-slate-50 transition-colors group flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-sm bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase text-sm group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-200 group-hover:border-slate-800">
                                    {worker.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate uppercase tracking-tight italic">{worker.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">{worker.role.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 md:space-x-12">
                                <div className="hidden md:block">
                                    <div className="flex items-center space-x-1 text-slate-400 mb-2">
                                        <Award size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Performance Score</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={cn("h-full", worker.performance >= 95 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${worker.performance}%` }} />
                                        </div>
                                        <span className="text-xs font-black text-slate-800 italic underline decoration-slate-200">{worker.performance}%</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 italic">{formatCurrency(worker.baseSalary + worker.pieceRateTotal)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Curr. Month Accum.</p>
                                </div>
                                
                                <button className="text-slate-300 group-hover:text-amber-500 transition-colors border border-transparent hover:border-slate-200 p-1">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 transform rotate-45 translate-x-12 -translate-y-12"></div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-widest">Piece-Rate Models</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-black mt-1">Sistem Upah Borongan / Performance Base</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 border border-slate-100 space-y-4 hover:border-emerald-500/50 transition-colors relative">
                        <div className="flex justify-between items-start">
                            <div className="bg-white p-3 border border-slate-200 shadow-sm">
                                <Briefcase className="text-slate-500" size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Model Alpha</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 uppercase tracking-tight italic">Upah Prod. Giling</h4>
                            <p className="text-xs font-black italic text-emerald-600 mt-1">{formatCurrency(7000)} <span className="text-slate-400 text-[10px] font-normal uppercase not-italic">/ Sak pakan (50kg)</span></p>
                        </div>
                        <div className="absolute top-0 right-0 p-2 text-slate-200 hover:text-slate-900 cursor-pointer"><Settings size={14} /></div>
                    </div>

                    <button 
                        onClick={() => setIsRateModalOpen(true)}
                        className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all group"
                    >
                        <Plus size={24} strokeWidth={1.5} className="group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">Add Custom Payroll Rate</span>
                    </button>

                    <Modal 
                        isOpen={isRateModalOpen} 
                        onClose={() => setIsRateModalOpen(false)} 
                        title="Model Upah Borongan"
                    >
                        <form onSubmit={handleAddRate} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Pekerjaan Borongan</label>
                                <input type="text" placeholder="Contoh: Sortir Telur Grade B" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Tarif per Satuan</label>
                                    <input type="number" placeholder="5000" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Satuan</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                                        <option>SAK (50KG)</option>
                                        <option>TRE / PAPAN</option>
                                        <option>EKOR</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl group">
                                    <Plus size={16} className="group-hover:text-amber-500 transition-colors" />
                                    <span>Aktifkan Model Tarif</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform translate-x-12 -translate-y-8">
                    <DollarSign size={160} />
                </div>
                <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.25em] mb-8">Total Monthly Liability</h3>
                <div className="space-y-6">
                    <div>
                        <p className="text-3xl font-black italic tracking-tighter text-white">
                            {formatCurrency(13250000)}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">Accrued Payroll (Current Cycle)</p>
                    </div>
                </div>
                <button className="mt-12 w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-sm border border-slate-700 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative overflow-hidden group">
                    <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-[90%] transition-transform opacity-10"></div>
                    Generate E-Slip Gaji
                </button>
            </div>

            <div className="bg-white p-6 border border-slate-200 border-l-4 border-l-amber-500 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-amber-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Strategic Insight</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-bold italic uppercase tracking-tight">
                    "Budi Santoso mencapai target produksi HDP 95% secara konsisten. Disarankan pemberian bonus insentif borongan."
                </p>
                <div className="pt-2">
                    <button className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 underline underline-offset-4 decoration-2">Apply Bonus Model</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
