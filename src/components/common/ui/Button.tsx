"use client";

import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

import Link from "@/components/common/ui/Link";

import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "accent" | "skip" | "floating";

export type ButtonSize = "small" | "large";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
}: ButtonProps) {
  const buttonClasses = clsx(styles.button, styles[variant], styles[size], className);

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
    >
      <ButtonContent prefix={prefix} suffix={suffix}>
        {children}
      </ButtonContent>
    </button>
  );
}
