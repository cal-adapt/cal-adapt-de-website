'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ResContextType = {
  resSelected: number;
  setResSelected: (id: number) => void;
  resList: string[];
};

const defaultResList = ['Solar', 'Wind']

const ResContext = createContext<ResContextType | undefined>(undefined)

export const ResProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resSelected, setResSelected] = useState(0)

  return (
    <ResContext.Provider value={{
      resSelected,
      setResSelected,
      resList: defaultResList,
    }}>
      {children}
    </ResContext.Provider>
  );
};

export const useRes = () => {
  const context = useContext(ResContext)
  if (!context) {
    throw new Error('useRes must be used within a resProvider')
  }
  return context
}
