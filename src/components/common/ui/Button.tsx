"use client";

import Link from "next/link";

import clsx from "clsx";

import { isExternalUrl } from "@/utils/url";

import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

export default function Button({
  variant = "primary",
  href,
  className,
  children,
  ariaLabel,
  disabled,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  const isExternal = href && isExternalUrl(href);
  const buttonClasses = clsx(styles.button, styles[variant], className);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    event.stopPropagation();
    if (onClick) onClick(event);
  };

  if (isExternal) {
    return (
      <a
        className={buttonClasses}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link
        className={buttonClasses}
        href={href}
        aria-label={ariaLabel}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      aria-label={ariaLabel}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
