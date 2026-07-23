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

import Icon, { type IconVariant } from "@/components/common/ui/Icon";
import { useSidePanel } from "@/context/SidePanelContext";

import styles from "./Appbar.module.scss";

export interface AppbarProps {
  /** Name of the current tool or section (right side of breadcrumb). */
  toolName: string;
  /** Whether the sidebar is open (offsets the toolbar when collapsed). */
  sidebarOpen: boolean;
  /** Optional right-side icon button that toggles the tool's side panel. */
  icon?: IconVariant;
  /** Tooltip shown on hover of the right-side icon button. */
  tooltipTitle?: string;
}

export default function Appbar({ toolName, sidebarOpen, icon, tooltipTitle }: AppbarProps) {
  const { toggleOpen } = useSidePanel();

  return (
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
