// dashboard/Appbar
// Top app bar for Cal-Adapt dashboard pages.
// Displays breadcrumbs, tool title, and an optional icon button with tooltip to toggle the side panel.

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import Icon, { IconVariant } from "@/components/common/ui/Icon";
import { useSidePanel } from "@/context/SidePanelContext";

import styles from "./Appbar.module.scss";

interface AppbarProps {
  toolName: string; // Name of the current tool or section
  tooltipTitle?: string; // Tooltip text for the icon button
  icon?: IconVariant; // Optional icon variant
  sidebarOpen: boolean; // Whether the sidebar is open (affects layout)
  drawerWidth: number; // Width of the drawer (not currently used but included for flexibility)
}

export default function Appbar({
  toolName,
  tooltipTitle,
  icon,
  sidebarOpen,
  drawerWidth,
}: AppbarProps) {
  const { open, toggleOpen } = useSidePanel();

  return (
    // Adjust left margin based on whether sidebar is open
    <Toolbar
      className={styles.appbar}
      sx={{ ml: sidebarOpen ? 0 : `72px`, justifyContent: `space-between` }}
    >
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Cal-Adapt
        </Link>
        <Typography color="text.primary">{toolName}</Typography>
      </Breadcrumbs>
      {icon && (
        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} title={tooltipTitle}>
          <IconButton onClick={toggleOpen}>
            <Icon variant={icon} width={24} height={24} />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}
