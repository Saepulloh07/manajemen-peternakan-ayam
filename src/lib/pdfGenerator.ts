import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './utils';

interface SalarySlipData {
  workerName: string;
  role: string;
  baseSalary: number;
  boronganItems: { label: string; amount: number }[];
  totalSalary: number;
  date: string;
}

export const generateSalarySlip = (data: SalarySlipData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('SLIP GAJI KARYAWAN', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('MANAJEMEN PETERNAKAN AYAM PETELUR', pageWidth / 2, 32, { align: 'center' });

  // --- Divider ---
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(20, 40, pageWidth - 20, 40);

  // --- Info Section ---
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700
  
  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Personel:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(data.workerName, 60, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('Jabatan / Role:', 20, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(data.role.replace('_', ' '), 60, 62);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', 120, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, 160, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('ID Transaksi:', 120, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(`PAY-${Date.now().toString().slice(-6)}`, 160, 62);

  // --- Table Breakdown ---
  const tableData = [
    ['Gaji Pokok', '', formatCurrency(data.baseSalary)],
    ...data.boronganItems.map(item => [item.label, '(Borongan)', formatCurrency(item.amount)]),
  ];

  autoTable(doc, {
    startY: 75,
    head: [['Deskripsi Kompensasi', 'Keterangan', 'Jumlah']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // --- Total Section ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(120, finalY, pageWidth - 140, 15, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL DITERIMA:', 125, finalY + 10);
  doc.text(formatCurrency(data.totalSalary), pageWidth - 25, finalY + 10, { align: 'right' });

  // --- Footer / Signature ---
  const footerY = 250;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Terima kasih atas dedikasi Anda.', pageWidth / 2, footerY - 20, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('Owner Farm', 40, footerY);
  doc.line(20, footerY + 15, 70, footerY + 15);
  
  doc.text('Penerima', pageWidth - 70, footerY);
  doc.line(pageWidth - 80, footerY + 15, pageWidth - 30, footerY + 15);

  // Save the PDF
  doc.save(`Slip_Gaji_${data.workerName.replace(' ', '_')}_${data.date}.pdf`);
};
