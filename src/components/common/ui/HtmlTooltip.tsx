import * as React from "react";

import { styled, useTheme } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";

import clsx from "clsx";
import type { SVGProps } from "react";

import styles from "./HtmlTooltip.module.scss";

const HtmlTooltipContent = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "var(--color-black)",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.22)",
    color: "var(--color-white)",
    borderRadius: "8px",
    maxWidth: 360,
    padding: "16px 20px",
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: 1.2,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "var(--color-black)",
  },
  [`& .${tooltipClasses.tooltip} p`]: {
    margin: 0,
  },
}));

type HtmlTooltipProps = Omit<TooltipProps, "title" | "children"> & {
  textFragment: React.ReactNode;
  iconFragment: React.ReactElement<SVGProps<SVGSVGElement>>;
  /** Merged with the default wrapper; use to adjust spacing when inline with labels. */
  className?: string;
};

export default function HtmlTooltip({
  textFragment,
  iconFragment,
  className,
  ...props
}: HtmlTooltipProps) {
  const theme = useTheme();
  const primaryBlue = theme.palette.primaryBlue.main;

  const styledIconFragment = React.cloneElement(iconFragment, {
    style: { ...iconFragment.props.style, color: primaryBlue },
  });

  return (
    <div className={clsx(styles.tooltip, className)}>
      <HtmlTooltipContent title={textFragment} arrow {...props}>
        {styledIconFragment}
      </HtmlTooltipContent>
    </div>
  );
}
