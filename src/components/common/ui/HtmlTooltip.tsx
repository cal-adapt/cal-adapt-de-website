import * as React from "react";

import { styled, useTheme } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";

import styles from "./HtmlTooltip.module.scss";

const HtmlTooltipContent = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
    color: "#000000",
    borderRadius: "6px",
    maxWidth: 220,
    padding: "15px",
  },
}));

type HtmlTooltipProps = Omit<TooltipProps, "title" | "children"> & {
  textFragment: React.ReactNode;
  iconFragment: React.ReactElement;
};

export default function HtmlTooltip({ textFragment, iconFragment, ...props }: HtmlTooltipProps) {
  const theme = useTheme();
  const primaryBlue = theme.palette.primaryBlue.main;

  const styledIconFragment = React.cloneElement(iconFragment, {
    style: { color: primaryBlue },
  });

  return (
    <div className={styles.tooltip}>
      <HtmlTooltipContent title={textFragment} {...props}>
        {styledIconFragment}
      </HtmlTooltipContent>
    </div>
  );
}
