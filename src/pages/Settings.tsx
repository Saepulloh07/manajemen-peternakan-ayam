import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Smartphone,
  ChevronRight,
  Database,
  Home,
  Plus,
  Calendar, 
  Hash, 
  User as UserIcon, 
  Trash2, 
  Edit2, 
  CheckCircle2,
  Layout as LayoutIcon,
  Save,
  Shield,
  Search
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, User, PoultryHouse, FlockBatch } from '../types';
import Swal from 'sweetalert2';
import { useHouse } from '../HouseContext';
import { useApp } from '../AppContext';
import { useFlock } from '../FlockContext';
import Modal from '../components/Modal';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('HOUSES');
  const { houses, addHouse, updateHouse, deleteHouse, selectedHouseId } = useHouse();
  const { users, addUser, updateUser, deleteUser, sidebarPermissions, updatePermissions } = useApp();
  const { flocks, addFlock, updateFlock, deleteFlock } = useFlock();
  
  // --- House Management State ---
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<PoultryHouse | null>(null);

  // --- Profile Farm State ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- Flock Management State ---
  const [isFlockModalOpen, setIsFlockModalOpen] = useState(false);
  const [editingFlock, setEditingFlock] = useState<FlockBatch | null>(null);

  // --- Security State ---
  const [selectedRoleForSecurity, setSelectedRoleForSecurity] = useState<UserRole>(UserRole.ADMIN);

  const sections = [
    { id: 'HOUSES', label: 'Manajemen Kandang', icon: Home },
    { id: 'FLOCKS', label: 'Manajemen Batch/Flock', icon: Hash },
    { id: 'PROFILE', label: 'Profil Farm (User)', icon: Smartphone },
    { id: 'SECURITY', label: 'Keamanan & Role', icon: ShieldCheck },
    { id: 'DATA', label: 'Backup & Arsip', icon: Database },
  ];

  const calculateHouseStatus = (house: PoultryHouse) => {
    if (!house.purchaseDate || !house.purchasePrice) return 'Kondisi Prima (Baru)';
    
    const purchaseDate = new Date(house.purchaseDate);
    const now = new Date();
    const ageMonths = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());
    
    if (ageMonths < 12) return 'Sangat Baik (Siklus Awal)';
    if (ageMonths < 60) return 'Baik (Penyusutan Normal)';
    if (ageMonths < 100) return 'Perlu Perawatan (Menjelang Afkir)';
    return 'Afkir / Perlu Renovasi Total';
  };

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

  const handleSaveHouse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const capacity = Number(formData.get('capacity'));
    const managerId = formData.get('managerId') as string;
    const purchaseDate = formData.get('purchaseDate') as string;
    const purchasePrice = Number(formData.get('purchasePrice'));

    if (editingHouse) {
      updateHouse(editingHouse.id, { name, capacity, managerId, purchaseDate, purchasePrice });
    } else {
      addHouse(name, capacity, managerId, purchaseDate, purchasePrice);
    }
    
    Swal.fire({ title: 'Berhasil!', text: 'Data kandang telah disimpan.', icon: 'success', confirmButtonColor: '#0f172a' });
    setIsHouseModalOpen(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as UserRole;
    const salary = Number(formData.get('salary'));

    if (editingUser) {
      updateUser(editingUser.id, { name, email, username, password, role, salary });
    } else {
      addUser({ name, email, username, password, role, salary, assignedHouses: [] });
    }

    Swal.fire({ title: 'Berhasil!', text: 'Data pengguna telah disimpan.', icon: 'success', confirmButtonColor: '#0f172a' });
    setIsUserModalOpen(false);
  };

  const ALL_SIDEBAR_ITEMS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'production', label: 'Produksi Harian' },
    { id: 'feedFormulation', label: 'Formulasi Pakan' },
    { id: 'vaccine', label: 'Vaksin & Biosekuriti' },
    { id: 'sales', label: 'Penjualan Telur' },
    { id: 'inventory', label: 'Stok Logistik' },
    { id: 'finance', label: 'Keuangan & Aset' },
    { id: 'workers', label: 'SDM & Payroll' },
    { id: 'settings', label: 'Konfigurasi' },
  ];

  const houseFlocks = flocks.filter(f => f.houseId === selectedHouseId);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Farm System configuration</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Kelola infrastruktur, keamanan, dan profil personil farm.</p>
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
                {activeSection === 'HOUSES' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        key="houses" className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm relative">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">House Management</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Konfigurasi infrastruktur kandang dan status penyusutan.</p>
                                </div>
                                <button 
                                    onClick={() => { setEditingHouse(null); setIsHouseModalOpen(true); }}
                                    className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {houses.map((house) => {
                                  const manager = users.find(u => u.id === house.managerId);
                                  const status = calculateHouseStatus(house);
                                  return (
                                    <div 
                                      key={house.id} 
                                      onClick={() => { setEditingHouse(house); setIsHouseModalOpen(true); }}
                                      className="p-6 bg-slate-50 border border-slate-100 hover:border-amber-500 transition-all group cursor-pointer relative"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-amber-500 transition-all">
                                                <Home size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black uppercase text-slate-900 tracking-tighter italic">{house.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">PJ: {manager?.name || 'Belum diatur'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-end">
                                          <div>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status Kondisi</p>
                                            <p className={cn("text-[9px] font-black uppercase italic", status.includes('Afkir') ? 'text-rose-600' : status.includes('Perlu') ? 'text-amber-600' : 'text-emerald-600')}>
                                              {status}
                                            </p>
                                          </div>
                                          <div className="flex space-x-2">
                                            <div className="p-1.5 bg-white border border-slate-200 text-slate-400 group-hover:text-slate-900"><Edit2 size={12} /></div>
                                            <div onClick={(e) => { e.stopPropagation(); deleteHouse(house.id); }} className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600"><Trash2 size={12} /></div>
                                          </div>
                                        </div>
                                    </div>
                                  );
                                })}
                            </div>
                        </div>

                        <Modal isOpen={isHouseModalOpen} onClose={() => setIsHouseModalOpen(false)} title={editingHouse ? `Edit: ${editingHouse.name}` : "Tambah Kandang Baru"}>
                            <form onSubmit={handleSaveHouse} className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Kandang</label>
                                  <input name="name" required defaultValue={editingHouse?.name} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Kapasitas (Ekor)</label>
                                  <input name="capacity" type="number" defaultValue={editingHouse?.capacity || 5000} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Penanggungjawab</label>
                                  <select name="managerId" defaultValue={editingHouse?.managerId} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                                    <option value="">Pilih Personel</option>
                                    {users.filter(u => u.role !== UserRole.SUPER_ADMIN).map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                  </select>
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Tanggal Pembelian/Bangun</label>
                                  <input name="purchaseDate" type="date" defaultValue={editingHouse?.purchaseDate} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nilai Aset (IDR)</label>
                                  <input name="purchasePrice" type="number" defaultValue={editingHouse?.purchasePrice || 0} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                              </div>
                              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2">
                                <Save size={14} /> Simpan Data Kandang
                              </button>
                            </form>
                        </Modal>
                    </motion.div>
                )}

                {activeSection === 'PROFILE' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        key="profile" className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">User Profile Management</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Kelola kredensial dan hak akses personil farm.</p>
                                </div>
                                <button 
                                    onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                                    className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 transition-all shadow-lg"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100 border border-slate-100">
                              {users.map(u => (
                                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                      <UserIcon size={18} />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black uppercase text-slate-900 italic">{u.name}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{u.role} · @{u.username}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900"><Edit2 size={16} /></button>
                                    {u.role !== UserRole.SUPER_ADMIN && (
                                      <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                        </div>

                        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? `Edit User: ${editingUser.name}` : "Tambah User Baru"}>
                            <form onSubmit={handleSaveUser} className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Lengkap</label>
                                  <input name="name" required defaultValue={editingUser?.name} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Username</label>
                                  <input name="username" required defaultValue={editingUser?.username} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Password</label>
                                  <input name="password" required type="text" defaultValue={editingUser?.password} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Email Address</label>
                                  <input name="email" required type="email" defaultValue={editingUser?.email} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Role</label>
                                  <select name="role" defaultValue={editingUser?.role} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                                    <option value={UserRole.ADMIN}>ADMIN</option>
                                    <option value={UserRole.WORKER}>WORKER</option>
                                    <option value={UserRole.SUPER_ADMIN}>SUPER_ADMIN (OWNER)</option>
                                  </select>
                                </div>
                                <div className="col-span-1">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Gaji Pokok (IDR)</label>
                                  <input name="salary" type="number" defaultValue={editingUser?.salary || 0} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                              </div>
                              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl">
                                Simpan Profil User
                              </button>
                            </form>
                        </Modal>
                    </motion.div>
                )}

                {activeSection === 'SECURITY' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        key="security" className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic mb-8">RBAC Sidebar permissions</h3>
                            
                            <div className="flex gap-4 mb-8">
                              {[UserRole.ADMIN, UserRole.WORKER].map(role => (
                                <button 
                                  key={role}
                                  onClick={() => setSelectedRoleForSecurity(role)}
                                  className={cn(
                                    "px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all",
                                    selectedRoleForSecurity === role ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                                  )}
                                >
                                  {role.replace('_', ' ')} Access
                                </button>
                              ))}
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-6">
                              <p className="text-[10px] font-black uppercase text-slate-900 mb-6 italic flex items-center gap-2">
                                <LayoutIcon size={14} /> Sidebar Navigation Access for {selectedRoleForSecurity}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {ALL_SIDEBAR_ITEMS.map(item => {
                                  const isChecked = sidebarPermissions[selectedRoleForSecurity]?.includes(item.id);
                                  return (
                                    <label 
                                      key={item.id}
                                      className={cn(
                                        "flex items-center space-x-3 p-3 border transition-all cursor-pointer",
                                        isChecked ? "bg-white border-amber-500 ring-1 ring-amber-500/10 shadow-sm" : "bg-slate-100/50 border-slate-200 grayscale opacity-60"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-5 h-5 rounded-sm border flex items-center justify-center transition-all",
                                        isChecked ? "bg-amber-500 border-amber-600" : "bg-white border-slate-300"
                                      )}>
                                        {isChecked && <CheckCircle2 size={12} className="text-white" />}
                                        <input 
                                          type="checkbox" 
                                          className="hidden" 
                                          checked={isChecked}
                                          onChange={() => {
                                            const current = sidebarPermissions[selectedRoleForSecurity] || [];
                                            const next = isChecked ? current.filter(id => id !== item.id) : [...current, item.id];
                                            updatePermissions(selectedRoleForSecurity, next);
                                          }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">{item.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'DATA' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        key="data" className="space-y-8"
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
                                <button className="bg-slate-900 text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 shadow-md border border-slate-800 transition-colors">Export SQL/CSV</button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'FLOCKS' && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        key="flocks" className="space-y-8"
                    >
                        <div className="bg-white p-8 border border-slate-200 shadow-sm relative">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Flock & Cycle Control</h3>
                                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold italic tracking-tighter opacity-70">Kelola batch ayam, umur, dan populasi aktif.</p>
                                </div>
                                <button 
                                    onClick={() => { setEditingFlock(null); setIsFlockModalOpen(true); }}
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
                                                <button onClick={() => { setEditingFlock(flock); setIsFlockModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Edit2 size={16} /></button>
                                                <button onClick={() => {
                                                    Swal.fire({
                                                        title: 'Hapus Batch?',
                                                        text: 'Seluruh data batch ini akan dihapus permanen.',
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#e11d48',
                                                        confirmButtonText: 'Ya, Hapus',
                                                        cancelButtonText: 'Batal'
                                                    }).then(result => { if (result.isConfirmed) deleteFlock(flock.id); });
                                                }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <Modal isOpen={isFlockModalOpen} onClose={() => setIsFlockModalOpen(false)} title={editingFlock ? "Edit Batch/Flock" : "Tambah Batch Baru"}>
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
                        type="text" required value={strain} onChange={(e) => setStrain(e.target.value)}
                        placeholder="Contoh: Isa Brown, Lohmann, Hisex"
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Tanggal Datang</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date" required value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-12 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                        />
                    </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Umur Saat Datang (Mg)</label>
                    <input
                        type="number" required min="0" value={arrivalAgeWeeks} onChange={(e) => setArrivalAgeWeeks(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Populasi Awal (Ekor)</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="number" required min="1" value={initialCount} onChange={(e) => setInitialCount(Number(e.target.value))}
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
                            <input type="checkbox" className="hidden" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Batch Aktif</span>
                    </label>
                </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg">
                Simpan Konfigurasi Batch
            </button>
        </form>
    );
}

