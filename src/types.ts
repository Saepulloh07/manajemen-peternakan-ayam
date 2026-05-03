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
  BM = 'BM',
  KRC = 'KRC',
  KRC_RETAK = 'KRC Retak',
  KS = 'KS',
  KS_RETAK = 'KS Retak',
  PELOR = 'PELOR',
  RETAK = 'RETAK',
  PECAH = 'PECAH',
}

// NEW: Cause of death for mortality tracking
export enum MortalityCause {
  DISEASE = 'DISEASE',     // Penyakit
  CULLED = 'CULLED',       // Afkir (voluntary removal)
  OTHER = 'OTHER',         // Lainnya
}

export interface PoultryHouse {
  id: string;
  name: string;
  location?: string;
  capacity: number;           // jumlah ayam maksimum
  area?: number;              // NEW: luas kandang dalam m2
  description?: string;
  managerId?: string;         // NEW: Penanggungjawab
  purchaseDate?: string;      // NEW: For depreciation calculation
  purchasePrice?: number;     // NEW: For depreciation calculation
}

export interface Supplier {
  id: string;
  name: string;
  whatsappNumber: string;
  category: string;
  notes?: string;
}

export interface MasterPrice {
  id: string;
  name: string;
  price: number;
}

export enum ItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',     // Jagung, Katul, Bungkil
  FINISHED_FEED = 'FINISHED_FEED',   // Pakan Jadi hasil mixing
  EGG_STOCK = 'EGG_STOCK',          // Stok telur per kategori (BM, KRC, etc.)
  MEDICINE = 'MEDICINE',
  VACCINE = 'VACCINE',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  name: string;
  username: string;             // NEW: Username
  role: UserRole;
  email: string;
  password?: string;            // plain-text for mock auth
  assignedHouses?: string[];    // WORKER only — which houses they can access
  salary?: number;              // NEW: Penggajian
}

export interface DailyProduction {
  id: string;
  houseId: string;
  date: string;
  eggCount: number;
  eggWeight: number;
  categoryBreakdown: Record<EggCategory, number>;
  feedConsumed: number;
  feedInventoryItemId: string;     // NEW: which inventory feed item was consumed
  fcr: number;
  mortality: number;
  mortalityCause?: MortalityCause; // NEW: why did the birds die
  notes?: string;
  workerId: string;
}

export interface InventoryItem {
  id: string;
  houseId?: string;              // optional – some items are farm-wide
  name: string;
  type: ItemType;
  quantity: number;
  unit: string;
  reorderPoint: number;
  lastPrice: number;
  eggCategory?: EggCategory;     // For EGG_STOCK items — which egg category this represents
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

export enum AssetCondition {
  BAIK = 'BAIK',
  SERVIS = 'SERVIS',
  RUSAK = 'RUSAK'
}

export interface MaintenanceRecord {
  date: string;
  status: AssetCondition;
  user: string;
  notes?: string;
}

export interface Asset {
  id: string;
  houseId: string;
  name: string;
  category: 'ALAT PRODUKSI' | 'KENDARAAN' | 'BANGUNAN' | 'LAINNYA';
  purchaseDate: string;
  purchasePrice: number;
  expectedLifeYears: number;
  salvageValue?: number; // NEW: Nilai sisa / residu
  condition: AssetCondition;
  maintenanceHistory: MaintenanceRecord[];
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

// Flock / Batch tracking
export interface FlockBatch {
  id: string;
  houseId: string;
  strain: string;
  arrivalDate: string;
  arrivalAgeWeeks: number;
  initialCount: number;
  currentCount: number;
  isActive: boolean;
  targetHDP?: number;        // % target Hen-Day Production
  initialCapital?: number;   // modal awal (bibit + biaya DOC)
  docPrice?: number;         // harga DOC per ekor
  notes?: string;
}

// Biosecurity & health records
export interface BiosecurityRecord {
  id: string;
  houseId: string;
  date: string;
  type: 'VACCINE' | 'VITAMIN' | 'SYMPTOM';
  title: string;
  description: string;
  status: 'SCHEDULED' | 'DONE' | 'MISSED';
}

// NEW: Mortality Record — links a production day's death to a cause
export interface MortalityRecord {
  id: string;
  houseId: string;
  date: string;
  count: number;
  cause: MortalityCause;
  productionLogId?: string;
  notes?: string;
}

export enum MutationType {
  ARRIVAL = 'ARRIVAL',       // DOC Masuk
  TRANSFER = 'TRANSFER',     // Mutasi Kandang
  MORTALITY = 'MORTALITY',   // Mortalitas
  CULLING = 'CULLING',       // Afkir
}

export interface PopulationMutation {
  id: string;
  houseId: string;
  targetHouseId?: string;    // For TRANSFER
  date: string;
  type: MutationType;
  count: number;
  pricePerBird?: number;     // For ARRIVAL (purchase) or CULLING (sale)
  totalPrice?: number;
  notes?: string;
  transactionId?: string;    // Linked financial record
}



// Feed Recipe (Formulasi Ransum)
export interface RecipeIngredient {
  inventoryItemId: string;
  percentage: number;
}

export interface FeedRecipe {
  id: string;
  name: string;
  targetFcr: number;
  outputInventoryItemId?: string;  // NEW: which FINISHED_FEED item this recipe produces
  ingredients: RecipeIngredient[];
}

// Analytics computed types
export interface HDPStats {
  date: string;
  hdp: number;           // Hen-Day Production percentage
  standardHDP: number;   // Strain standard for this age
  ageWeeks: number;
}

export interface FlockAnalytics {
  houseId: string;
  cumulativeFCR: number;
  feedIntakePerBirdGrams: number;
  hppPerButir: number;          // Harga Pokok Produksi per butir telur
  totalButir: number;
  totalFeedCost: number;
  netPL?: number;              // SUPER_ADMIN only
}

// Farm-wide operational settings & alert thresholds
export interface FarmSettings {
  // Production targets
  globalTargetHDP: number;           // default % HDP target (e.g. 90)
  mortalityAlertThreshold: number;   // % per month (e.g. 0.5)
  lowHDPAlertThreshold: number;      // % below standard before alert (e.g. 5)
  targetFCR: number;                 // Feed Conversion Ratio Target
  stdFeedIntake: number;             // Standard feed intake per layer (e.g. 115g)
  
  // Master Data
  strains: string[];                 // Isa Brown, Lohmann, etc.
  units: string[];                   // kg, liter, ml, etc.
  wasteFreePercentage: number;       // Target/Limit for Waste & Free Goods
  masterPrices: MasterPrice[];       // NEW: Dynamic master prices
  suppliers: Supplier[];             // NEW: Suppliers data
  
  // Capital
  initialCapital: number;            // global modal awal farm
  // Depreciation
  cageValueTotal: number;            // nilai kandang
  cageLifeYears: number;
  cageSalvageValue: number;          // nilai sisa kandang
  equipmentValueTotal: number;       // nilai peralatan
  equipmentLifeYears: number;
  equipmentSalvageValue: number;     // nilai sisa peralatan
  layerValueTotal: number;           // nilai ayam (pullet)
  layerLifeYears: number;            // umur ekonomis ayam (dalam tahun atau bulan)
  layerSalvageValue: number;         // nilai sisa/afkir ayam
}

export const DEFAULT_FARM_SETTINGS: FarmSettings = {
  globalTargetHDP: 90,
  mortalityAlertThreshold: 0.5,
  lowHDPAlertThreshold: 5,
  targetFCR: 2.1,
  stdFeedIntake: 115,
  strains: ['Isa Brown', 'Lohmann', 'Hy-Line', 'Hisex'],
  units: ['kg', 'liter', 'ml', 'papan', 'butir', 'sak'],
  wasteFreePercentage: 3,
  masterPrices: [
    { id: 'BM', name: 'BM', price: 28500 },
    { id: 'KRC', name: 'KRC', price: 27000 },
    { id: 'KRC_RETAK', name: 'KRC Retak', price: 25000 },
    { id: 'KS', name: 'KS', price: 25000 },
    { id: 'KS_RETAK', name: 'KS Retak', price: 22000 },
    { id: 'PELOR', name: 'PELOR', price: 20000 },
    { id: 'RETAK', name: 'RETAK', price: 15000 },
    { id: 'PECAH', name: 'PECAH', price: 5000 },
    { id: 'NON_EGG', name: 'Limbah/Karung', price: 5000 }
  ],
  suppliers: [],
  initialCapital: 0,
  cageValueTotal: 500000000,
  cageLifeYears: 10,
  cageSalvageValue: 50000000,
  equipmentValueTotal: 50000000,
  equipmentLifeYears: 5,
  equipmentSalvageValue: 5000000,
  layerValueTotal: 100000000,
  layerLifeYears: 2,
  layerSalvageValue: 20000000,
};