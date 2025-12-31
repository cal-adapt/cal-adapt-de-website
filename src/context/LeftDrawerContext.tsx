"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

const DRAWER_WIDTH = 212;

type DrawerState = "open" | "closed";

type LeftDrawerContextType = {
  open: boolean;
  toggleLeftDrawer: () => void;
  drawerWidth: number;
};

const LeftDrawerContext = createContext<LeftDrawerContextType | undefined>(undefined);

export const LeftDrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const drawerWidth = DRAWER_WIDTH;

  const toggleLeftDrawer = (state?: DrawerState) => {
    if (state === "open") {
      setOpen(true);
    } else if (state === "closed") {
      setOpen(false);
    } else {
      setOpen((prev) => !prev);
    }
  };

  return (
    <LeftDrawerContext.Provider value={{ open, toggleLeftDrawer, drawerWidth }}>
      {children}
    </LeftDrawerContext.Provider>
  );
};

export const useLeftDrawer = () => {
  const context = useContext(LeftDrawerContext);

  if (!context) {
    throw new Error("useLeftDrawer must be used within a LeftDrawerProvider");
  }

  return context;
};
