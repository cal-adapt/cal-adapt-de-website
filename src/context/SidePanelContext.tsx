"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type SidePanelContextType = {
  open: boolean;
  toggleOpen: () => void;
};

const SidePanelContext = createContext<SidePanelContextType | undefined>(undefined);

export const SidePanelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <SidePanelContext.Provider value={{ open, toggleOpen }}>{children}</SidePanelContext.Provider>
  );
};

export const useSidePanel = () => {
  const context = useContext(SidePanelContext);

  if (!context) {
    throw new Error("useSidePanel must be used within a SidePanelProvider");
  }

  return context;
};
