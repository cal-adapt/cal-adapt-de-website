import { type RefObject, useEffect, useRef } from "react";

/**
 * While `open`, calls `onDismiss` when the user clicks or moves focus outside
 * `containerRef`, or presses escape. If focus was inside the popup, escape
 * returns it to `returnFocusRef`, so keyboard users land back on the control
 * that opened it.
 */
export default function useDismiss(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>
) {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && !containerRef.current?.contains(target);

    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) onDismissRef.current();
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) onDismissRef.current();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const hadFocus = containerRef.current?.contains(document.activeElement) ?? false;
      onDismissRef.current();
      if (hadFocus) returnFocusRef?.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, open, returnFocusRef]);
}
