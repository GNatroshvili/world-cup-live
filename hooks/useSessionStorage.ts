"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Works like useState but persists to sessionStorage.
 *
 * Uses a two-pass render to avoid SSR/client hydration mismatches:
 * - Pass 1 (server + first client render): always returns `initialValue`.
 * - Pass 2 (after mount): reads the stored value and triggers a re-render if
 *   it differs from `initialValue`.
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  // Always initialise with the SSR-safe default so the first render matches.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After mount, pull the persisted value (if any) from sessionStorage.
  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // sessionStorage unavailable or value unparseable — keep initialValue.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage quota exceeded or blocked — fail silently.
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
