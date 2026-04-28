/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Skull,
  Package,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Target,
  Syringe
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

import { useHouse } from '../HouseContext';

const data = [
  { name: 'Sen', production: 92, feed: 120, mortality: 2 },
  { name: 'Sel', production: 94, feed: 122, mortality: 1 },
  { name: 'Rab', production: 91, feed: 121, mortality: 0 },
  { name: 'Kam', production: 89, feed: 119, mortality: 4 },
  { name: 'Jum', production: 93, feed: 120, mortality: 1 },
  { name: 'Sab', production: 95, feed: 125, mortality: 0 },
  { name: 'Min', production: 92, feed: 121, mortality: 2 },
];

const monthlyData = [
  { name: 'Jan', production: 2800, feed: 3600, mortality: 45 },
  { name: 'Feb', production: 2950, feed: 3650, mortality: 38 },
  { name: 'Mar', production: 3100, feed: 3700, mortality: 40 },
  { name: 'Apr', production: 3050, feed: 3680, mortality: 35 },
  { name: 'Mei', production: 3200, feed: 3750, mortality: 30 },
  { name: 'Jun', production: 3150, feed: 3720, mortality: 32 },
  { name: 'Jul', production: 3250, feed: 3800, mortality: 28 },
];

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  progress?: number;
}

function MetricCard({ label, value, subValue, icon: Icon, trend, trendValue, color = "bg-white", progress }: MetricCardProps) {
  return (
    <div className={cn("p-4 md:p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md relative overflow-hidden", color)}>
      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <div className={cn(
            "flex items-center text-[9px] md:text-[10px] font-bold",
            trend === 'up' ? "text-emerald-600" :
              trend === 'down' ? "text-rose-600" : "text-slate-500"
          )}>
            {trend === 'up' ? <ArrowUpRight size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
            {trendValue}
          </div>
        )}
      </div>
      {progress !== undefined ? (
        <div className="w-full bg-slate-100 h-1 md:h-1.5 mt-3 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-amber-500 h-full"
          />
        </div>
      ) : subValue ? (
        <p className="text-[9px] md:text-[10px] text-slate-500 mt-2">{subValue}</p>
      ) : null}

      <Icon size={14} className="absolute top-4 right-4 text-slate-100" />
    </div>
  );
}

export default function Dashboard() {
  const { activeHouse } = useHouse();
  const [chartPeriod, setChartPeriod] = useState<'mingguan' | 'bulanan'>('mingguan');

  const currentChartData = chartPeriod === 'mingguan' ? data : monthlyData;

  // Data Mock untuk Metrik Baru
  const currentHDP = 92.4;
  const currentFCR = 2.15;

  return (
    <div className="grid grid-cols-12 gap-6 pb-12">
      {/* KPI Bricks */}
      <div className="col-span-12 md:col-span-3">
        <MetricCard
          label="Hen Day Production (HDP)"
          value={`${currentHDP}%`}
          progress={currentHDP}
          subValue={`Standar Kurva (Umur 32 Mg): 94.5%`}
          icon={Activity}
        />
      </div>
      <div className="col-span-12 md:col-span-3">
        <MetricCard
          label="Feed Conversion Ratio (FCR)"
          value={currentFCR}
          subValue="Target Ideal Strain: < 2.10"
          icon={TrendingUp}
          trend="down"
          trendValue="+0.05 dari target"
        />
      </div>
      <div className="col-span-12 md:col-span-3">
        <MetricCard
          label="Mortalitas Siklus"
          value="0.42%"
          subValue="Batas Standar: 0.50% / Bulan"
          icon={Skull}
          trend="down"
          trendValue="Aman"
        />
      </div>
      <div className="col-span-12 md:col-span-3">
        <MetricCard
          label="Stok Pakan Jadi (Mix)"
          value="1,250 kg"
          subValue="Estimasi Sisa: 4 Hari"
          icon={Package}
          trend="neutral"
          trendValue="Sesuai Buffer"
        />
      </div>

      {/* Charts Section */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-sm text-slate-700">Trend Produksi {activeHouse?.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Statistik & Standar Strain</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('mingguan')}
                className={cn("px-3 py-1 text-[10px] font-bold uppercase transition-all rounded-sm", chartPeriod === 'mingguan' ? "border border-slate-200 bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600")}
              >
                Mingguan
              </button>
              <button
                onClick={() => setChartPeriod('bulanan')}
                className={cn("px-3 py-1 text-[10px] font-bold uppercase transition-all rounded-sm", chartPeriod === 'bulanan' ? "border border-slate-200 bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600")}
              >
                Bulanan
              </button>
            </div>
          </div>
          <div className="p-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f59eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="production" stroke="#f59eb" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Depreciations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-5">
            <h3 className="font-bold text-sm text-slate-700 mb-4">Dana Peremajaan Ayam</h3>
            <div className="flex justify-between text-[10px] mb-1 font-bold uppercase tracking-widest text-slate-400">
              <span>Terakumulasi (Bulan 14/18)</span>
              <span>77%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 border border-slate-200 overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '77%' }}
                className="bg-emerald-500 h-full"
              />
            </div>
            <div className="flex justify-between items-end mt-4">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Target Restock: {formatCurrency(350000000)}<br />
                Saldo Saat Ini: {formatCurrency(269500000)}
              </p>
              <Target size={24} className="text-slate-100" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5">
            <h3 className="font-bold text-sm text-slate-700 mb-4">Penyusutan Kandang</h3>
            <div className="flex justify-between text-[10px] mb-1 font-bold uppercase tracking-widest text-slate-400">
              <span>Periode 1/5 (Tahun 2/10)</span>
              <span>20%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 border border-slate-200 overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '20%' }}
                className="bg-slate-700 h-full"
              />
            </div>
            <div className="flex justify-between items-end mt-4">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Alokasi Laba Ditahan: Rp 2.5jt/bln<br />
                Saldo Renovasi: Rp 60.000.000
              </p>
              <Package size={24} className="text-slate-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Smart Warning Card */}
        <div className="bg-slate-900 text-white shadow-xl p-6 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <AlertTriangle size={64} />
          </div>
          <h3 className="font-bold text-amber-400 text-[10px] mb-6 uppercase tracking-[0.2em]">Smart Warning System</h3>

          <div className="space-y-6">
            {/* Alarm Jadwal Biosekuriti */}
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 ring-4 ring-emerald-500/20 shrink-0"></div>
              <div>
                <p className="text-sm font-bold flex items-center gap-2"><Syringe size={14} className="text-emerald-400" /> Jadwal Biosekuriti</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Vaksin ND-IB Live via Air Minum dijadwalkan besok (Umur 32 Minggu). Pastikan puasa air 2 jam sebelum aplikasi.</p>
              </div>
            </div>

            {/* Peringatan Formulasi / Stok Bahan Baku */}
            <div className="flex gap-3 items-start border-t border-slate-800 pt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 ring-4 ring-amber-500/20 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-amber-400">Stok Raw Material: Jagung</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Stok jagung tersisa 800kg. Pembuatan resep ransum "Layer 30+" lusa membutuhkan 1.200kg.</p>
              </div>
            </div>

            {/* Peringatan Performa HDP vs Strain Curve */}
            <div className="flex gap-3 items-start border-t border-slate-800 pt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 ring-4 ring-rose-500/20 shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-rose-400">Penurunan Performa HDP</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">HDP aktual (92.4%) berada 2.1% di bawah kurva standar Isa Brown. Periksa kualitas premix atau sirkulasi udara.</p>
              </div>
            </div>

            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold uppercase tracking-widest transition-colors mt-2 text-white">
              KIRIM ALERT KE WHATSAPP
            </button>
          </div>
        </div>

        {/* Lab Snapshot & Mortalitas */}
        <div className="bg-white border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-slate-700">Upah Operasional</h3>
            <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase font-black tracking-widest">Minggu 4</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Gaji Reguler (Staff)</span>
              <span className="font-bold text-slate-800">Rp 1.400.000</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-50 pt-4">
              <span className="text-slate-500">Borongan Giling (1.2t)</span>
              <span className="font-bold text-slate-800">Rp 420.000</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-100 pt-4 font-bold">
              <span className="text-slate-800">Total Minggu Ini</span>
              <span className="text-amber-600">Rp 1.820.000</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 border-dashed text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mortalitas Hari Ini</p>
          <p className="text-3xl font-black italic text-rose-600 mt-1">2 Ekor</p>
          <p className="text-[10px] text-slate-500 mt-2">{activeHouse?.name} - Penyekat 3</p>
        </div>
      </div>
    </div>
  );
}