"use client";

import { forwardRef } from "react";

import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

import styles from "./Input.module.scss";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(styles.input, invalid && styles.invalid, className)}
      {...rest}
    />
  );
});

export default Input;
