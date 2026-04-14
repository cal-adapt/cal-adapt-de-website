"use client";

import { forwardRef } from "react";

import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

import styles from "./Textarea.module.scss";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={clsx(styles.textarea, invalid && styles.invalid, className)}
      {...rest}
    />
  );
});

export default Textarea;
