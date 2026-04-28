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

export enum ItemType {
  RAW_MATERIAL = 'RAW_MATERIAL', // Jagung, Katul, Bungkil
  FINISHED_FEED = 'FINISHED_FEED', // Pakan Jadi
  MEDICINE = 'MEDICINE',
  VACCINE = 'VACCINE',
  OTHER = 'OTHER'
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
  eggCount: number;
  eggWeight: number;
  categoryBreakdown: Record<EggCategory, number>;
  feedConsumed: number;
  fcr: number; // FITUR BARU: FCR Harian
  mortality: number;
  notes?: string;
  workerId: string;
}

export interface InventoryItem {
  id: string;
  houseId: string;
  name: string;
  type: ItemType; // FITUR BARU: Tipe Item
  quantity: number;
  unit: string;
  reorderPoint: number;
  lastPrice: number;
}

export interface Sale {
  id: string;
  houseId: string;
  date: string;
  category: EggCategory | 'NON_EGG';
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  buyerName?: string;
  isFree?: boolean;
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
  category: string;
  amount: number;
  description: string;
  invoiceUrl?: string;
}

// FITUR BARU: Pelacakan Batch / Flock
export interface FlockBatch {
  id: string;
  houseId: string;
  strain: string; // misal: Isa Brown, Lohmann
  arrivalDate: string; // Tanggal DOC/Pullet masuk
  arrivalAgeWeeks: number; // Umur saat datang (DOC = 0, Pullet misal 16)
  initialCount: number;
  currentCount: number;
  isActive: boolean;
}

// FITUR BARU: Jadwal Biosekuriti & Rekam Medis
export interface BiosecurityRecord {
  id: string;
  houseId: string;
  date: string;
  type: 'VACCINE' | 'VITAMIN' | 'SYMPTOM';
  title: string;
  description: string;
  status: 'SCHEDULED' | 'DONE' | 'MISSED';
}

// FITUR BARU: Resep Pakan (Formulasi Ransum)
export interface RecipeIngredient {
  inventoryItemId: string;
  percentage: number; // Persentase bahan dalam 100% campuran
}

export interface FeedRecipe {
  id: string;
  name: string; // misal: "Ransum Layer Umur 30-50 Minggu"
  targetFcr: number;
  ingredients: RecipeIngredient[];
}