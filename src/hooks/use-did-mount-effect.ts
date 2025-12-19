import { useEffect, useRef } from "react";

// Custom hook to skip first render
export default function useDidMountEffect(func: () => void, deps: any[]): void {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      func();
    } else {
      didMount.current = true;
    }
  }, deps);
}
