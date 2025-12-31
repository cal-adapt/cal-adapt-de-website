// SidePanel
// Reusable side panel component for the Cal-Adapt dashboard.
// Wraps Material UI's Drawer with consistent styling and layout for sidebar content.

import React from "react";

import Drawer, { DrawerProps } from "@mui/material/Drawer";

import "@/styles/dashboard/sidepanel.scss";

interface SidePanelProps extends DrawerProps {
  classes?: Record<string, string>; // Optional class overrides
  children: React.ReactNode; // Content to be rendered inside the panel
}

const SidePanel: React.FC<SidePanelProps> = (props) => {
  return (
    <Drawer
      PaperProps={{
        sx: {
          backgroundColor: "#F7F9FB",
        },
        className: "sidepanel",
      }}
      {...props}
    >
      <div tabIndex={0}>{props.children}</div>
    </Drawer>
  );
};

export default SidePanel;
