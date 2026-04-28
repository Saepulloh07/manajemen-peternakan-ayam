import React, { createContext, useContext, useState, useEffect } from 'react';
import { FlockBatch } from './types';

interface FlockContextType {
  flocks: FlockBatch[];
  addFlock: (flock: Omit<FlockBatch, 'id'>) => void;
  updateFlock: (id: string, updates: Partial<FlockBatch>) => void;
  deleteFlock: (id: string) => void;
  getActiveFlockByHouse: (houseId: string) => FlockBatch | undefined;
}

const FlockContext = createContext<FlockContextType | undefined>(undefined);

export const FlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flocks, setFlocks] = useState<FlockBatch[]>(() => {
    const saved = localStorage.getItem('poultry_flocks');
    if (saved) return JSON.parse(saved);

    // Default initial data
    return [
      {
        id: 'f1',
        houseId: 'h1',
        strain: 'Isa Brown',
        arrivalDate: '2025-06-01',
        arrivalAgeWeeks: 16,
        initialCount: 5000,
        currentCount: 4950,
        isActive: true
      },
      {
        id: 'f2',
        houseId: 'h2',
        strain: 'Lohmann Brown',
        arrivalDate: '2025-08-15',
        arrivalAgeWeeks: 0,
        initialCount: 4500,
        currentCount: 4480,
        isActive: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('poultry_flocks', JSON.stringify(flocks));
  }, [flocks]);

  const addFlock = (flockData: Omit<FlockBatch, 'id'>) => {
    const newFlock: FlockBatch = {
      ...flockData,
      id: `f${Date.now()}`
    };

    // If setting as active, deactivate other flocks in the same house
    if (newFlock.isActive) {
      setFlocks(prev => prev.map(f =>
        f.houseId === newFlock.houseId ? { ...f, isActive: false } : f
      ).concat(newFlock));
    } else {
      setFlocks(prev => [...prev, newFlock]);
    }
  };

  const updateFlock = (id: string, updates: Partial<FlockBatch>) => {
    setFlocks(prev => prev.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...updates };
        // If activating, deactivate others
        if (updates.isActive && !f.isActive) {
          // We'll handle this in a separate setFlocks call or just be careful
        }
        return updated;
      }
      return f;
    }));

    if (updates.isActive) {
      setFlocks(prev => {
        const target = prev.find(f => f.id === id);
        if (!target) return prev;
        return prev.map(f =>
          (f.houseId === target.houseId && f.id !== id) ? { ...f, isActive: false } : f
        );
      });
    }
  };

  const deleteFlock = (id: string) => {
    setFlocks(prev => prev.filter(f => f.id !== id));
  };

  const getActiveFlockByHouse = (houseId: string) => {
    return flocks.find(f => f.houseId === houseId && f.isActive);
  };

  return (
    <FlockContext.Provider value={{ flocks, addFlock, updateFlock, deleteFlock, getActiveFlockByHouse }}>
      {children}
    </FlockContext.Provider>
  );
};

export const useFlock = () => {
  const context = useContext(FlockContext);
  if (!context) {
    throw new Error('useFlock must be used within a FlockProvider');
  }
  return context;
};
