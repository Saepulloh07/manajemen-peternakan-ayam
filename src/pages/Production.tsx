/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Egg,
  Plus,
  Trash2,
  Save,
  History,
  Info,
  Activity // Ditambahkan untuk icon FCR
} from 'lucide-react';
import { EggCategory } from '../types';
import { getEggCategoryRange, cn } from '../lib/utils';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';

import { useHouse } from '../HouseContext';
import { useFlock } from '../FlockContext';
import { useGlobalData } from '../GlobalContext';

export default function Production() {
  const { activeHouse } = useHouse();
  const { saveProduction } = useGlobalData();
  const { updateFlock } = useFlock();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eggCount, setEggCount] = useState(0);
  const [mortality, setMortality] = useState(0);
  const [feedConsumed, setFeedConsumed] = useState(0);
  const [discardedEggs, setDiscardedEggs] = useState(0);

  // --- INTEGRASI FLOCK RIIL ---
  const { getActiveFlockByHouse } = useFlock();
  const activeBatch = getActiveFlockByHouse(activeHouse?.id || '');

  // Fungsi menghitung umur profesional (Minggu + Hari)
  const calculateDetailedAge = (arrivalDate: string, arrivalAgeWeeks: number, targetDate: string) => {
    if (!arrivalDate) return { weeks: 0, days: 0 };
    
    const start = new Date(arrivalDate);
    const end = new Date(targetDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const totalDays = diffDays + (arrivalAgeWeeks * 7);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    
    return { weeks, days };
  };

  const age = useMemo(() => {
    if (!activeBatch) return { weeks: 0, days: 0 };
    return calculateDetailedAge(activeBatch.arrivalDate, activeBatch.arrivalAgeWeeks, date);
  }, [activeBatch, date]);

  const [breakdown, setBreakdown] = useState<Record<string, number>>({
    [EggCategory.BM]: 0,
    [EggCategory.KRC]: 0,
    [EggCategory.KS]: 0,
    [EggCategory.PELOR]: 0,
    [EggCategory.RETAK]: 0,
    [EggCategory.PECAH]: 0,
  });

  const handleBreakdownChange = (category: string, value: number) => {
    setBreakdown(prev => ({ ...prev, [category]: value }));
  };

  // Menggunakan useMemo agar kalkulasi lebih efisien
  const totalBreakdownKg = useMemo(() => {
    return Object.entries(breakdown).reduce((acc: number, [_, weight]) => acc + (weight as number), 0);
  }, [breakdown]);

  // [FITUR BARU] Kalkulasi FCR Otomatis secara Real-Time (Total Kg Pakan / Total Kg Telur)
  const currentFCR = useMemo(() => {
    if (totalBreakdownKg > 0 && feedConsumed > 0) {
      return (feedConsumed / totalBreakdownKg).toFixed(2);
    }
    return "0.00";
  }, [feedConsumed, totalBreakdownKg]);

  const handleSave = () => {
    if (!eggCount || !feedConsumed || totalBreakdownKg === 0) {
      Swal.fire({
        title: 'Data Tidak Lengkap',
        text: 'Mohon isi total produksi, pakan konsumsi, dan klasifikasi berat telur.',
        icon: 'warning',
        confirmButtonColor: '#0f172a',
      });
      return;
    }

    Swal.fire({
      title: 'Simpan Produksi?',
      html: `
        <div class="text-left mt-4 text-sm">
          <p>Umur Ayam: <b>${age.weeks} Minggu ${age.days} Hari</b></p>
          <p>Total Pakan: <b>${feedConsumed} kg</b></p>
          <p>Total Telur: <b>${totalBreakdownKg} kg</b></p>
          <hr class="my-2"/>
          <p class="text-amber-600 font-bold text-lg">FCR Harian: ${currentFCR}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#f1f5f9',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
      customClass: {
        cancelButton: 'text-slate-600'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Save to Global Data
        saveProduction({
            houseId: activeHouse?.id || '',
            date,
            eggCount,
            feedConsumed,
            mortality,
            discardedEggs,
            breakdown,
            totalKg: totalBreakdownKg
        });

        // Update Flock Population if mortality > 0
        if (mortality > 0 && activeBatch) {
            updateFlock(activeBatch.id, {
                currentCount: activeBatch.currentCount - mortality
            });
        }

        Swal.fire({
          title: 'Berhasil!',
          text: 'Data produksi harian telah disimpan.',
          icon: 'success',
          confirmButtonColor: '#0f172a',
        });
        
        // Reset form
        setEggCount(0);
        setMortality(0);
        setFeedConsumed(0);
        setDiscardedEggs(0);
      }
    });
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Reset Form?',
      text: "Semua inputan akan dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Reset',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setEggCount(0);
        setMortality(0);
        setFeedConsumed(0);
        setDiscardedEggs(0);
        setBreakdown({
          [EggCategory.BM]: 0,
          [EggCategory.KRC]: 0,
          [EggCategory.KS]: 0,
          [EggCategory.PELOR]: 0,
          [EggCategory.RETAK]: 0,
          [EggCategory.PECAH]: 0,
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Input Produksi <span className="text-amber-500">{activeHouse?.name}</span></h1>
          {/* Menampilkan Strain dan Umur Ayam Riil */}
          <p className="text-slate-500 text-[10px] md:text-sm mt-1 uppercase font-bold tracking-widest opacity-70">
            {activeBatch ? (
              <>Strain: {activeBatch.strain} | Umur: <span className="text-emerald-600">{age.weeks} Minggu {age.days} Hari</span></>
            ) : (
              <span className="text-rose-500">⚠️ Belum ada batch aktif di kandang ini</span>
            )}
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 shadow-sm flex items-center space-x-2 cursor-pointer hover:bg-slate-50">
          <History size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">History</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Essential Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Tanggal Operasional</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Total Produksi (Butir)</label>
              <input
                type="number"
                placeholder="0"
                value={eggCount || ''}
                onChange={(e) => setEggCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Pakan Konsumsi (kg)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={feedConsumed || ''}
                onChange={(e) => setFeedConsumed(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Mortalitas (Ekor)</label>
              <input
                type="number"
                placeholder="0"
                value={mortality || ''}
                onChange={(e) => setMortality(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 text-rose-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Telur Dibuang/Afkir (Butir/Kg)</label>
              <input
                type="number"
                placeholder="0"
                value={discardedEggs || ''}
                onChange={(e) => setDiscardedEggs(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 text-rose-600"
              />
            </div>
          </div>

          {/* [MODIFIKASI] Panel Indikator FCR Real-time menggantikan Tips Pengisian biasa */}
          <div className="bg-slate-900 text-white p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            <Activity size={60} className="absolute -right-4 -top-4 opacity-10 text-amber-500" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Live FCR Kalkulasi</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black italic">{currentFCR}</span>
              <span className="text-xs text-slate-400 font-medium">kg pakan / kg telur</span>
            </div>
            {/* Peringatan visual jika FCR terindikasi terlalu tinggi (boros) */}
            {Number(currentFCR) > 2.2 && (
              <p className="text-[10px] mt-4 text-rose-400 bg-rose-900/30 p-2 rounded-sm border border-rose-500/20">
                ⚠️ Peringatan: FCR &gt; 2.2. Indikasi pemborosan pakan, tumpah, atau masalah usus ayam.
              </p>
            )}
            {Number(currentFCR) > 0 && Number(currentFCR) <= 2.2 && (
              <p className="text-[10px] mt-4 text-emerald-400 bg-emerald-900/30 p-2 rounded-sm border border-emerald-500/20">
                ✅ FCR Optimal. Efisiensi ransum terjaga.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Egg Classification Breakdown */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform translate-x-4 -translate-y-4">
              <Egg size={200} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="font-black text-base md:text-lg text-slate-800 uppercase tracking-tighter italic">Klasifikasi Telur</h3>
                <p className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Berdasarkan Timbangan Total (Kg)</p>
              </div>
              <div className="px-3 py-1 bg-amber-50 rounded-sm text-[10px] md:text-[11px] font-black text-amber-700 border border-amber-200 self-start sm:self-center shadow-inner">
                TOTAL: {totalBreakdownKg.toFixed(2)} KG
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.values(EggCategory).map((cat) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{cat}</span>
                      <p className="text-[10px] text-slate-400 font-medium italic">{getEggCategoryRange(cat)}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.0"
                      step="0.1"
                      value={breakdown[cat] || ''}
                      onChange={(e) => handleBreakdownChange(cat, Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-4 pr-16 py-4 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                    />
                    {/* Mengubah label untuk memprioritaskan KG demi akurasi FCR */}
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">kg</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
              >
                Reset Form
              </button>
              <button
                onClick={handleSave}
                className="bg-slate-900 text-white px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-md group"
              >
                <Save size={16} className="group-hover:text-amber-500 transition-colors" />
                <span>Simpan Produksi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}