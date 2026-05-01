// SidePanel
// Reusable side panel component for the Cal-Adapt dashboard.
// Wraps Material UI's Drawer with consistent styling and layout for sidebar content.

import React from "react";

import Drawer, { DrawerProps } from "@mui/material/Drawer";

import styles from "./SidePanel.module.scss";

interface SidePanelProps extends DrawerProps {
  children: React.ReactNode;
}

export default function SidePanel(props: SidePanelProps) {
  return (
    <Drawer
      PaperProps={{
        sx: {
          backgroundColor: "var(--color-grey-1)",
        },
        className: styles.sidepanel,
      }}
      {...props}
    >
      <div tabIndex={0}>{props.children}</div>
    </Drawer>
  );
}
