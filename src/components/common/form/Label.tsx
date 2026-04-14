"use client";

import clsx from "clsx";
import type { LabelHTMLAttributes, ReactNode } from "react";

import styles from "./Label.module.scss";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export default function Label({ children, className, required, ...rest }: LabelProps) {
  return (
    <label className={clsx(styles.root, className)} {...rest}>
      {required ? (
        <span className={styles.required} aria-hidden>
          *
        </span>
      ) : null}
      {children}
    </label>
  );
}
