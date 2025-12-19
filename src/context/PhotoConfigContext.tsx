'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PhotoConfigContextType = {
  photoConfigSelected: string
  setPhotoConfigSelected: (value: string) => void
  photoConfigList: string[]
}

const defaultPhotoConfigList = ['Utility Configuration', 'Distributed Configuration']

const PhotoConfigContext = createContext<PhotoConfigContextType | undefined>(undefined);

export const PhotoConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photoConfigSelected, setPhotoConfigSelected] = useState('Utility Configuration');

  return (
    <PhotoConfigContext.Provider value={{
      photoConfigSelected,
      setPhotoConfigSelected,
      photoConfigList: defaultPhotoConfigList,
    }}>
      {children}
    </PhotoConfigContext.Provider>
  );
};

export const usePhotoConfig = () => {
  const context = useContext(PhotoConfigContext);
  if (!context) {
    throw new Error('usePhotoConfig must be used within a PhotoConfigProvider')
  }
  return context
}; 
