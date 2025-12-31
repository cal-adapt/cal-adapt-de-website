"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

type InstallationPrmsContextType = {
  installationSelected: number;
  setInstallationSelected: (value: number) => void;
  installationList: string[];
};

const defaultInstallationList = ["Onshore", "Offshore"];

const InstallationPrmsContext = createContext<InstallationPrmsContextType | undefined>(undefined);

export const InstallationPrmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 0: corresponds to onshore
  // 1: corresponds to offshore
  const [installationSelected, setInstallationSelected] = useState(0);

  return (
    <InstallationPrmsContext.Provider
      value={{
        installationSelected,
        setInstallationSelected,
        installationList: defaultInstallationList,
      }}
    >
      {children}
    </InstallationPrmsContext.Provider>
  );
};

export const useInstallationPrms = () => {
  const context = useContext(InstallationPrmsContext);
  if (!context) {
    throw new Error("useInstallationPrms must be used within a InstallationPrmsProvider");
  }
  return context;
};
