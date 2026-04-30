import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateHDP(totalEggs: number, liveBirds: number) {
  if (liveBirds <= 0) return 0;
  return (totalEggs / liveBirds) * 100;
}

export function getEggCategoryRange(category: string) {
  switch (category) {
    case 'BM': return 'Besar/Rembah';
    case 'KRC': return 'Kecil/Kandang';
    case 'KRC Retak': return 'Kecil Retak';
    case 'KS': return 'Standar/KS';
    case 'KS Retak': return 'KS Retak';
    case 'PELOR': return 'Pelor (< 16 kg)';
    case 'RETAK': return 'Telur Retak';
    case 'PECAH': return 'Abnormal/Pecah';
    default: return '';
  }
}
