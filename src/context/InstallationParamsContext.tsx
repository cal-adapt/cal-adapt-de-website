"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

type InstallationParamsContextType = {
  installationSelected: number;
  setInstallationSelected: (value: number) => void;
  installationList: string[];
};

const defaultInstallationList = ["Onshore", "Offshore"];

const InstallationParamsContext = createContext<InstallationParamsContextType | undefined>(
  undefined
);

export const InstallationParamsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 0: corresponds to onshore
  // 1: corresponds to offshore
  const [installationSelected, setInstallationSelected] = useState(0);

  return (
    <InstallationParamsContext.Provider
      value={{
        installationSelected,
        setInstallationSelected,
        installationList: defaultInstallationList,
      }}
    >
      {children}
    </InstallationParamsContext.Provider>
  );
};

export const useInstallationParams = () => {
  const context = useContext(InstallationParamsContext);
  if (!context) {
    throw new Error("useInstallationParams must be used within a InstallationParamsProvider");
  }
  return context;
};
