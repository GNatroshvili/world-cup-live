"use client";

import { useCallback, useEffect, useState } from "react";

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
