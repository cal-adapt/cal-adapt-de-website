// CalDashToolbar
// Toolbar component for Cal-Adapt dashboard pages.
// Displays breadcrumbs, tool title, and an optional icon button with tooltip to toggle the side panel.

import React from "react";
import Image from "next/image";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";


import { useSidePanel } from "@/context/SidePanelContext";

interface ToolbarProps {
  toolName: string; // Name of the current tool or section
  tooltipTitle: string | null; // Tooltip text for the icon button
  iconSrc: any | null; // Optional icon image source (Next.js Image)
  iconAlt: string | null; // Alt text for the icon image
  sidebarOpen: boolean; // Whether the sidebar is open (affects layout)
  drawerWidth: number; // Width of the drawer (not currently used but included for flexibility)
}

export default function CalDashToolbar({
  toolName,
  tooltipTitle,
  iconSrc,
  iconAlt,
  sidebarOpen,
  drawerWidth,
}: ToolbarProps) {
  const { open, toggleOpen } = useSidePanel();

  return (
    // Adjust left margin based on whether sidebar is open
    <Toolbar
      className="toolbar-main"
      sx={{ ml: sidebarOpen ? 0 : `72px`, justifyContent: `space-between` }}
    >
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Cal-Adapt
        </Link>
        <Typography color="text.primary">{toolName}</Typography>
      </Breadcrumbs>
      {iconSrc && (
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title={tooltipTitle}
        >
          <IconButton onClick={toggleOpen}>
            <Image src={iconSrc} alt={iconAlt} />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}
