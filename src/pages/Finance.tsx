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
    ShoppingCart,
    Edit2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
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
    const { productionLogs, salesLogs, transactions, addModalAwal, updateTransaction, assets, updateAssetStatus, addAsset, updateAsset, farmSettings, addTransaction } = useGlobalData();

    const [activeTab, setActiveTab] = useState<'BUKU_TELUR' | 'BUKU_TRANSAKSI' | 'ASET'>('BUKU_TELUR');
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any | null>(null);
    const [assetOwnershipType, setAssetOwnershipType] = useState<'BELI' | 'MILIK_PRIBADI'>('BELI');
    const [isModalAwalOpen, setIsModalAwalOpen] = useState(false);
    const [editingModal, setEditingModal] = useState<any | null>(null);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // Pagination State
    const [prodPage, setProdPage] = useState(1);
    const [txPage, setTxPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // --- Filtering Data for Active House ---
    const filteredProdLogs = productionLogs.filter(p => p.houseId === activeHouse?.id);
    const filteredSalesLogs = salesLogs.filter(s => s.houseId === activeHouse?.id);

    // Transaksi dipisah per kandang
    const houseTransactions = transactions.filter(t => t.houseId === activeHouse?.id);
    const expenseTransactions = houseTransactions.filter(t => t.type === 'EXPENSE');
    const incomeTransactions = houseTransactions.filter(t => t.type === 'INCOME');
    const modalTransactions = houseTransactions.filter(t => t.type === 'MODAL');

    const houseAssets = assets.filter(a => a.houseId === activeHouse?.id);

    // --- Total Calculations ---
    const totalProduction = filteredProdLogs.reduce((acc, curr) => acc + curr.totalKg, 0);
    const totalSalesTelur = filteredSalesLogs.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = expenseTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const totalModalAwal = modalTransactions.reduce((acc, curr) => acc + curr.total, 0);

    // Accounting Logic
    const totalAllRevenue = totalIncome; // totalIncome includes sales (auto-added to transactions)
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
        
        const salvageValue = asset.salvageValue || 0;
        const depreciableAmount = asset.purchasePrice - salvageValue;
        
        // Garis Lurus: (Harga Beli - Nilai Sisa) / Umur Ekonomis
        const totalDepreciation = (depreciableAmount / (asset.expectedLifeYears * 12)) * Math.max(0, diffMonths);
        return Math.min(depreciableAmount, totalDepreciation);
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
        const formData = new FormData(e.target as HTMLFormElement);
        
        const name = formData.get('name') as string;
        const category = formData.get('category') as string;
        const purchasePrice = Number(formData.get('purchasePrice'));
        const salvageValue = Number(formData.get('salvageValue') || 0);
        const purchaseDate = formData.get('purchaseDate') as string;
        const expectedLifeYears = Number(formData.get('expectedLifeYears'));

        if (editingAsset) {
            updateAsset(editingAsset.id, {
                name,
                category,
                purchasePrice,
                salvageValue,
                purchaseDate,
                expectedLifeYears,
            });
            Swal.fire({ title: 'Berhasil!', text: 'Aset telah diperbarui.', icon: 'success', confirmButtonColor: '#0f172a' });
        } else {
            addAsset({
                houseId: activeHouse?.id || '',
                name,
                category,
                purchasePrice,
                salvageValue,
                purchaseDate,
                expectedLifeYears,
                condition: 'BAIK'
            });

            // Hanya catat ke buku kas jika jenis perolehan adalah BELI (bukan Milik Pribadi)
            if (assetOwnershipType === 'BELI') {
                addTransaction({
                    houseId: activeHouse?.id,
                    date: purchaseDate,
                    description: `Pembelian Aset: ${name} (${category})`,
                    qty: '1 Unit',
                    price: purchasePrice,
                    total: purchasePrice,
                    account: 'Kas Tunai',
                    type: 'EXPENSE',
                    category: 'Aset'
                });
                Swal.fire({ title: 'Berhasil!', text: 'Aset telah didaftarkan dan tercatat sebagai pengeluaran di Buku Kas.', icon: 'success', confirmButtonColor: '#0f172a' });
            } else {
                Swal.fire({ title: 'Berhasil!', text: 'Aset (Milik Pribadi) telah didaftarkan. Tidak dicatat sebagai pembelian di Buku Kas.', icon: 'success', confirmButtonColor: '#0f172a' });
            }
        }

        setIsAssetModalOpen(false);
        setAssetOwnershipType('BELI');
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

        // --- SHEET 2: TRANSAKSI (BUKU KAS) ---
        const sheet2 = workbook.addWorksheet('BUKU KAS');
        sheet2.getCell('A1').value = 'LAPORAN TRANSAKSI OPERASIONAL (BUKU KAS)';
        sheet2.getCell('A1').font = { bold: true, size: 14 };
        
        sheet2.getRow(3).values = ['No.', 'Keterangan', 'Qty', 'Tipe', 'Masuk (Debit)', 'Keluar (Kredit)', 'Tanggal', 'Akun'];
        sheet2.getRow(3).eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        const allOperasional = houseTransactions.filter(t => t.type !== 'MODAL');
        let debitTotal = 0;
        let kreditTotal = 0;

        allOperasional.forEach((row, i) => {
            const r = 4 + i;
            const isIncome = row.type === 'INCOME';
            if (isIncome) debitTotal += row.total;
            else kreditTotal += row.total;

            sheet2.getRow(r).values = [
                i + 1, row.description, row.qty, row.type, 
                isIncome ? row.total : 0, 
                !isIncome ? row.total : 0, 
                new Date(row.date).toLocaleDateString('id-ID'), row.account
            ];
            sheet2.getCell(`E${r}`).numFmt = '#,##0';
            sheet2.getCell(`F${r}`).numFmt = '#,##0';
        });
        const lastTxRow = 4 + allOperasional.length;
        sheet2.getCell(`D${lastTxRow}`).value = 'TOTAL';
        sheet2.getCell(`E${lastTxRow}`).value = debitTotal;
        sheet2.getCell(`F${lastTxRow}`).value = kreditTotal;
        sheet2.getCell(`D${lastTxRow}`).font = { bold: true };
        sheet2.getCell(`E${lastTxRow}`).font = { bold: true };
        sheet2.getCell(`F${lastTxRow}`).font = { bold: true };
        sheet2.getCell(`E${lastTxRow}`).numFmt = '#,##0';
        sheet2.getCell(`F${lastTxRow}`).numFmt = '#,##0';

        // --- SHEET 3: MODAL ---
        const sheet3 = workbook.addWorksheet('MODAL');
        sheet3.getCell('A1').value = 'RINCIAN MODAL MASUK';
        sheet3.getRow(3).values = ['No.', 'Sumber', 'Nominal', 'Tanggal'];
        modalTransactions.forEach((m, i) => {
            sheet3.getRow(4 + i).values = [i + 1, m.description, m.total, new Date(m.date).toLocaleDateString('id-ID')];
        });

        // --- SHEET 4: ASET & PENYUSUTAN ---
        const sheet4 = workbook.addWorksheet('ASET');
        sheet4.getCell('A1').value = 'DAFTAR ASET & PENYUSUTAN';
        sheet4.getCell('A1').font = { bold: true, size: 14 };
        sheet4.getRow(3).values = ['No.', 'Nama Aset', 'Kategori', 'Tgl Beli', 'Nilai Beli', 'Kondisi', 'Penyusutan', 'Nilai Buku'];
        sheet4.getRow(3).eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });
        houseAssets.forEach((asset, i) => {
            const dep = calculateDepreciation(asset);
            const r = 4 + i;
            sheet4.getRow(r).values = [
                i + 1, asset.name, asset.category, 
                new Date(asset.purchaseDate).toLocaleDateString('id-ID'), 
                asset.purchasePrice, asset.condition, dep, asset.purchasePrice - dep
            ];
            sheet4.getCell(`E${r}`).numFmt = '#,##0';
            sheet4.getCell(`G${r}`).numFmt = '#,##0';
            sheet4.getCell(`H${r}`).numFmt = '#,##0';
        });
        
        // Add Master Assets from FarmSettings
        // Add Master Assets from FarmSettings

        let rIndex = 4 + assets.length;
        const addMasterAsset = (name: string, category: string, value: number, salvageValue: number, years: number) => {
            const depreciableAmount = Math.max(0, value - salvageValue);
            // Untuk excel master kita tampilkan beban penyusutan per tahun
            const depPerYear = years ? depreciableAmount / years : 0;
            sheet4.getRow(rIndex).values = [
                rIndex - 3, name, category, '-', value, 'BAIK', depPerYear, value - depPerYear
            ];
            sheet4.getCell(`E${rIndex}`).numFmt = '#,##0';
            sheet4.getCell(`G${rIndex}`).numFmt = '#,##0';
            sheet4.getCell(`H${rIndex}`).numFmt = '#,##0';
            rIndex++;
        };
        
        addMasterAsset('Kandang & Bangunan (Master)', 'PROPERTI', farmSettings?.cageValueTotal || 0, farmSettings?.cageSalvageValue || 0, farmSettings?.cageLifeYears || 0);
        addMasterAsset('Peralatan Farm (Master)', 'ALAT PRODUKSI', farmSettings?.equipmentValueTotal || 0, farmSettings?.equipmentSalvageValue || 0, farmSettings?.equipmentLifeYears || 0);
        
        // Depresiasi Aset Biologis (Ayam Pullet)
        // Beban deplesi per tahun = (Biaya Perolehan - Nilai Afkir) / Umur Produktif
        addMasterAsset('Ayam Pullet (Master Aset Biologis)', 'FLOCK / BIOLOGIS', farmSettings?.layerValueTotal || 0, farmSettings?.layerSalvageValue || 0, farmSettings?.layerLifeYears || 0);


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Laporan_Keuangan_Eggly.xlsx');
    };

    const handleAddModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = Number(formData.get('amount'));
        const desc = formData.get('description') as string;

        if (amount > 0) {
            if (editingModal) {
                updateTransaction(editingModal.id, { total: amount, price: amount, description: desc });
                Swal.fire({ title: 'Berhasil!', text: 'Modal telah diubah.', icon: 'success', confirmButtonColor: '#0f172a' });
            } else {
                addModalAwal(amount, desc, activeHouse?.id);
                Swal.fire({ title: 'Berhasil!', text: 'Modal telah ditambahkan.', icon: 'success', confirmButtonColor: '#0f172a' });
            }
            setIsModalAwalOpen(false);
        }
    };

    // Pagination Helpers
    const paginatedProdLogs = filteredProdLogs.slice((prodPage - 1) * ITEMS_PER_PAGE, prodPage * ITEMS_PER_PAGE);
    const paginatedTxs = transactions.filter(t => t.type !== 'MODAL').slice((txPage - 1) * ITEMS_PER_PAGE, txPage * ITEMS_PER_PAGE);

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
                            onClick={() => { setEditingModal(null); setIsModalAwalOpen(true); }}
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
                            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight italic">Buku Telur Produksi</h3>
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
                                        {paginatedProdLogs.map((row, idx) => (
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
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Page {prodPage} of {Math.ceil(filteredProdLogs.length / ITEMS_PER_PAGE) || 1}</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => setProdPage(Math.max(1, prodPage - 1))} disabled={prodPage === 1} className="p-1 bg-white border border-slate-200 rounded-sm disabled:opacity-50"><ChevronLeft size={16} /></button>
                                    <button onClick={() => setProdPage(Math.min(Math.ceil(filteredProdLogs.length / ITEMS_PER_PAGE), prodPage + 1))} disabled={prodPage >= Math.ceil(filteredProdLogs.length / ITEMS_PER_PAGE)} className="p-1 bg-white border border-slate-200 rounded-sm disabled:opacity-50"><ChevronRight size={16} /></button>
                                </div>
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
                                                {paginatedTxs.map((t, idx) => (
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
                                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 xl:col-span-3">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Page {txPage} of {Math.ceil(transactions.filter(t => t.type !== 'MODAL').length / ITEMS_PER_PAGE) || 1}</span>
                                        <div className="flex space-x-2">
                                            <button onClick={() => setTxPage(Math.max(1, txPage - 1))} disabled={txPage === 1} className="p-1 bg-white border border-slate-200 rounded-sm disabled:opacity-50"><ChevronLeft size={16} /></button>
                                            <button onClick={() => setTxPage(Math.min(Math.ceil(transactions.filter(t => t.type !== 'MODAL').length / ITEMS_PER_PAGE), txPage + 1))} disabled={txPage >= Math.ceil(transactions.filter(t => t.type !== 'MODAL').length / ITEMS_PER_PAGE)} className="p-1 bg-white border border-slate-200 rounded-sm disabled:opacity-50"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="xl:col-span-1 bg-slate-50 p-4 border border-slate-200">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3">Modal Masuk</h4>
                                        <div className="space-y-3">
                                            {modalTransactions.map((m, i) => (
                                                <div key={i} className="flex justify-between items-center text-[11px] font-bold group">
                                                    <span className="text-slate-500">{m.description}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-emerald-600">+{formatCurrency(m.total)}</span>
                                                        <button onClick={() => { setEditingModal(m); setIsModalAwalOpen(true); }} className="text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={12} /></button>
                                                    </div>
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
                            {houseAssets.map((asset) => {
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
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.category}</p>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); setIsAssetModalOpen(true); }} className="text-slate-400 hover:text-amber-500"><Edit2 size={12} /></button>
                                                </div>
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
                                onClick={() => { setEditingAsset(null); setAssetOwnershipType('BELI'); setIsAssetModalOpen(true); }}
                                className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
                            >
                                <Plus size={32} />
                                <span className="text-[10px] font-bold uppercase mt-3">Tambah Aset Inventaris</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <Modal isOpen={isAssetModalOpen} onClose={() => { setIsAssetModalOpen(false); setAssetOwnershipType('BELI'); }} title={editingAsset ? "Edit Aset" : "Tambah Aset Baru"}>
                <form onSubmit={handleSaveAsset} className="space-y-6">
                    {/* Ownership Type — hanya tampil saat tambah baru */}
                    {!editingAsset && (
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Jenis Perolehan Aset</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAssetOwnershipType('BELI')}
                                    className={cn(
                                        "p-4 border-2 text-left transition-all rounded-sm",
                                        assetOwnershipType === 'BELI'
                                            ? "border-amber-500 bg-amber-50"
                                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                    )}
                                >
                                    <p className={cn("text-[11px] font-black uppercase tracking-tight", assetOwnershipType === 'BELI' ? 'text-amber-700' : 'text-slate-500')}>🛒 Beli</p>
                                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">Aset dibeli. Akan dicatat sebagai pengeluaran di Buku Kas.</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAssetOwnershipType('MILIK_PRIBADI')}
                                    className={cn(
                                        "p-4 border-2 text-left transition-all rounded-sm",
                                        assetOwnershipType === 'MILIK_PRIBADI'
                                            ? "border-slate-700 bg-slate-900"
                                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                    )}
                                >
                                    <p className={cn("text-[11px] font-black uppercase tracking-tight", assetOwnershipType === 'MILIK_PRIBADI' ? 'text-white' : 'text-slate-500')}>🏠 Milik Pribadi</p>
                                    <p className={cn("text-[9px] mt-1 leading-relaxed", assetOwnershipType === 'MILIK_PRIBADI' ? 'text-slate-400' : 'text-slate-400')}>Aset milik pemilik. Tidak dicatat sebagai pembelian di laporan keuangan.</p>
                                </button>
                            </div>
                            {assetOwnershipType === 'MILIK_PRIBADI' && (
                                <div className="mt-2 p-3 bg-slate-800 border border-slate-700 flex items-start gap-2">
                                    <span className="text-amber-400 text-xs mt-0.5">ℹ</span>
                                    <p className="text-[9px] text-slate-400 leading-relaxed">Aset ini hanya akan didaftarkan ke registri aset (untuk tracking penyusutan & kondisi), namun <strong className="text-white">tidak akan muncul sebagai pengeluaran</strong> di Buku Kas / Laporan Keuangan.</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Aset</label>
                        <input name="name" required type="text" defaultValue={editingAsset?.name} placeholder="Cth: Genset 5000W" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Kategori</label>
                        <select name="category" required defaultValue={editingAsset?.category} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                            <option value="Peralatan Kandang">Peralatan Kandang</option>
                            <option value="Kendaraan">Kendaraan</option>
                            <option value="Elektronik">Elektronik</option>
                            <option value="Tanah & Bangunan">Tanah & Bangunan</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Harga Beli / Estimasi Nilai (IDR)</label>
                            <input name="purchasePrice" required type="number" defaultValue={editingAsset?.purchasePrice} placeholder="Cth: 5000000" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nilai Sisa (Residu)</label>
                            <input name="salvageValue" required type="number" defaultValue={editingAsset?.salvageValue || 0} placeholder="Cth: 500000" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Umur Ekonomis (Thn)</label>
                            <input name="expectedLifeYears" required type="number" defaultValue={editingAsset?.expectedLifeYears} placeholder="Cth: 5" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">{assetOwnershipType === 'BELI' ? 'Tanggal Beli' : 'Tanggal Perolehan / Estimasi'}</label>
                        <input name="purchaseDate" required type="date" defaultValue={editingAsset ? editingAsset.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                    </div>
                    <button type="submit" className={cn(
                        "w-full py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] transition-all",
                        assetOwnershipType === 'MILIK_PRIBADI'
                            ? "bg-slate-800 text-white hover:bg-slate-700"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                    )}>
                        {editingAsset ? "Simpan Perubahan" : assetOwnershipType === 'MILIK_PRIBADI' ? "Daftarkan sebagai Milik Pribadi" : "Daftarkan Aset & Catat Pengeluaran"}
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isModalAwalOpen} onClose={() => setIsModalAwalOpen(false)} title={editingModal ? "Edit Modal Usaha" : "Suntik Modal Usaha"}>
                <form onSubmit={handleAddModalSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nominal Modal</label>
                        <input name="amount" required type="number" defaultValue={editingModal?.total} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Keterangan</label>
                        <input name="description" required type="text" defaultValue={editingModal?.description} placeholder="Contoh: Tambahan Modal Sendiri" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500" />
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
