import React, { createContext, useContext, useState, useEffect } from 'react';
import { EggCategory } from './types';

export interface ProductionLog {
    id: string;
    houseId: string;
    date: string;
    eggCount: number;
    feedConsumed: number;
    mortality: number;
    discardedEggs: number;
    breakdown: Record<string, number>; // Category -> Kg
    totalKg: number;
}

export interface SalesLog {
    id: string;
    houseId: string;
    date: string;
    category: string;
    quantity: number; // Unit (butir/kg/sak)
    price: number;
    total: number;
    isFree: boolean;
    customer: string;
}

export interface FinancialTransaction {
    id: string;
    date: string;
    description: string;
    qty: string;
    price: number;
    total: number;
    account: string;
    type: 'INCOME' | 'EXPENSE' | 'MODAL';
    category?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    unit: string;
    minStock: number;
}

interface GlobalContextType {
    productionLogs: ProductionLog[];
    salesLogs: SalesLog[];
    transactions: FinancialTransaction[];
    inventory: InventoryItem[];
    
    // Actions
    saveProduction: (log: Omit<ProductionLog, 'id'>) => void;
    saveSale: (sale: Omit<SalesLog, 'id'>) => void;
    addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
    updateInventory: (id: string, delta: number) => void;
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
    
    // Recipes
    recipes: any[]; // Use any or define interface
    addRecipe: (recipe: any) => void;
    updateRecipe: (id: string, updates: any) => void;
    deleteRecipe: (id: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- LOAD INITIAL DATA ---
    const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(() => {
        const saved = localStorage.getItem('poultry_prod_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [salesLogs, setSalesLogs] = useState<SalesLog[]>(() => {
        const saved = localStorage.getItem('poultry_sales_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
        const saved = localStorage.getItem('poultry_transactions');
        return saved ? JSON.parse(saved) : [
            { id: 'tx-init-1', date: '2026-03-01', description: 'Modal Awal', qty: '1', price: 250000000, total: 250000000, account: 'Mandiri', type: 'MODAL' }
        ];
    });

    const [inventory, setInventory] = useState<InventoryItem[]>(() => {
        const saved = localStorage.getItem('poultry_inventory');
        return saved ? JSON.parse(saved) : [
            { id: 'inv-1', name: 'Jagung Giling', stock: 1500, unit: 'kg', minStock: 200 },
            { id: 'inv-2', name: 'Bekatul (Dedak)', stock: 800, unit: 'kg', minStock: 150 },
            { id: 'inv-3', name: 'Konsentrat Layer', stock: 600, unit: 'kg', minStock: 250 },
            { id: 'inv-4', name: 'Pakan Jadi Mix', stock: 0, unit: 'kg', minStock: 500 },
        ];
    });

    const [recipes, setRecipes] = useState<any[]>(() => {
        const saved = localStorage.getItem('poultry_recipes');
        if (saved) return JSON.parse(saved);
        return [
            {
                id: 'r1',
                name: 'Standard Layer Mix',
                targetFcr: 2.35,
                lastUsed: '2026-03-15',
                ingredients: [
                    { inventoryItemId: 'inv-1', percentage: 50 },
                    { inventoryItemId: 'inv-2', percentage: 20 },
                    { inventoryItemId: 'inv-3', percentage: 30 },
                ]
            }
        ];
    });

    // --- PERSISTENCE ---
    useEffect(() => { localStorage.setItem('poultry_prod_logs', JSON.stringify(productionLogs)); }, [productionLogs]);
    useEffect(() => { localStorage.setItem('poultry_sales_logs', JSON.stringify(salesLogs)); }, [salesLogs]);
    useEffect(() => { localStorage.setItem('poultry_transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => { localStorage.setItem('poultry_inventory', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('poultry_recipes', JSON.stringify(recipes)); }, [recipes]);

    // --- ACTIONS ---
    const saveProduction = (logData: Omit<ProductionLog, 'id'>) => {
        const newLog = { ...logData, id: `prod-${Date.now()}` };
        setProductionLogs(prev => [...prev, newLog]);
        
        // Auto-reduce feed inventory if possible
        // (Assuming feed usage is tracked in logData.feedConsumed)
        const feedItem = inventory.find(i => i.name.toLowerCase().includes('pakan jadi'));
        if (feedItem && logData.feedConsumed > 0) {
            updateInventory(feedItem.id, -logData.feedConsumed);
        }
    };

    const saveSale = (saleData: Omit<SalesLog, 'id'>) => {
        const newSale = { ...saleData, id: `sale-${Date.now()}` };
        setSalesLogs(prev => [...prev, newSale]);

        // Add to financial transactions if not free
        if (!saleData.isFree) {
            addTransaction({
                date: saleData.date,
                description: `Penjualan Telur: ${saleData.category} (${saleData.customer})`,
                qty: `${saleData.quantity} Unit`,
                price: saleData.price,
                total: saleData.total,
                account: 'Kas Tunai',
                type: 'INCOME',
                category: saleData.category
            });
        }
    };

    const addTransaction = (txData: Omit<FinancialTransaction, 'id'>) => {
        setTransactions(prev => [...prev, { ...txData, id: `tx-${Date.now()}` }]);
    };

    const updateInventory = (id: string, delta: number) => {
        setInventory(prev => prev.map(item => 
            item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
        ));
    };

    const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
        setInventory(prev => [...prev, { ...itemData, id: `inv-${Date.now()}` }]);
    };

    const addRecipe = (recipeData: any) => {
        setRecipes(prev => [...prev, { ...recipeData, id: `rec-${Date.now()}` }]);
    };

    const updateRecipe = (id: string, updates: any) => {
        setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteRecipe = (id: string) => {
        setRecipes(prev => prev.filter(r => r.id !== id));
    };

    return (
        <GlobalContext.Provider value={{ 
            productionLogs, 
            salesLogs, 
            transactions, 
            inventory,
            recipes,
            saveProduction,
            saveSale,
            addTransaction,
            updateInventory,
            addInventoryItem,
            addRecipe,
            updateRecipe,
            deleteRecipe
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalData = () => {
    const context = useContext(GlobalContext);
    if (!context) throw new Error('useGlobalData must be used within a GlobalProvider');
    return context;
};
