"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Works like useState but reads/writes to sessionStorage.
 * Falls back gracefully when sessionStorage is unavailable (SSR, privacy mode).
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.sessionStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

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

  // Keep the hook in sync when the same key is written from a different tab/hook.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.storageArea !== window.sessionStorage || e.key !== key) return;
      try {
        setStoredValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}
