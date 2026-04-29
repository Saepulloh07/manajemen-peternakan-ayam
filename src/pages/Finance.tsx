/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Calendar,
    Layers,
    Upload,
    Camera,
    Download,
    Save,
    BookOpen,
    Receipt,
    ShoppingCart
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { useHouse } from '../HouseContext';
import { useGlobalData } from '../GlobalContext';
import { useFlock } from '../FlockContext';
import { EggCategory } from '../types';

export default function Finance() {
    const { activeHouse } = useHouse();
    const { getActiveFlockByHouse } = useFlock();
    const { productionLogs, salesLogs, transactions, addModalAwal, assets, updateAssetStatus } = useGlobalData();

    const [activeTab, setActiveTab] = useState<'BUKU_TELUR' | 'BUKU_TRANSAKSI' | 'ASET'>('BUKU_TELUR');
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isModalAwalOpen, setIsModalAwalOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // --- Filtering Data for Active House ---
    const filteredProdLogs = productionLogs.filter(p => p.houseId === activeHouse?.id);
    const filteredSalesLogs = salesLogs.filter(s => s.houseId === activeHouse?.id);

    // Transaksi biasanya global, tapi jika ingin dipisah per kandang bisa difilter deskripsinya
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
    const modalTransactions = transactions.filter(t => t.type === 'MODAL');

    // --- Total Calculations ---
    const totalProduction = filteredProdLogs.reduce((acc, curr) => acc + curr.totalKg, 0);
    const totalSalesTelur = filteredSalesLogs.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = expenseTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const totalModalAwal = modalTransactions.reduce((acc, curr) => acc + curr.total, 0);

    // Accounting Logic
    const totalAllRevenue = totalSalesTelur + totalIncome;
    const netProfit = totalAllRevenue - totalExpenses;
    const currentCapital = totalModalAwal + netProfit;

    const activeFlock = getActiveFlockByHouse(activeHouse?.id || '');
    const currentPopulation = activeFlock?.currentCount || 0;

    // ─── Egg Categorization Helpers ───────────────────────────────────────────
    const getNormalKg = (log: typeof filteredProdLogs[0]) =>
        (log.breakdown[EggCategory.BM] || 0) +
        (log.breakdown[EggCategory.KRC] || 0) +
        (log.breakdown[EggCategory.KS] || 0) +
        (log.breakdown[EggCategory.PELOR] || 0);

    const getRetakKg = (log: typeof filteredProdLogs[0]) =>
        (log.breakdown[EggCategory.KRC_RETAK] || 0) +
        (log.breakdown[EggCategory.KS_RETAK] || 0) +
        (log.breakdown[EggCategory.RETAK] || 0);

    const getPecahKg = (log: typeof filteredProdLogs[0]) =>
        (log.breakdown[EggCategory.PECAH] || 0) + (log.discardedEggs || 0);

    const getSoldByDate = (date: string, category: 'NORMAL' | 'RETAK') => {
        const normalCats = [EggCategory.BM, EggCategory.KRC, EggCategory.KS, EggCategory.PELOR];
        const retakCats = [EggCategory.KRC_RETAK, EggCategory.KS_RETAK, EggCategory.RETAK];
        const cats = category === 'NORMAL' ? normalCats : retakCats;
        return filteredSalesLogs
            .filter(s => s.date === date && cats.includes(s.category as EggCategory) && !s.isFree)
            .reduce((a, b) => a + b.quantity, 0);
    };
    const getFreeSoldByDate = (date: string) =>
        filteredSalesLogs.filter(s => s.date === date && s.isFree).reduce((a, b) => a + b.quantity, 0);

    const totalNormal = filteredProdLogs.reduce((a, b) => a + getNormalKg(b), 0);
    const totalRetak = filteredProdLogs.reduce((a, b) => a + getRetakKg(b), 0);
    const totalPecah = filteredProdLogs.reduce((a, b) => a + getPecahKg(b), 0);

    const calculateDepreciation = (asset: any) => {
        const purchaseDate = new Date(asset.purchaseDate);
        const today = new Date();
        const diffMonths = (today.getFullYear() - purchaseDate.getFullYear()) * 12 + (today.getMonth() - purchaseDate.getMonth());
        const totalDepreciation = (asset.purchasePrice / (asset.expectedLifeYears * 12)) * Math.max(0, diffMonths);
        return Math.min(asset.purchasePrice, totalDepreciation);
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetId) return;
        const formData = new FormData(e.target as HTMLFormElement);
        const status = formData.get('status') as any;
        const notes = formData.get('notes') as string;
        const user = "Owner / Admin";

        updateAssetStatus(selectedAssetId, status, user, notes);
        Swal.fire({ title: 'Berhasil!', text: 'Status aset telah diperbarui.', icon: 'success', confirmButtonColor: '#0f172a' });
        setIsMaintenanceModalOpen(false);
    };

    const handleSaveAsset = (e: React.FormEvent) => {
        e.preventDefault();
        Swal.fire({
            title: 'Daftarkan Aset?',
            text: 'Aset baru akan ditambahkan ke inventaris.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            confirmButtonText: 'Ya, Daftar',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Berhasil!', text: 'Aset telah didaftarkan.', icon: 'success', confirmButtonColor: '#0f172a' });
                setIsAssetModalOpen(false);
            }
        });
    };

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();

        // --- SHEET 1: BUKU TELUR ---
        const sheet1 = workbook.addWorksheet('BUKU TELUR');
        sheet1.mergeCells('A1:L1');
        sheet1.getCell('A1').value = 'LAPORAN PRODUKSI TELUR (BUKU TELUR)';
        sheet1.getCell('A1').font = { bold: true, size: 14 };
        sheet1.getCell('A1').alignment = { horizontal: 'center' };
        
        sheet1.getCell('A4').value = 'Populasi';
        sheet1.getCell('B4').value = currentPopulation;

        const headers1 = ['Tgl', 'Normal', '', '', 'Retak', '', '', 'Pecah/Abnormal', '', 'Total Produksi', '% HDP', 'Ket'];
        const subHeaders1 = ['', 'Produksi', 'Jual', 'Free', 'Produksi', 'Jual', 'Free', 'Produksi', 'Buang', '', '', ''];
        
        sheet1.getRow(6).values = headers1;
        sheet1.getRow(7).values = subHeaders1;
        
        sheet1.mergeCells('A6:A7');
        sheet1.mergeCells('B6:D6');
        sheet1.mergeCells('E6:G6');
        sheet1.mergeCells('H6:I6');
        sheet1.mergeCells('J6:J7');
        sheet1.mergeCells('K6:K7');
        sheet1.mergeCells('L6:L7');

        const cols1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        cols1.forEach(col => {
            [6, 7].forEach(r => {
                const cell = sheet1.getCell(`${col}${r}`);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
        });

        let rowStart = 8;
        filteredProdLogs.forEach((row, i) => {
            const r = rowStart + i;
            sheet1.getRow(r).values = [
                new Date(row.date).toLocaleDateString('id-ID'),
                getNormalKg(row),
                getSoldByDate(row.date, 'NORMAL'),
                getFreeSoldByDate(row.date),
                getRetakKg(row),
                getSoldByDate(row.date, 'RETAK'),
                0,
                row.breakdown[EggCategory.PECAH] || 0,
                row.discardedEggs || 0,
                row.totalKg,
                ((row.eggCount / (currentPopulation || 1)) * 100).toFixed(2),
                row.breakdown[EggCategory.BM] ? `BM:${row.breakdown[EggCategory.BM]}kg` : ''
            ];
            cols1.forEach(col => {
                sheet1.getCell(`${col}${r}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                sheet1.getCell(`${col}${r}`).alignment = { horizontal: 'center' };
            });
        });

        const totalRow = rowStart + filteredProdLogs.length;
        sheet1.getCell(`A${totalRow}`).value = 'TOTAL';
        sheet1.getCell(`A${totalRow}`).font = { bold: true };
        ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
            sheet1.getCell(`${col}${totalRow}`).value = { formula: `SUM(${col}${rowStart}:${col}${totalRow - 1})` };
            sheet1.getCell(`${col}${totalRow}`).font = { bold: true };
            sheet1.getCell(`${col}${totalRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        });

        // --- SHEET 2: TRANSAKSI ---
        const sheet2 = workbook.addWorksheet('TRANSAKSI');
        sheet2.getCell('A1').value = 'LAPORAN TRANSAKSI OPERASIONAL';
        sheet2.getCell('A1').font = { bold: true, size: 14 };
        
        sheet2.getRow(3).values = ['No.', 'Keterangan', 'Qty', 'Harga', 'Total', 'Tanggal', 'Akun'];
        sheet2.getRow(3).eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        expenseTransactions.forEach((row, i) => {
            const r = 4 + i;
            sheet2.getRow(r).values = [i + 1, row.description, row.qty, row.price, row.total, new Date(row.date).toLocaleDateString('id-ID'), row.account];
            sheet2.getCell(`D${r}`).numFmt = '#,##0';
            sheet2.getCell(`E${r}`).numFmt = '#,##0';
        });
        const lastTxRow = 4 + expenseTransactions.length;
        sheet2.getCell(`D${lastTxRow}`).value = 'TOTAL';
        sheet2.getCell(`E${lastTxRow}`).value = { formula: `SUM(E4:E${lastTxRow - 1})` };
        sheet2.getCell(`E${lastTxRow}`).font = { bold: true };
        sheet2.getCell(`E${lastTxRow}`).numFmt = '#,##0';

        // --- SHEET 3: MODAL ---
        const sheet3 = workbook.addWorksheet('MODAL');
        sheet3.getCell('A1').value = 'RINCIAN MODAL MASUK';
        sheet3.getRow(3).values = ['No.', 'Sumber', 'Nominal', 'Tanggal'];
        modalTransactions.forEach((m, i) => {
            sheet3.getRow(4 + i).values = [i + 1, m.description, m.total, new Date(m.date).toLocaleDateString('id-ID')];
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Laporan_Keuangan_Eggly.xlsx');
    };

    const handleAddModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = Number(formData.get('amount'));
        const desc = formData.get('description') as string;

        if (amount > 0) {
            addModalAwal(amount, desc);
            Swal.fire({ title: 'Berhasil!', text: 'Modal telah ditambahkan.', icon: 'success', confirmButtonColor: '#0f172a' });
            setIsModalAwalOpen(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Finance & Accounting</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manajemen keuangan sesuai standar akuntansi peternakan.</p>
                </div>
                <div className="flex items-center space-x-3 overflow-x-auto">
                    <div className="flex bg-white p-1 border border-slate-200 shadow-sm min-w-max">
                        {['BUKU_TELUR', 'BUKU_TRANSAKSI', 'ASET'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                                    activeTab === tab ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                                )}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 opacity-50"></div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic">Ringkasan Ekuitas</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 border border-slate-100 relative">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Laba/Rugi Bersih</p>
                                    <p className={cn(
                                        "text-xl font-black italic tracking-tighter",
                                        netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {netProfit < 0 ? '-' : '+'} {formatCurrency(Math.abs(netProfit))}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-900 border border-slate-800 relative">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Modal Akhir (Equity)</p>
                                    <p className="text-xl font-black italic tracking-tighter text-amber-500">{formatCurrency(currentCapital)}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalAwalOpen(true)}
                            className="w-full bg-slate-100 text-slate-900 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                        >
                            Suntik Modal
                        </button>
                    </div>

                    <div className="bg-slate-900 p-6 text-white space-y-6 border border-slate-800 shadow-xl">
                        <button
                            onClick={handleExportExcel}
                            className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-sm border border-slate-700 flex items-center justify-center space-x-3 transition-all group"
                        >
                            <Download size={18} className="group-hover:text-amber-500 transition-colors" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Download Laporan Excel</span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'BUKU_TELUR' && (
                        <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight italic">Buku Telur Produksi</h3>
                                <button
                                    onClick={handleExportExcel}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2"
                                >
                                    <Download size={16} />
                                    <span>Export Excel</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-center border-collapse border border-slate-200 min-w-max">
                                    <thead>
                                        <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest border-b border-slate-700">
                                            <th rowSpan={2} className="px-3 py-3 border border-slate-700">Tgl</th>
                                            <th colSpan={3} className="px-2 py-3 border border-slate-700">Normal</th>
                                            <th colSpan={3} className="px-2 py-3 border border-slate-700">Retak</th>
                                            <th colSpan={2} className="px-2 py-3 border border-slate-700">Pecah/Abnormal</th>
                                            <th rowSpan={2} className="px-3 py-3 border border-slate-700">Total Produksi</th>
                                            <th rowSpan={2} className="px-3 py-3 border border-slate-700">% HDP</th>
                                        </tr>
                                        <tr className="bg-slate-800 text-slate-300 text-[8px] font-bold uppercase tracking-wider">
                                            <th className="px-2 py-2 border border-slate-700">Prod</th>
                                            <th className="px-2 py-2 border border-slate-700">Jual</th>
                                            <th className="px-2 py-2 border border-slate-700">Free</th>
                                            <th className="px-2 py-2 border border-slate-700">Prod</th>
                                            <th className="px-2 py-2 border border-slate-700">Jual</th>
                                            <th className="px-2 py-2 border border-slate-700">Free</th>
                                            <th className="px-2 py-2 border border-slate-700">Prod</th>
                                            <th className="px-2 py-2 border border-slate-700">Buang</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] text-slate-700 font-medium">
                                        {filteredProdLogs.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100">
                                                <td className="px-3 py-3 font-bold">{new Date(row.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-2 py-3">{getNormalKg(row).toFixed(2)}</td>
                                                <td className="px-2 py-3 text-emerald-600 font-bold">{getSoldByDate(row.date, 'NORMAL') || '-'}</td>
                                                <td className="px-2 py-3 text-blue-600">{getFreeSoldByDate(row.date) || '-'}</td>
                                                <td className="px-2 py-3 text-amber-600 font-bold">{getRetakKg(row).toFixed(2)}</td>
                                                <td className="px-2 py-3">{getSoldByDate(row.date, 'RETAK') || '-'}</td>
                                                <td className="px-2 py-3">-</td>
                                                <td className="px-2 py-3 text-rose-600 font-bold">{(row.breakdown[EggCategory.PECAH] || 0).toFixed(2)}</td>
                                                <td className="px-2 py-3">{row.discardedEggs || '-'}</td>
                                                <td className="px-3 py-3 font-black text-emerald-600">{row.totalKg.toFixed(2)} kg</td>
                                                <td className="px-3 py-3 font-bold">{((row.eggCount / (currentPopulation || 1)) * 100).toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 font-black text-[10px] uppercase">
                                        <tr>
                                            <td className="px-3 py-4">TOTAL</td>
                                            <td className="px-2 py-4">{totalNormal.toFixed(2)}</td>
                                            <td colSpan={2}></td>
                                            <td className="px-2 py-4 text-amber-600">{totalRetak.toFixed(2)}</td>
                                            <td colSpan={2}></td>
                                            <td className="px-2 py-4 text-rose-600">{totalPecah.toFixed(2)}</td>
                                            <td></td>
                                            <td className="px-3 py-4 text-emerald-600 italic">{totalProduction.toFixed(2)} kg</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'BUKU_TRANSAKSI' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                                    <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight italic">Buku Kas & Transaksi</h3>
                                </div>
                                <div className="p-4 grid grid-cols-1 xl:grid-cols-4 gap-6">
                                    <div className="xl:col-span-3 overflow-x-auto">
                                        <table className="w-full text-left border border-slate-200">
                                            <thead>
                                                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                                                    <th className="px-3 py-3">Keterangan</th>
                                                    <th className="px-3 py-3 text-right">Total</th>
                                                    <th className="px-3 py-3">Tanggal</th>
                                                    <th className="px-3 py-3">Tipe</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[10px]">
                                                {transactions.filter(t => t.type !== 'MODAL').map((t, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="px-3 py-3 font-bold">{t.description}</td>
                                                        <td className={cn("px-3 py-3 text-right font-mono font-black", t.type === 'INCOME' ? "text-emerald-600" : "text-rose-600")}>
                                                            {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.total)}
                                                        </td>
                                                        <td className="px-3 py-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                                        <td className="px-3 py-3">
                                                            <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase", t.type === 'INCOME' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                                                                {t.type}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="xl:col-span-1 bg-slate-50 p-4 border border-slate-200">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3">Modal Masuk</h4>
                                        <div className="space-y-2">
                                            {modalTransactions.map((m, i) => (
                                                <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                                                    <span className="text-slate-500">{m.description}</span>
                                                    <span className="text-emerald-600">+{formatCurrency(m.total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ASET' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assets.map((asset) => {
                                const depreciation = calculateDepreciation(asset);
                                const currentValue = asset.purchasePrice - depreciation;
                                return (
                                    <div 
                                        key={asset.id} 
                                        onClick={() => {
                                            setSelectedAssetId(asset.id);
                                            setIsMaintenanceModalOpen(true);
                                        }}
                                        className="bg-white p-6 border border-slate-200 shadow-sm space-y-4 group hover:border-amber-500 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.category}</p>
                                                <h4 className="font-bold text-slate-800 mt-1 uppercase tracking-tight">{asset.name}</h4>
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border",
                                                asset.condition === 'BAIK' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                asset.condition === 'SERVIS' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {asset.condition}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Nilai Awal</p>
                                                <p className="text-xs font-black text-slate-600">{formatCurrency(asset.purchasePrice)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Penyusutan</p>
                                                <p className="text-xs font-black text-rose-500">-{formatCurrency(depreciation)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 p-3 flex justify-between items-center">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Nilai Buku Saat Ini</span>
                                            <span className="text-xs font-black text-amber-500">{formatCurrency(currentValue)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setIsAssetModalOpen(false)} // Placeholder for add asset
                                className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400"
                            >
                                <Plus size={32} />
                                <span className="text-[10px] font-bold uppercase mt-3">Tambah Aset Inventaris</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <Modal isOpen={isModalAwalOpen} onClose={() => setIsModalAwalOpen(false)} title="Suntik Modal Usaha">
                <form onSubmit={handleAddModalSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nominal Suntik Modal</label>
                        <input name="amount" required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Keterangan</label>
                        <input name="description" required type="text" placeholder="Contoh: Tambahan Modal Sendiri" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em]">Simpan Modal</button>
                </form>
            </Modal>

            <Modal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} title="Update Status & Histori Aset">
                {selectedAssetId && (
                    <div className="space-y-8">
                        <div className="p-4 bg-slate-900 border border-slate-800">
                            <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">{assets.find(a => a.id === selectedAssetId)?.name}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Update Kondisi & Histori Perawatan</p>
                        </div>
                        <form onSubmit={handleUpdateStatus} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Kondisi Terbaru</label>
                                    <select name="status" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                                        <option value="BAIK">BAIK</option>
                                        <option value="SERVIS">SERVIS</option>
                                        <option value="RUSAK">RUSAK</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Catatan Update</label>
                                    <input name="notes" type="text" placeholder="Detail perbaikan..." className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em]">Simpan Pembaruan</button>
                        </form>
                        <div className="border-t border-slate-200 pt-6">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Histori Perawatan</h5>
                            <div className="max-h-[150px] overflow-y-auto border border-slate-100">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-slate-50 border-b border-slate-200 uppercase font-black">
                                        <tr><th className="px-3 py-2">Tgl</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Oleh</th><th className="px-3 py-2">Catatan</th></tr>
                                    </thead>
                                    <tbody className="font-bold text-slate-600">
                                        {assets.find(a => a.id === selectedAssetId)?.maintenanceHistory.map((h, i) => (
                                            <tr key={i} className="border-b border-slate-50">
                                                <td className="px-3 py-2">{new Date(h.date).toLocaleDateString('id-ID')}</td>
                                                <td className="px-3 py-2"><span className={cn("px-1.5 py-0.5 rounded-sm text-[8px]", h.status === 'BAIK' ? "bg-emerald-50 text-emerald-600" : h.status === 'SERVIS' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>{h.status}</span></td>
                                                <td className="px-3 py-2">{h.user}</td>
                                                <td className="px-3 py-2 text-slate-400">{h.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
