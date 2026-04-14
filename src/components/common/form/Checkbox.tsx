"use client";

import { forwardRef, useId } from "react";

import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "./Checkbox.module.scss";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label shown beside the box; omit when using `FormField`’s `label`. */
  label?: ReactNode;
  invalid?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, invalid, label, id: idProp, ...rest },
  ref
) {
  const genId = useId();
  const inputId = idProp ?? genId;

  const input = (
    <input
      ref={ref}
      id={inputId}
      type="checkbox"
      className={clsx(styles.input, invalid && styles.invalid, className)}
      {...rest}
    />
  );

  if (label != null && label !== "") {
    return (
      <div className={styles.row}>
        {input}
        <label htmlFor={inputId} className={styles.textLabel}>
          {label}
        </label>
      </div>
    );
  }

  return input;
});

export default Checkbox;
