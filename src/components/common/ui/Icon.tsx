import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Download,
  Info,
  type LucideProps,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import type { SVGProps } from "react";

import LogoCalAdapt from "@/assets/svg/logo-caladapt.svg";
import LogoCEC from "@/assets/svg/logo-cec.svg";
import LogoERA from "@/assets/svg/logo-era.svg";
import LogoGIF from "@/assets/svg/logo-gif.svg";
import LogoLBNL from "@/assets/svg/logo-lbnl.svg";
import Mouse from "@/assets/svg/mouse.svg";
import Package from "@/assets/svg/package.svg";
import Settings from "@/assets/svg/settings.svg";

import styles from "./Icon.module.scss";

const ICON_COMPONENTS = {
  mouse: Mouse,
  logoCalAdapt: LogoCalAdapt,
  logoCEC: LogoCEC,
  logoERA: LogoERA,
  logoGIF: LogoGIF,
  logoLBNL: LogoLBNL,
  package: Package,
  settings: Settings,
};

const LUCIDE_ICON_COMPONENTS = {
  close: X,
  delete: Trash2,
  undo: Undo2,
  info: CircleHelp,
  download: Download,
  alertInfo: Info,
  alertWarning: AlertTriangle,
  alertError: CircleAlert,
  alertSuccess: CheckCircle2,
};

export type IconVariant = keyof typeof ICON_COMPONENTS | keyof typeof LUCIDE_ICON_COMPONENTS;

interface IconProps extends SVGProps<SVGSVGElement> {
  variant: IconVariant;
}

export default function Icon({ variant, className, style, children, ...props }: IconProps) {
  if (variant in ICON_COMPONENTS) {
    const Component = ICON_COMPONENTS[variant as keyof typeof ICON_COMPONENTS];

    return (
      <Component className={clsx(styles.icon, className)} style={style} {...props}>
        {children}
      </Component>
    );
  }

  if (variant in LUCIDE_ICON_COMPONENTS) {
    const LucideIcon = LUCIDE_ICON_COMPONENTS[variant as keyof typeof LUCIDE_ICON_COMPONENTS];
    const iconProps = props as LucideProps;

    return (
      <LucideIcon className={clsx(styles.icon, className)} style={style} {...iconProps}>
        {children}
      </LucideIcon>
    );
  }

  return null;
}
