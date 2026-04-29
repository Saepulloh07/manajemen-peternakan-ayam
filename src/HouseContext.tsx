import React, { createContext, useContext, useState, useEffect } from 'react';
import { PoultryHouse } from './types';

interface HouseContextType {
  houses: PoultryHouse[];
  selectedHouseId: string;
  setSelectedHouseId: (id: string) => void;
  activeHouse: PoultryHouse | undefined;
  addHouse: (name: string, capacity?: number, managerId?: string, purchaseDate?: string, purchasePrice?: number) => void;
  updateHouse: (id: string, updates: Partial<PoultryHouse>) => void;
  deleteHouse: (id: string) => void;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

export const HouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [houses, setHouses] = useState<PoultryHouse[]>(() => {
    const saved = localStorage.getItem('poultry_houses');
    return saved ? JSON.parse(saved) : [
      { id: 'h1', name: 'Kandang A', location: 'Section Utara', capacity: 5000 },
      { id: 'h2', name: 'Kandang B', location: 'Section Selatan', capacity: 4500 }
    ];
  });

  const [selectedHouseId, setSelectedHouseId] = useState<string>(() => {
    return localStorage.getItem('selected_house_id') || (houses[0]?.id || '');
  });

  useEffect(() => {
    localStorage.setItem('poultry_houses', JSON.stringify(houses));
  }, [houses]);

  useEffect(() => {
    localStorage.setItem('selected_house_id', selectedHouseId);
  }, [selectedHouseId]);

  const activeHouse = houses.find(h => h.id === selectedHouseId) || houses[0];

  const addHouse = (name: string, capacity = 0, managerId?: string, purchaseDate?: string, purchasePrice?: number) => {
    const newHouse: PoultryHouse = {
      id: `h${Date.now()}`,
      name,
      capacity,
      managerId,
      purchaseDate,
      purchasePrice
    };
    setHouses(prev => [...prev, newHouse]);
    setSelectedHouseId(newHouse.id);
  };

  const updateHouse = (id: string, updates: Partial<PoultryHouse>) => {
    setHouses(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHouse = (id: string) => {
    setHouses(prev => {
      const filtered = prev.filter(h => h.id !== id);
      if (selectedHouseId === id && filtered.length > 0) {
        setSelectedHouseId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <HouseContext.Provider value={{
      houses, selectedHouseId, setSelectedHouseId, activeHouse,
      addHouse, updateHouse, deleteHouse
    }}>
      {children}
    </HouseContext.Provider>
  );
};

export const useHouse = () => {
  const context = useContext(HouseContext);
  if (!context) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
};
