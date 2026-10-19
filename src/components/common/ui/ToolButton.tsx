import { type NavLink } from "@/config/navigation";

import Button, { type ButtonSize } from "./Button";
import ToolIcon, { isToolId } from "./ToolIcon";

interface ToolButtonProps {
  /** The tool to open; supplies the label and icon. */
  navLink: NavLink;
  /** Defaults to the tool's page; pass one with selections to open it preconfigured. */
  href?: string;
  size?: ButtonSize;
  className?: string;
}

/** An outline `Button` that opens a dashboard tool. */
export default function ToolButton({
  navLink,
  href = navLink.href,
  size = "compact",
  className,
}: ToolButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      href={href}
      className={className}
      prefix={isToolId(navLink.id) ? <ToolIcon id={navLink.id} /> : undefined}
    >
      {navLink.label}
    </Button>
  );
}
