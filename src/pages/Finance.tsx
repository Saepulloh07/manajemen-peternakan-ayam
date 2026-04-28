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

const bukuTelurData = [
  { tgl: '01/03/2026', nProd: 28, nJual: 0, nFree: 1, rProd: 0, rJual: 0, rFree: 0, pProd: 4, pBuang: 4, total: 33, hdp: 0.14, ket: '' },
  { tgl: '02/03/2026', nProd: 46, nJual: 0, nFree: 1, rProd: 0, rJual: 0, rFree: 0, pProd: 7, pBuang: 7, total: 54, hdp: 0.19, ket: '' },
  { tgl: '03/03/2026', nProd: 28, nJual: 0, nFree: 2, rProd: 0, rJual: 0, rFree: 0, pProd: 1, pBuang: 1, total: 31, hdp: 0.79, ket: '' },
  { tgl: '04/03/2026', nProd: 33, nJual: 0, nFree: 2, rProd: 0, rJual: 0, rFree: 0, pProd: 6, pBuang: 6, total: 41, hdp: 1.05, ket: '' },
  { tgl: '05/03/2026', nProd: 39, nJual: 0, nFree: 1, rProd: 0, rJual: 0, rFree: 0, pProd: 4, pBuang: 4, total: 44, hdp: 1.13, ket: '' },
  { tgl: '06/03/2026', nProd: 48, nJual: 0, nFree: 3, rProd: 0, rJual: 0, rFree: 0, pProd: 5, pBuang: 5, total: 56, hdp: 1.44, ket: '' },
  { tgl: '07/03/2026', nProd: 72, nJual: 0, nFree: 1, rProd: 0, rJual: 0, rFree: 0, pProd: 3, pBuang: 3, total: 76, hdp: 1.95, ket: '' },
];

const transaksiData = [
  { no: '1', barang: 'Kayu 5x10 = 80 btg (Fuad)', qty: '99,468 cm³', harga: 1800000, total: 17904840, tgl: '30/8', rek: 'Aqqnes' },
  { no: '', barang: 'Kayu 6x12 = 161 btg (Fuad)', qty: '', harga: 0, total: 0, tgl: '', rek: '' },
  { no: '', barang: 'Kayu 5x7 = 265 btg (Fuad)', qty: '', harga: 0, total: 0, tgl: '', rek: '' },
  { no: '2', barang: 'Seng (Versi)', qty: '2 kodi', harga: 900000, total: 1800000, tgl: '5/9', rek: 'Suryani' },
  { no: '', barang: 'Paku atap (Versi)', qty: '2 kotak', harga: 20000, total: 40000, tgl: '5/9', rek: '' },
  { no: '3', barang: 'Paku 1" (Versi)', qty: '13 kg', harga: 195000, total: 195000, tgl: '6/9', rek: '' },
];

const penjualanData = [
  { no: '1', tgl: '3/31/2026', jenis: 'KRC Retak', butir: 47, harga: 1000, total: 47000, ket: 'ecer' },
  { no: '2', tgl: '3/31/2026', jenis: 'KRC', butir: 2400, harga: 1150, total: 2760000, ket: 'Nezi' },
  { no: '', tgl: '4/1/2026', jenis: 'KRC Dingin', butir: 120, harga: 500, total: 60000, ket: 'ecer' },
  { no: '', tgl: '4/1/2026', jenis: 'KRC', butir: 1200, harga: 1220, total: 1464000, ket: 'Rici' },
  { no: '', tgl: '4/1/2026', jenis: 'KS', butir: 600, harga: 1320, total: 792000, ket: 'Rici' },
  { no: '3', tgl: '4/5/2026', jenis: 'KS Retak', butir: 60, harga: 834, total: 50000, ket: 'ecer' },
  { no: '4', tgl: '4/8/2026', jenis: 'KS', butir: 7200, harga: 1320, total: 9504000, ket: 'Rici' },
  { no: '', tgl: '4/14/2026', jenis: 'BM', butir: 4500, harga: 1445, total: 6502500, ket: 'Rapit' },
  { no: '', tgl: '4/15/2026', jenis: 'BM', butir: 7500, harga: 1450, total: 10875000, ket: 'Rici' },
  { no: '', tgl: '4/17/2026', jenis: 'BM', butir: 2100, harga: 1450, total: 3045000, ket: 'Rapit' },
  { no: '', tgl: '4/18/2026', jenis: 'RETAK', butir: 495, harga: 868, total: 430000, ket: 'ecer' },
  { no: '5', tgl: '4/19/2026', jenis: 'RETAK', butir: 90, harga: 834, total: 75000, ket: 'ecer' },
  { no: '', tgl: '4/19/2026', jenis: 'BM', butir: 5700, harga: 1450, total: 8265000, ket: 'Rici' },
];

export default function Finance() {
  const { activeHouse } = useHouse();
  const [activeTab, setActiveTab] = useState<'BUKU_TELUR' | 'BUKU_TRANSAKSI' | 'ASET'>('BUKU_TELUR');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

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
    sheet1.getCell('A1').value = 'Buku Telur';
    sheet1.getCell('A1').font = { bold: true, size: 14 };

    sheet1.mergeCells('A2:L2');
    sheet1.getCell('A2').value = 'Periode 25 Oktober 2025';

    sheet1.getCell('A4').value = 'Populasi';
    sheet1.getCell('B4').value = 3875;

    // Headers - Row 6
    sheet1.getCell('A6').value = 'Tgl';
    sheet1.mergeCells('A6:A7');

    sheet1.getCell('B6').value = 'Normal';
    sheet1.mergeCells('B6:D6');

    sheet1.getCell('E6').value = 'Retak';
    sheet1.mergeCells('E6:G6');

    sheet1.getCell('H6').value = 'Pecah/Abnormal';
    sheet1.mergeCells('H6:I6');

    sheet1.getCell('J6').value = 'Total Produksi';
    sheet1.mergeCells('J6:J7');

    sheet1.getCell('K6').value = '%';
    sheet1.mergeCells('K6:K7');

    sheet1.getCell('L6').value = 'Ket';
    sheet1.mergeCells('L6:L7');

    // Headers - Row 7
    sheet1.getCell('B7').value = 'Produksi';
    sheet1.getCell('C7').value = 'Penjualan';
    sheet1.getCell('D7').value = 'Free';
    sheet1.getCell('E7').value = 'Produksi';
    sheet1.getCell('F7').value = 'Penjualan';
    sheet1.getCell('G7').value = 'Free';
    sheet1.getCell('H7').value = 'Produksi';
    sheet1.getCell('I7').value = 'Buang';

    const cols1 = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    cols1.forEach(col => {
      const c6 = sheet1.getCell(`${col}6`);
      const c7 = sheet1.getCell(`${col}7`);
      
      c6.alignment = { horizontal: 'center', vertical: 'middle' };
      c6.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      c6.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      
      c7.alignment = { horizontal: 'center', vertical: 'middle' };
      c7.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c7.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      c7.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    sheet1.columns = [
        { width: 15 }, { width: 10 }, { width: 10 }, { width: 10 },
        { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
        { width: 10 }, { width: 15 }, { width: 10 }, { width: 15 }
    ];

    let rowStart = 8;
    bukuTelurData.forEach((row, i) => {
      const r = rowStart + i;
      sheet1.getCell(`A${r}`).value = row.tgl;
      sheet1.getCell(`B${r}`).value = row.nProd || '';
      sheet1.getCell(`C${r}`).value = row.nJual || '';
      sheet1.getCell(`D${r}`).value = row.nFree || '';
      sheet1.getCell(`E${r}`).value = row.rProd || '';
      sheet1.getCell(`F${r}`).value = row.rJual || '';
      sheet1.getCell(`G${r}`).value = row.rFree || '';
      sheet1.getCell(`H${r}`).value = row.pProd || '';
      sheet1.getCell(`I${r}`).value = row.pBuang || '';
      sheet1.getCell(`J${r}`).value = row.total;
      sheet1.getCell(`K${r}`).value = row.hdp;
      sheet1.getCell(`L${r}`).value = row.ket;
      
      cols1.forEach(col => {
          const c = sheet1.getCell(`${col}${r}`);
          c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // --- SHEET 2: TRANSAKSI ---
    const sheet2 = workbook.addWorksheet('TRANSAKSI');
    
    sheet2.getCell('A1').value = 'PENGELUARAN';
    sheet2.getCell('A1').font = { bold: true };
    sheet2.getCell('I1').value = 'PEMASUKAN';
    sheet2.getCell('I1').font = { bold: true };
    
    sheet2.getCell('A2').value = 'No.';
    sheet2.getCell('B2').value = 'Barang/Jasa';
    sheet2.getCell('C2').value = 'Qty';
    sheet2.getCell('D2').value = 'Harga satuan';
    sheet2.getCell('E2').value = 'Total Harga';
    sheet2.getCell('F2').value = 'Tgl Bayar';
    sheet2.getCell('G2').value = 'Rek';
    
    sheet2.getCell('I2').value = 'MODAL';
    
    const cols2 = ['A','B','C','D','E','F','G','I'];
    cols2.forEach(col => {
      const c = sheet2.getCell(`${col}2`);
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    });

    sheet2.columns = [
        { width: 5 }, { width: 35 }, { width: 15 }, { width: 15 },
        { width: 20 }, { width: 10 }, { width: 15 }, { width: 5 }, { width: 15 }
    ];

    let rowStart2 = 3;
    transaksiData.forEach((row, i) => {
      const r = rowStart2 + i;
      sheet2.getCell(`A${r}`).value = row.no;
      sheet2.getCell(`B${r}`).value = row.barang;
      sheet2.getCell(`C${r}`).value = row.qty;
      sheet2.getCell(`D${r}`).value = row.harga || '';
      sheet2.getCell(`E${r}`).value = row.total || '';
      sheet2.getCell(`F${r}`).value = row.tgl;
      sheet2.getCell(`G${r}`).value = row.rek;
      
      ['A','B','C','D','E','F','G'].forEach(col => {
          sheet2.getCell(`${col}${r}`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });
    });

    sheet2.getCell('I3').value = 30000000;
    sheet2.getCell('I4').value = 150000000;
    sheet2.getCell('I5').value = 75000000;
    sheet2.getCell('I6').value = 60000000;

    // --- SHEET 3: PENJUALAN ---
    const sheet3 = workbook.addWorksheet('PENJUALAN');
    sheet3.mergeCells('A1:G1');
    sheet3.getCell('A1').value = 'PENJUALAN';
    sheet3.getCell('A1').font = { bold: true, size: 14 };
    sheet3.getCell('A1').alignment = { horizontal: 'center' };

    sheet3.getCell('A2').value = 'No.';
    sheet3.getCell('B2').value = 'Tgl';
    sheet3.getCell('C2').value = 'Jenis Telur';
    sheet3.getCell('D2').value = 'Butir';
    sheet3.getCell('E2').value = 'Harga Satuan';
    sheet3.getCell('F2').value = 'Total Harga';
    sheet3.getCell('G2').value = 'Ket';

    const cols3 = ['A','B','C','D','E','F','G'];
    cols3.forEach(col => {
      const c = sheet3.getCell(`${col}2`);
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    sheet3.columns = [
      { width: 5 }, { width: 15 }, { width: 20 }, { width: 10 },
      { width: 15 }, { width: 20 }, { width: 15 }
    ];

    penjualanData.forEach((row, i) => {
      const r = 3 + i;
      sheet3.getCell(`A${r}`).value = row.no;
      sheet3.getCell(`B${r}`).value = row.tgl;
      sheet3.getCell(`C${r}`).value = row.jenis;
      sheet3.getCell(`D${r}`).value = row.butir;
      sheet3.getCell(`E${r}`).value = row.harga;
      sheet3.getCell(`F${r}`).value = row.total;
      sheet3.getCell(`G${r}`).value = row.ket;

      cols3.forEach(col => {
        sheet3.getCell(`${col}${r}`).border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        sheet3.getCell(`${col}${r}`).alignment = { horizontal: col === 'A' || col === 'B' || col === 'G' ? 'center' : 'left' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Laporan_Kandang_2.xlsx');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan & Aset</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola laporan buku telur harian, transaksi dan inventaris aset.</p>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto">
          <div className="flex bg-white p-1 border border-slate-200 shadow-sm min-w-max">
            <button 
                onClick={() => setActiveTab('BUKU_TELUR')}
                className={cn(
                    "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'BUKU_TELUR' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                )}
            >
                Buku Telur
            </button>
            <button 
                onClick={() => setActiveTab('BUKU_TRANSAKSI')}
                className={cn(
                    "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'BUKU_TRANSAKSI' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                )}
            >
                Transaksi
            </button>
            <button 
                onClick={() => setActiveTab('ASET')}
                className={cn(
                    "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === 'ASET' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                )}
            >
                Inventaris Aset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 opacity-50"></div>
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Penyusutan (Restock Aset)</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-100 relative">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ayam (2 Thn Cycle)</p>
                            <p className="text-xl font-black italic tracking-tighter text-slate-800">{formatCurrency(12500000)}</p>
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500/20"></div>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 relative">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kandang (10 Thn Cycle)</p>
                            <p className="text-xl font-black italic tracking-tighter text-slate-800">{formatCurrency(4850000)}</p>
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-500/20"></div>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic opacity-80 uppercase tracking-tight">
                        "Dana ini otomatis disisihkan dari laba bulanan untuk memastikan Anda siap restock saat afkir."
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 p-6 text-white space-y-6 border border-slate-800 shadow-xl">
                <div className="flex items-center space-x-2 text-amber-500">
                    <BookOpen size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Sinkronisasi Data</span>
                </div>
                <button 
                  onClick={handleExportExcel}
                  className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-sm border border-slate-700 flex items-center justify-center space-x-3 transition-all group"
                >
                    <Download size={18} className="group-hover:text-amber-500 transition-colors" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">Download Laporan Lengkap</span>
                </button>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
            {activeTab === 'BUKU_TELUR' && (
                <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight">Buku Telur Produksi</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Laporan harian & performa HDP</p>
                        </div>
                        <button 
                            onClick={handleExportExcel}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-sm shadow-md hover:bg-emerald-700 transition-all group font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2"
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
                                    <th rowSpan={2} className="px-3 py-3 border border-slate-700">Ket</th>
                                </tr>
                                <tr className="bg-slate-800 text-slate-300 text-[8px] font-bold uppercase tracking-wider">
                                    <th className="px-2 py-2 border border-slate-700">Produksi</th>
                                    <th className="px-2 py-2 border border-slate-700">Penjualan</th>
                                    <th className="px-2 py-2 border border-slate-700">Free</th>
                                    <th className="px-2 py-2 border border-slate-700">Produksi</th>
                                    <th className="px-2 py-2 border border-slate-700">Penjualan</th>
                                    <th className="px-2 py-2 border border-slate-700">Free</th>
                                    <th className="px-2 py-2 border border-slate-700">Produksi</th>
                                    <th className="px-2 py-2 border border-slate-700">Buang</th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px] text-slate-700 font-medium">
                                {bukuTelurData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                        <td className="px-3 py-3 border-r border-slate-100 font-bold whitespace-nowrap text-left">{row.tgl}</td>
                                        <td className="px-2 py-3 border-r border-slate-100 text-slate-900 font-bold">{row.nProd || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-100">{row.nJual || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-200">{row.nFree || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-100 text-amber-600 font-bold">{row.rProd || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-100">{row.rJual || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-200">{row.rFree || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-100 text-rose-600 font-bold">{row.pProd || '-'}</td>
                                        <td className="px-2 py-3 border-r border-slate-200">{row.pBuang || '-'}</td>
                                        <td className="px-3 py-3 border-r border-slate-100 font-black italic text-emerald-600">{row.total}</td>
                                        <td className="px-3 py-3 border-r border-slate-100 font-bold">{row.hdp}%</td>
                                        <td className="px-3 py-3 text-slate-400">{row.ket || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'BUKU_TRANSAKSI' && (
                 <div className="space-y-6">
                    <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight flex items-center">
                                    <Receipt className="mr-2 text-slate-400" size={20} />
                                    Laporan Transaksi
                                </h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Pengeluaran & Pemasukan Modal</p>
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-1 xl:grid-cols-4 gap-6">
                            <div className="xl:col-span-3 overflow-x-auto border border-slate-200">
                                <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 text-white text-[10px] font-black uppercase tracking-widest">
                                    Pengeluaran Operasional
                                </div>
                                <table className="w-full text-left min-w-max">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-3 py-2 border-r border-slate-200">No.</th>
                                            <th className="px-3 py-2 border-r border-slate-200">Barang/Jasa</th>
                                            <th className="px-3 py-2 border-r border-slate-200">Qty</th>
                                            <th className="px-3 py-2 border-r border-slate-200 text-right">Harga Satuan</th>
                                            <th className="px-3 py-2 border-r border-slate-200 text-right">Total Harga</th>
                                            <th className="px-3 py-2 border-r border-slate-200">Tgl Bayar</th>
                                            <th className="px-3 py-2">Rek</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] text-slate-700 font-medium">
                                        {transaksiData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                                <td className="px-3 py-3 border-r border-slate-100 text-center font-bold">{row.no}</td>
                                                <td className="px-3 py-3 border-r border-slate-100">{row.barang}</td>
                                                <td className="px-3 py-3 border-r border-slate-100">{row.qty}</td>
                                                <td className="px-3 py-3 border-r border-slate-100 text-right font-mono">{row.harga ? formatCurrency(row.harga) : ''}</td>
                                                <td className="px-3 py-3 border-r border-slate-100 text-right font-mono font-bold text-slate-900">{row.total ? formatCurrency(row.total) : ''}</td>
                                                <td className="px-3 py-3 border-r border-slate-100">{row.tgl}</td>
                                                <td className="px-3 py-3 font-bold text-slate-500">{row.rek}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="xl:col-span-1 border border-slate-200">
                                <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 text-white text-[10px] font-black uppercase tracking-widest">
                                    Pemasukan (Modal)
                                </div>
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-3 py-2 text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] text-slate-700 font-bold font-mono">
                                        {[30000000, 150000000, 75000000, 60000000].map((modal, i) => (
                                            <tr key={i} className="border-b border-slate-100 bg-emerald-50">
                                                <td className="px-3 py-3 text-emerald-700 italic">+ {formatCurrency(modal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 uppercase tracking-tight flex items-center">
                                    <ShoppingCart className="mr-2 text-slate-400" size={20} />
                                    Laporan Penjualan
                                </h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Rekapitulasi Penjualan Telur</p>
                            </div>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-slate-200 min-w-max">
                                <thead>
                                    <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest border-b border-slate-700">
                                        <th className="px-3 py-3 border border-slate-700 text-center">No.</th>
                                        <th className="px-3 py-3 border border-slate-700 text-center">Tgl</th>
                                        <th className="px-3 py-3 border border-slate-700">Jenis Telur</th>
                                        <th className="px-3 py-3 border border-slate-700 text-center">Butir</th>
                                        <th className="px-3 py-3 border border-slate-700 text-right">Harga Satuan</th>
                                        <th className="px-3 py-3 border border-slate-700 text-right">Total Harga</th>
                                        <th className="px-3 py-3 border border-slate-700 text-center">Ket</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] text-slate-700 font-medium">
                                    {penjualanData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                            <td className="px-3 py-3 border-r border-slate-100 text-center font-bold">{row.no}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-center">{row.tgl}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 font-bold">{row.jenis}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-center font-mono">{row.butir}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-right font-mono">{formatCurrency(row.harga)}</td>
                                            <td className="px-3 py-3 border-r border-slate-100 text-right font-mono font-bold text-slate-900">{formatCurrency(row.total)}</td>
                                            <td className="px-3 py-3 text-center uppercase text-[9px] font-bold text-slate-400">{row.ket}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>
            )}

            {activeTab === 'ASET' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { name: 'Mesin Giling Pakan', type: 'Alat Produksi', val: 12000000, condition: 'Baik' },
                        { name: 'Bentor Pengangkut', type: 'Kendaraan Ops', val: 24500000, condition: 'Servis' },
                        { name: 'Timbangan Digital', type: 'Alat Ukur', val: 850000, condition: 'Baik' },
                        { name: 'Pompa Air Jetpump', type: 'Utility', val: 3200000, condition: 'Baik' },
                    ].map((asset, idx) => (
                        <div key={idx} className="bg-white p-6 border border-slate-200 shadow-sm flex justify-between items-center group hover:border-amber-500 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-slate-50 transform rotate-45 translate-x-4 -translate-y-4 border-b border-l border-slate-100"></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.type}</p>
                                <h4 className="font-bold text-slate-800 mt-1 uppercase tracking-tight">{asset.name}</h4>
                                <p className="text-sm font-black italic text-slate-600 mt-2 tracking-tighter">{formatCurrency(asset.val)}</p>
                            </div>
                            <div className="text-right">
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border",
                                    asset.condition === 'Baik' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {asset.condition}
                                </span>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => setIsAssetModalOpen(true)}
                        className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all hover:bg-white group"
                    >
                        <Plus size={32} strokeWidth={1.5} className="group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Registrasi Aset Baru</span>
                    </button>

                    <Modal 
                        isOpen={isAssetModalOpen} 
                        onClose={() => setIsAssetModalOpen(false)} 
                        title="Registrasi Inventaris Aset"
                    >
                        <form onSubmit={handleSaveAsset} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nama Aset</label>
                                <input type="text" placeholder="Contoh: Cooling Pad System" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Kategori</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500">
                                        <option>ALAT PRODUKSI</option>
                                        <option>KENDARAAN</option>
                                        <option>BANGUNAN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nilai Perolehan</label>
                                    <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-500 font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Metode Depresiasi</label>
                                <div className="p-4 bg-slate-50 border border-slate-200 text-[10px] text-slate-500 uppercase font-black tracking-widest italic">
                                    "Eggly menggunakan Metode Garis Lurus (Straight Line) secara default untuk perhitungan Restock Aset."
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.25em] flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl group">
                                    <Plus size={16} className="group-hover:text-amber-500 transition-colors" />
                                    <span>Daftarkan Aset</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
