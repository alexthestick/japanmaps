import { useCallback, useEffect, useRef, useState } from 'react';

type Size = { width: number; height: number };

// Lightweight ResizeObserver hook to measure an element's content box.
// Returns a ref callback and the current size. Updates are throttled via rAF.
export function useElementSize<T extends HTMLElement>(): [
  (node: T | null) => void,
  Size
] {
  const nodeRef = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const measure = useCallback((target: T) => {
    const newSize = {
      width: Math.floor(target.clientWidth),
      height: Math.floor(target.clientHeight),
    };
    setSize((prev) =>
      prev.width !== newSize.width || prev.height !== newSize.height ? newSize : prev
    );
  }, []);

  const setRef = useCallback((node: T | null) => {
    nodeRef.current = node;
    if (node) measure(node);
  }, [measure]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !entry.target) return;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => measure(entry.target as T));
    });
    observer.observe(node);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [measure]);

  return [setRef, size];
}



