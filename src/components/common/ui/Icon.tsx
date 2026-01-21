import clsx from "clsx";
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

export type IconVariant = keyof typeof ICON_COMPONENTS;

interface IconProps extends SVGProps<SVGSVGElement> {
  variant: IconVariant;
}

export default function Icon({ variant, className, style, children, ...props }: IconProps) {
  if (!(variant in ICON_COMPONENTS)) return null;

  const Component = ICON_COMPONENTS[variant];

  return (
    <Component className={clsx(styles.icon, className)} style={style} {...props}>
      {children}
    </Component>
  );
}
