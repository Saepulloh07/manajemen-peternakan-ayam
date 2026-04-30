import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  EggCategory,
  ItemType,
  MortalityCause,
  type InventoryItem,
  type MortalityRecord,
  type FlockAnalytics,
  type FarmSettings,
  DEFAULT_FARM_SETTINGS,
  type Asset,
  AssetCondition
} from './types';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ProductionLog {
  id: string;
  houseId: string;
  date: string;
  eggCount: number;
  feedConsumed: number;          // kg
  feedInventoryItemId: string;   // which inventory item was consumed
  mortality: number;
  mortalityCause?: MortalityCause;
  discardedEggs: number;
  breakdown: Record<string, number>; // EggCategory → kg
  totalKg: number;
  inputTime?: string;            // ISO datetime when record was submitted
  inputBy?: string;              // user name who submitted
}

export interface SalesLog {
  id: string;
  houseId: string;
  date: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
  isFree: boolean;
  customer: string;
}

export interface FinancialTransaction {
  id: string;
  houseId?: string;
  date: string;
  description: string;
  qty: string;
  price: number;
  total: number;
  account: string;
  type: 'INCOME' | 'EXPENSE' | 'MODAL';
  category?: string;
}

// Re-export InventoryItem so consumers can import from GlobalContext
export type { InventoryItem };

// ─── Default Inventory Data ───────────────────────────────────────────────────

const DEFAULT_INVENTORY: InventoryItem[] = [
  // Raw Materials
  { id: 'inv-rm-1', name: 'Jagung Giling',        type: ItemType.RAW_MATERIAL,  quantity: 1500, unit: 'kg', reorderPoint: 200, lastPrice: 4500 },
  { id: 'inv-rm-2', name: 'Bekatul (Dedak)',       type: ItemType.RAW_MATERIAL,  quantity: 800,  unit: 'kg', reorderPoint: 150, lastPrice: 2800 },
  { id: 'inv-rm-3', name: 'Konsentrat Layer',      type: ItemType.RAW_MATERIAL,  quantity: 600,  unit: 'kg', reorderPoint: 250, lastPrice: 12000 },
  { id: 'inv-rm-4', name: 'Bungkil Kedelai (SBM)', type: ItemType.RAW_MATERIAL,  quantity: 400,  unit: 'kg', reorderPoint: 100, lastPrice: 9000 },
  // Finished Feed
  { id: 'inv-ff-1', name: 'Pakan Jadi Layer Mix',  type: ItemType.FINISHED_FEED, quantity: 0,    unit: 'kg', reorderPoint: 500, lastPrice: 0 },
  // Egg Stock — one per category
  { id: 'inv-egg-BM',       name: 'Stok Telur BM',        type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.BM },
  { id: 'inv-egg-KRC',      name: 'Stok Telur KRC',       type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.KRC },
  { id: 'inv-egg-KS',       name: 'Stok Telur KS',        type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.KS },
  { id: 'inv-egg-PELOR',    name: 'Stok Telur Pelor',     type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.PELOR },
  { id: 'inv-egg-RETAK',    name: 'Stok Telur Retak',     type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.RETAK },
  { id: 'inv-egg-PECAH',    name: 'Stok Telur Pecah',     type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.PECAH },
  { id: 'inv-egg-KRC_RETAK',name: 'Stok Telur KRC Retak', type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.KRC_RETAK },
  { id: 'inv-egg-KS_RETAK', name: 'Stok Telur KS Retak',  type: ItemType.EGG_STOCK, quantity: 0, unit: 'kg', reorderPoint: 0, lastPrice: 0, eggCategory: EggCategory.KS_RETAK },
  // Medicine
  { id: 'inv-med-1', name: 'Vitamin C',           type: ItemType.MEDICINE, quantity: 10,  unit: 'botol', reorderPoint: 2, lastPrice: 25000 },
  { id: 'inv-med-2', name: 'Vaksin Newcastle',    type: ItemType.VACCINE,  quantity: 5,   unit: 'vial',  reorderPoint: 1, lastPrice: 75000 },
];

const DEFAULT_RECIPES = [
  {
    id: 'rcp-1',
    name: 'Ransum Layer Umur 30–50 Minggu',
    targetFcr: 2.10,
    outputInventoryItemId: 'inv-ff-1',
    ingredients: [
      { inventoryItemId: 'inv-rm-1', percentage: 50 },
      { inventoryItemId: 'inv-rm-2', percentage: 18 },
      { inventoryItemId: 'inv-rm-3', percentage: 30 },
      { inventoryItemId: 'inv-rm-4', percentage: 2 },
    ],
  },
];

// ─── Context Type ─────────────────────────────────────────────────────────────

interface GlobalContextType {
  // State
  productionLogs: ProductionLog[];
  salesLogs: SalesLog[];
  transactions: FinancialTransaction[];
  inventory: InventoryItem[];
  mortalityRecords: MortalityRecord[];
  recipes: any[];

  // Actions
  saveProduction: (log: Omit<ProductionLog, 'id'>) => void;
  saveSale: (sale: Omit<SalesLog, 'id'>) => void;
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  updateInventory: (id: string, delta: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  addRecipe: (recipe: any) => void;
  updateRecipe: (id: string, updates: any) => void;
  deleteRecipe: (id: string) => void;

  // Computed Analytics helpers
  getHDP: (houseId: string, date: string, currentCount: number) => number;
  getCumulativeFCR: (houseId: string) => number;
  getFeedIntakePerBird: (houseId: string, currentCount: number) => number;
  getFlockAnalytics: (houseId: string, currentCount: number) => FlockAnalytics;

  // Farm Settings
  farmSettings: FarmSettings;
  saveFarmSettings: (settings: Partial<FarmSettings>) => void;
  addModalAwal: (amount: number, description?: string, houseId?: string) => void;

  // Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'maintenanceHistory'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  updateAssetStatus: (id: string, status: AssetCondition, user: string, notes?: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(() => {
    const s = localStorage.getItem('poultry_prod_logs');
    return s ? JSON.parse(s) : [];
  });
  const [salesLogs, setSalesLogs] = useState<SalesLog[]>(() => {
    const s = localStorage.getItem('poultry_sales_logs');
    return s ? JSON.parse(s) : [];
  });
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const s = localStorage.getItem('poultry_transactions');
    return s ? JSON.parse(s) : [
      { id: 'tx-init-1', date: '2026-03-01', description: 'Modal Awal', qty: '1', price: 250000000, total: 250000000, account: 'Mandiri', type: 'MODAL' },
    ];
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const s = localStorage.getItem('poultry_inventory_v2');
    return s ? JSON.parse(s) : DEFAULT_INVENTORY;
  });
  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>(() => {
    const s = localStorage.getItem('poultry_mortality');
    return s ? JSON.parse(s) : [];
  });
  const [recipes, setRecipes] = useState<any[]>(() => {
    const s = localStorage.getItem('poultry_recipes');
    return s ? JSON.parse(s) : DEFAULT_RECIPES;
  });
  const [farmSettings, setFarmSettings] = useState<FarmSettings>(() => {
    const s = localStorage.getItem('poultry_farm_settings');
    return s ? { ...DEFAULT_FARM_SETTINGS, ...JSON.parse(s) } : DEFAULT_FARM_SETTINGS;
  });
  const [assets, setAssets] = useState<Asset[]>(() => {
    const s = localStorage.getItem('poultry_assets');
    return s ? JSON.parse(s) : [
      { id: 'ast-1', name: 'Mesin Giling Pakan', category: 'ALAT PRODUKSI', purchaseDate: '2025-01-10', purchasePrice: 12000000, expectedLifeYears: 5, condition: AssetCondition.BAIK, maintenanceHistory: [] },
      { id: 'ast-2', name: 'Bentor Pengangkut', category: 'KENDARAAN', purchaseDate: '2024-06-15', purchasePrice: 24500000, expectedLifeYears: 4, condition: AssetCondition.SERVIS, maintenanceHistory: [] },
      { id: 'ast-3', name: 'Timbangan Digital', category: 'ALAT PRODUKSI', purchaseDate: '2026-02-20', purchasePrice: 850000, expectedLifeYears: 2, condition: AssetCondition.BAIK, maintenanceHistory: [] },
      { id: 'ast-4', name: 'Pompa Air Jetpump', category: 'LAINNYA', purchaseDate: '2025-11-05', purchasePrice: 3200000, expectedLifeYears: 3, condition: AssetCondition.BAIK, maintenanceHistory: [] },
    ];
  });

  // Persistence
  useEffect(() => { localStorage.setItem('poultry_prod_logs', JSON.stringify(productionLogs)); }, [productionLogs]);
  useEffect(() => { localStorage.setItem('poultry_sales_logs', JSON.stringify(salesLogs)); }, [salesLogs]);
  useEffect(() => { localStorage.setItem('poultry_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('poultry_inventory_v2', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('poultry_mortality', JSON.stringify(mortalityRecords)); }, [mortalityRecords]);
  useEffect(() => { localStorage.setItem('poultry_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('poultry_farm_settings', JSON.stringify(farmSettings)); }, [farmSettings]);
  useEffect(() => { localStorage.setItem('poultry_assets', JSON.stringify(assets)); }, [assets]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const updateInventory = (id: string, delta: number) => {
    setInventory(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => [...prev, { ...itemData, id: `inv-${Date.now()}` }]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const addTransaction = (txData: Omit<FinancialTransaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...txData, id: `tx-${Date.now()}` }]);
  };

  const updateTransaction = (id: string, updates: Partial<FinancialTransaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  };

  /** FIX #1 + #2 + #4: saveProduction now deducts feed, increments egg stock, and logs mortality */
  const saveProduction = (logData: Omit<ProductionLog, 'id'>) => {
    const newLog = { ...logData, id: `prod-${Date.now()}` };
    setProductionLogs(prev => [...prev, newLog]);

    // FIX #1: Deduct the selected feed inventory item
    if (logData.feedInventoryItemId && logData.feedConsumed > 0) {
      updateInventory(logData.feedInventoryItemId, -logData.feedConsumed);
    }

    // FIX #2: Auto-increment each egg category stock (Scoped per house)
    Object.entries(logData.breakdown).forEach(([category, kg]) => {
      if (kg > 0) {
        setInventory(prev => {
          const existing = prev.find(item => item.type === ItemType.EGG_STOCK && item.eggCategory === category && item.houseId === logData.houseId);
          if (existing) {
            return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + kg, houseId: logData.houseId } : item);
          } else {
            return [...prev, {
              id: `inv-egg-${logData.houseId}-${category}-${Date.now()}`,
              houseId: logData.houseId,
              name: `Stok Telur ${category}`,
              type: ItemType.EGG_STOCK,
              quantity: kg,
              unit: 'kg',
              reorderPoint: 0,
              lastPrice: 0,
              eggCategory: category as EggCategory
            }];
          }
        });
      }
    });

    // FIX #4: Save mortality record if applicable
    if (logData.mortality > 0) {
      const mortalityRecord: MortalityRecord = {
        id: `mort-${Date.now()}`,
        houseId: logData.houseId,
        date: logData.date,
        count: logData.mortality,
        cause: logData.mortalityCause || MortalityCause.OTHER,
        productionLogId: newLog.id,
      };
      setMortalityRecords(prev => [...prev, mortalityRecord]);
    }
  };

  const saveSale = (saleData: Omit<SalesLog, 'id'>) => {
    const newSale = { ...saleData, id: `sale-${Date.now()}` };
    setSalesLogs(prev => [...prev, newSale]);

    if (!saleData.isFree) {
      setInventory(prev => prev.map(item => {
        if (item.type === ItemType.EGG_STOCK && item.eggCategory === saleData.category && item.houseId === saleData.houseId) {
          return { ...item, quantity: Math.max(0, item.quantity - saleData.quantity) };
        }
        return item;
      }));

      addTransaction({
        houseId: saleData.houseId,
        date: saleData.date,
        description: `Penjualan Telur: ${saleData.category} - ${saleData.customer || 'Umum'}`,
        qty: `${saleData.quantity} kg`,
        price: saleData.price,
        total: saleData.total,
        account: 'Kas Tunai',
        type: 'INCOME',
        category: 'Penjualan'
      });
    }
  };

  // Recipe CRUD
  const addRecipe = (r: any) => setRecipes(prev => [...prev, { ...r, id: `rcp-${Date.now()}` }]);
  const updateRecipe = (id: string, updates: any) => setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  const deleteRecipe = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id));

  // ─── Computed Analytics ────────────────────────────────────────────────────

  /** HDP % for a specific house/date */
  const getHDP = (houseId: string, date: string, currentCount: number): number => {
    const log = productionLogs.find(p => p.houseId === houseId && p.date === date);
    if (!log || currentCount === 0) return 0;
    return (log.eggCount / currentCount) * 100;
  };

  /** Cumulative FCR = total feed consumed / total egg kg for a house */
  const getCumulativeFCR = (houseId: string): number => {
    const logs = productionLogs.filter(p => p.houseId === houseId);
    const totalFeed = logs.reduce((a, b) => a + b.feedConsumed, 0);
    const totalEggKg = logs.reduce((a, b) => a + b.totalKg, 0);
    if (totalEggKg === 0) return 0;
    return totalFeed / totalEggKg;
  };

  /** Average feed intake per bird per day (grams), based on most recent log */
  const getFeedIntakePerBird = (houseId: string, currentCount: number): number => {
    const logs = productionLogs.filter(p => p.houseId === houseId);
    if (logs.length === 0 || currentCount === 0) return 0;
    const lastLog = logs[logs.length - 1];
    return (lastLog.feedConsumed * 1000) / currentCount;
  };

  /** Full analytics bundle for a flock */
  const getFlockAnalytics = (houseId: string, currentCount: number): FlockAnalytics => {
    const logs = productionLogs.filter(p => p.houseId === houseId);
    const totalFeed = logs.reduce((a, b) => a + b.feedConsumed, 0);
    const totalEggKg = logs.reduce((a, b) => a + b.totalKg, 0);
    const cumulativeFCR = totalEggKg > 0 ? totalFeed / totalEggKg : 0;

    // Estimate feed cost from inventory lastPrice
    const totalFeedCost = logs.reduce((acc, log) => {
      const item = inventory.find(i => i.id === log.feedInventoryItemId);
      return acc + (item ? log.feedConsumed * item.lastPrice : 0);
    }, 0);

    const hppPerKg = totalEggKg > 0 ? totalFeedCost / totalEggKg : 0;

    const totalIncome = salesLogs
      .filter(s => s.houseId === houseId && !s.isFree)
      .reduce((a, b) => a + b.total, 0);
    const netPL = totalIncome - totalFeedCost;

    return {
      houseId,
      cumulativeFCR,
      feedIntakePerBirdGrams: getFeedIntakePerBird(houseId, currentCount),
      hppPerKg,
      totalEggKg,
      totalFeedCost,
      netPL,
    };
  };

  const saveFarmSettings = (settings: Partial<FarmSettings>) => {
    setFarmSettings(prev => ({ ...prev, ...settings }));
  };

  const addModalAwal = (amount: number, description = 'Modal Awal', houseId?: string) => {
    addTransaction({
      houseId,
      date: new Date().toISOString().split('T')[0],
      description,
      qty: '1',
      price: amount,
      total: amount,
      account: 'Kas',
      type: 'MODAL',
    });
    saveFarmSettings({ initialCapital: farmSettings.initialCapital + amount });
  };

  const addAsset = (assetData: Omit<Asset, 'id' | 'maintenanceHistory'>) => {
    setAssets(prev => [...prev, { ...assetData, id: `ast-${Date.now()}`, maintenanceHistory: [] }]);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const updateAssetStatus = (id: string, status: AssetCondition, user: string, notes?: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === id) {
        return {
          ...asset,
          condition: status,
          maintenanceHistory: [
            { date: new Date().toISOString(), status, user, notes },
            ...asset.maintenanceHistory
          ]
        };
      }
      return asset;
    }));
  };

  return (
    <GlobalContext.Provider value={{
      productionLogs, salesLogs, transactions, inventory, mortalityRecords, recipes,
      saveProduction, saveSale, addTransaction, updateTransaction,
      updateInventory, addInventoryItem, updateInventoryItem,
      addRecipe, updateRecipe, deleteRecipe,
      getHDP, getCumulativeFCR, getFeedIntakePerBird, getFlockAnalytics,
      farmSettings, saveFarmSettings, addModalAwal,
      assets, addAsset, updateAsset, updateAssetStatus,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalData = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobalData must be used within a GlobalProvider');
  return ctx;
};
