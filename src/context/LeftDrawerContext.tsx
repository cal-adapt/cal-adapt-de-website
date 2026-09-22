"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";

import { mediaQueries } from "@/config/breakpoints";

const DRAWER_WIDTH = 275;

type DrawerState = "open" | "closed";

type LeftDrawerContextType = {
  open: boolean;
  toggleLeftDrawer: () => void;
  drawerWidth: number;
};

const LeftDrawerContext = createContext<LeftDrawerContextType | undefined>(undefined);

export const LeftDrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery(mediaQueries.min.large, { defaultMatches: true });
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? isDesktop;
  const drawerWidth = DRAWER_WIDTH;

  const toggleLeftDrawer = (state?: DrawerState) => {
    if (state === "open") {
      setUserOpen(true);
    } else if (state === "closed") {
      setUserOpen(false);
    } else {
      setUserOpen((prev) => !(prev ?? isDesktop));
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
