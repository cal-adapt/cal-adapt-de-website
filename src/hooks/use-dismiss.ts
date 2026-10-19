import { type RefObject, useEffect } from "react";

/**
 * While `open`, calls `onDismiss` when the user clicks or moves focus outside
 * `containerRef`, or presses escape. Escape also returns focus to `returnFocusRef`,
 * so keyboard users land back on the control that opened the popup.
 */
export default function useDismiss(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && !containerRef.current?.contains(target);

    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) onDismiss();
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (isOutside(event.target)) onDismiss();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onDismiss();
      returnFocusRef?.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, open, onDismiss, returnFocusRef]);
}
