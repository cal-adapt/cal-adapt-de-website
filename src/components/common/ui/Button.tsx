"use client";

import clsx from "clsx";
import type { AriaAttributes, CSSProperties, ReactNode } from "react";

import Link from "@/components/common/ui/Link";

import styles from "./Button.module.scss";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "outline"
  | "skip"
  | "floating";

export type ButtonSize = "compact" | "small" | "large";

export type ButtonShape = "square" | "circle";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Icon-only buttons should include the svgOnly prop and an aria-label. */
  svgOnly?: boolean;
  prefix?: ReactNode; // Icon
  suffix?: ReactNode; // Icon
  href?: string;
  openInNewTab?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  id?: string;
  tabIndex?: number;
  title?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  /** Link-only (`href` set): marks the link to the page or step the user is on. */
  ariaCurrent?: AriaAttributes["aria-current"];
  /** Button-only (no `href`): for disclosure toggles. */
  ariaExpanded?: boolean;
  ariaControls?: string;
}

function ButtonContent({
  prefix,
  suffix,
  children,
}: Pick<ButtonProps, "prefix" | "suffix" | "children">) {
  return (
    <>
      {prefix ? <span className={styles.iconSlot}>{prefix}</span> : null}
      {children}
      {suffix ? <span className={styles.iconSlot}>{suffix}</span> : null}
    </>
  );
}

export default function Button({
  variant = "primary",
  size = "large",
  shape,
  svgOnly = false,
  prefix,
  suffix,
  href,
  openInNewTab,
  className,
  style,
  children,
  disabled,
  type = "button",
  onClick,
  id,
  tabIndex,
  title,
  ariaLabel,
  ariaHidden,
  ariaCurrent,
  ariaExpanded,
  ariaControls,
}: ButtonProps) {
  const buttonClasses = clsx(
    styles.button,
    styles[variant],
    styles[size],
    svgOnly && styles.svgOnly,
    svgOnly && shape === "square" && styles.square,
    svgOnly && shape === "circle" && styles.circle,
    className
  );

  if (href) {
    if (disabled) {
      return (
        <span
          className={clsx(buttonClasses, styles.isDisabledLink)}
          style={style}
          id={id}
          tabIndex={-1}
          title={title}
          aria-label={ariaLabel}
          aria-hidden={ariaHidden}
          aria-disabled
        >
          <ButtonContent prefix={prefix} suffix={suffix}>
            {children}
          </ButtonContent>
        </span>
      );
    }

    return (
      <Link
        href={href}
        openInNewTab={openInNewTab}
        className={buttonClasses}
        style={style}
        id={id}
        tabIndex={tabIndex}
        title={title}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        aria-current={ariaCurrent}
      >
        <ButtonContent prefix={prefix} suffix={suffix}>
          {children}
        </ButtonContent>
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      style={style}
      disabled={disabled}
      type={type}
      onClick={onClick}
      id={id}
      tabIndex={tabIndex}
      title={title}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      <ButtonContent prefix={prefix} suffix={suffix}>
        {children}
      </ButtonContent>
    </button>
  );
}
