import { type ReactNode } from "react";

import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

import { type NavLink, navLinks } from "@/config/navigation";

import Button, { type ButtonSize } from "./Button";

const TOOL_ICONS: Record<string, ReactNode> = {
  [navLinks.climateMetricsMap.id]: <MapOutlinedIcon />,
  [navLinks.dataDownload.id]: <DatasetOutlinedIcon />,
  [navLinks.extremeHeatDays.id]: <ThermostatOutlinedIcon />,
  [navLinks.hddCdd.id]: <ElectricBoltOutlinedIcon />,
  [navLinks.renewablesVisualizer.id]: <WbSunnyOutlinedIcon />,
};

interface ToolButtonProps {
  /** The tool to open; supplies the label and icon. */
  navLink: NavLink;
  /** Defaults to the tool's page; pass one with selections to open it preconfigured. */
  href?: string;
  size?: ButtonSize;
}

/** An outline `Button` that opens a dashboard tool. */
export default function ToolButton({
  navLink,
  href = navLink.href,
  size = "compact",
}: ToolButtonProps) {
  return (
    <Button variant="outline" size={size} href={href} prefix={TOOL_ICONS[navLink.id]}>
      {navLink.label}
    </Button>
  );
}
