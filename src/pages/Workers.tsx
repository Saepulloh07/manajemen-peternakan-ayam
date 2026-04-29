import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  DollarSign, 
  Award,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Settings,
  Save,
  Shield,
  User as UserIcon,
  Wrench
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { UserRole, User } from '../types';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';
import { useApp } from '../AppContext';
import { useGlobalData } from '../GlobalContext';
import { generateSalarySlip } from '../lib/pdfGenerator';

export default function Workers() {
  const { user: currentUser, users, addUser, updateUser } = useApp();
  const { addTransaction } = useGlobalData();
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);
  const [borongan, setBorongan] = useState({
    pupuk: 0,
    karung: 0,
    lainnya: 0
  });

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const role = formData.get('role') as UserRole;
    const salary = Number(formData.get('salary'));
    const email = formData.get('email') as string;

    if (!name || !email) return;

    addUser({
      name,
      username: email.split('@')[0],
      role,
      email,
      password: 'password123',
      salary,
      assignedHouses: []
    });

    Swal.fire({ 
      title: 'Berhasil!', 
      text: 'Personel telah didaftarkan.', 
      icon: 'success', 
      confirmButtonColor: '#0f172a' 
    });
    setIsWorkerModalOpen(false);
  };

  const handleUpdateSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const salary = Number(formData.get('salary'));

    updateUser(selectedWorker.id, { salary });

    Swal.fire({ 
      title: 'Berhasil!', 
      text: 'Gaji pokok telah diperbarui.', 
      icon: 'success', 
      confirmButtonColor: '#0f172a' 
    });
    setIsSalaryModalOpen(false);
  };

  const handleDownloadSlip = () => {
    if (!selectedWorker) return;
    
    const baseSalary = selectedWorker.salary || 0;
    const items = [
      { label: 'Penjualan Pupuk', amount: borongan.pupuk },
      { label: 'Penjualan Karung', amount: borongan.karung },
      { label: 'Lain-lain / Bonus', amount: borongan.lainnya }
    ];
    
    const total = baseSalary + borongan.pupuk + borongan.karung + borongan.lainnya;

    // Record to financial report
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: `Gaji & Borongan: ${selectedWorker.name}`,
      qty: '1 Org',
      price: total,
      total: total,
      account: 'Kas Tunai',
      type: 'EXPENSE',
      category: 'Payroll'
    });

    generateSalarySlip({
      workerName: selectedWorker.name,
      role: selectedWorker.role,
      baseSalary: baseSalary,
      boronganItems: items.filter(i => i.amount > 0),
      totalSalary: total,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });
  };

  // Include both ADMIN and WORKER
  const displayedWorkers = users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.WORKER);

  const ROLE_ICON: Record<UserRole, any> = {
    [UserRole.SUPER_ADMIN]: Shield,
    [UserRole.ADMIN]: UserIcon,
    [UserRole.WORKER]: Wrench,
  };

  const totalMonthlyLiability = displayedWorkers.reduce((acc, w) => acc + (w.salary || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Manpower & Payroll</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pengelolaan personil farm dan rincian kompensasi.</p>
        </div>
        {currentUser?.role === UserRole.SUPER_ADMIN && (
          <button 
              onClick={() => setIsWorkerModalOpen(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center space-x-2 border border-slate-800 group"
          >
              <Plus size={16} className="group-hover:text-amber-500 transition-colors" />
              <span>Daftarkan Personel</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-700 italic">Personnel Registry</h3>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{displayedWorkers.length} Active Personnel</div>
                </div>
                <div className="divide-y divide-slate-50">
                    {displayedWorkers.map((worker) => {
                      const Icon = ROLE_ICON[worker.role] || UserIcon;
                      return (
                        <div 
                          key={worker.id} 
                          className="p-6 hover:bg-slate-50 transition-colors group flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            if (currentUser?.role === UserRole.SUPER_ADMIN) {
                              setSelectedWorker(worker);
                              setBorongan({ pupuk: 0, karung: 0, lainnya: 0 }); // Reset for new selection
                              setIsSalaryModalOpen(true);
                            }
                          }}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all border border-slate-200 group-hover:border-slate-800">
                                    <Icon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate uppercase tracking-tight italic">{worker.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">{worker.role.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 md:space-x-12">
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 italic">{formatCurrency(worker.salary || 0)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Monthly Salary</p>
                                </div>
                                
                                <button className="text-slate-200 group-hover:text-amber-500 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                      );
                    })}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform translate-x-12 -translate-y-8">
                    <DollarSign size={160} />
                </div>
                <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.25em] mb-8">Monthly Salary Liability</h3>
                <div className="space-y-6">
                    <div>
                        <p className="text-3xl font-black italic tracking-tighter text-white">
                            {formatCurrency(totalMonthlyLiability)}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6 italic">Total Pengeluaran Gaji Bulanan</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 border border-slate-200 border-l-4 border-l-amber-500 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-amber-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Owner Insight</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-bold italic uppercase tracking-tight">
                    "Data personil kini mencakup Admin dan Anak Kandang. Klik pada nama personil untuk mengatur rincian gaji dan cetak slip gaji borongan."
                </p>
            </div>
        </div>
      </div>

      {/* Modal Tambah Personel */}
      <Modal 
        isOpen={isWorkerModalOpen} 
        onClose={() => setIsWorkerModalOpen(false)} 
        title="Daftarkan Personel Baru"
      >
        <form onSubmit={handleAddWorker} className="space-y-6">
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Lengkap</label>
                <input name="name" required type="text" placeholder="Ahmad Subarjo" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-bold" />
            </div>
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Email / Username</label>
                <input name="email" required type="email" placeholder="ahmad@farm.com" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Role / Jabatan</label>
                    <select name="role" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                        <option value={UserRole.WORKER}>ANAK KANDANG</option>
                        <option value={UserRole.ADMIN}>ADMIN GUDANG</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Gaji Pokok (IDR)</label>
                    <input name="salary" required type="number" defaultValue={3500000} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 font-mono" />
                </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-slate-800 transition-all shadow-xl">
                Daftarkan ke Sistem
            </button>
        </form>
      </Modal>

      {/* Modal Update Gaji & Borongan */}
      <Modal 
        isOpen={isSalaryModalOpen} 
        onClose={() => setIsSalaryModalOpen(false)} 
        title={`Rincian Gaji: ${selectedWorker?.name}`}
        className="max-w-xl"
      >
        <div className="space-y-8">
            <form onSubmit={handleUpdateSalary} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 italic border-b border-slate-100 pb-2">Gaji Pokok Utama</h4>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Gaji Bulanan Tetap (IDR)</label>
                        <input name="salary" required type="number" defaultValue={selectedWorker?.salary} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 font-mono" />
                    </div>
                    <button type="submit" className="self-end bg-slate-900 text-white p-3 rounded-sm hover:bg-slate-800 transition-all shadow-md">
                        <Save size={18} />
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 italic border-b border-slate-100 pb-2">Uraian Gaji Borongan (Tambahan)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 border border-slate-100">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Penjualan Pupuk</label>
                        <input 
                            type="number" 
                            value={borongan.pupuk} 
                            onChange={(e) => setBorongan(prev => ({ ...prev, pupuk: Number(e.target.value) }))}
                            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" 
                        />
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-100">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Penjualan Karung</label>
                        <input 
                            type="number" 
                            value={borongan.karung} 
                            onChange={(e) => setBorongan(prev => ({ ...prev, karung: Number(e.target.value) }))}
                            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" 
                        />
                    </div>
                    <div className="col-span-full bg-slate-50 p-4 border border-slate-100">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Lain-lain / Bonus</label>
                        <input 
                            type="number" 
                            value={borongan.lainnya} 
                            onChange={(e) => setBorongan(prev => ({ ...prev, lainnya: Number(e.target.value) }))}
                            className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 p-6 border border-slate-800 text-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">Total Take Home Pay</p>
                        <p className="text-2xl font-black italic tracking-tighter text-amber-500">
                            {formatCurrency((selectedWorker?.salary || 0) + borongan.pupuk + borongan.karung + borongan.lainnya)}
                        </p>
                    </div>
                    <DollarSign size={24} className="text-slate-700" />
                </div>
                <button 
                    onClick={handleDownloadSlip}
                    className="w-full bg-white text-slate-900 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={16} /> Generate & Download Slip Gaji (PDF)
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
