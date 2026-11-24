import { type LucideIcon, Map as MapIcon, Sheet, Sun, Thermometer, Zap } from "lucide-react";

import type { ToolId } from "@/config/navigation";

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  "climate-metrics-map": MapIcon,
  "data-download-tool": Sheet,
  "extreme-heat-days": Thermometer,
  "hdd-cdd": Zap,
  "renewables-visualizer": Sun,
};

export function isToolId(id: string): id is ToolId {
  return Object.hasOwn(TOOL_ICONS, id);
}

/** A dashboard tool's icon. Decorative: always shown next to the tool's name. */
export default function ToolIcon({
  id,
  size = "1em",
  className,
}: {
  id: ToolId;
  size?: number | string;
  className?: string;
}) {
  const ToolSvg = TOOL_ICONS[id];
  return <ToolSvg className={className} size={size} strokeWidth={1.75} aria-hidden />;
}
