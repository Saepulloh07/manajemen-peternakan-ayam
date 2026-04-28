/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
}

export enum EggCategory {
  BM = 'BM',       // Besar
  KRC = 'KRC',     // Kecil/Kandang
  KRC_RETAK = 'KRC Retak',
  KS = 'KS',
  KS_RETAK = 'KS Retak',
  PELOR = 'PELOR',
  RETAK = 'RETAK',
  PECAH = 'PECAH',
}

export interface PoultryHouse {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  assignedHouses?: string[];
}

export interface DailyProduction {
  id: string;
  houseId: string;
  date: string;
  eggCount: number; // Total butir
  eggWeight: number; // Total kg (optional for some metrics, but usually per box)
  categoryBreakdown: Record<EggCategory, number>; // in boxes/papan (kg)
  feedConsumed: number; // in kg
  mortality: number; // number of deaths
  notes?: string;
  workerId: string;
}

export interface InventoryItem {
  id: string;
  houseId: string;
  name: string;
  quantity: number; // in kg for feed
  unit: string;
  reorderPoint: number;
  lastPrice: number;
}

export interface Sale {
  id: string;
  houseId: string;
  date: string;
  category: EggCategory | 'NON_EGG';
  quantity: number; // kg or units
  pricePerUnit: number;
  totalPrice: number;
  buyerName?: string;
  isFree?: boolean; // For tracking 1-2% free allocation
}

export interface Asset {
  id: string;
  name: string;
  purchaseDate: string;
  purchasePrice: number;
  expectedLifeMonths: number;
  currentValue: number;
  type: 'CAGE' | 'BIRD' | 'EQUIPMENT';
}

export interface FinancialRecord {
  id: string;
  houseId: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string; // Feed, Medicine, Vaccine, Salary, Maintenance, etc.
  amount: number;
  description: string;
  invoiceUrl?: string; // For proof of transaction
}
