"use client";

import clsx from "clsx";

import Link from "@/components/common/ui/Link";

import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "skip" | "floating";

export interface ButtonProps {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  id?: string;
  tabIndex?: number;
  title?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

export default function Button({
  variant = "primary",
  href,
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
  const buttonClasses = clsx(styles.button, styles[variant], className);

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        style={style}
        id={id}
        tabIndex={tabIndex}
        title={title}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
      >
        {children}
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
      {children}
    </button>
  );
}
