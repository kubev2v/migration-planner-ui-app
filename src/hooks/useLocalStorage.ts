import { useEffect, useState } from "react";

function readValue<T>(key: string, initialValue: T, version: number = 1): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item) as {
        value: T;
        version: number;
      };
      return parsed.version === version ? parsed.value : initialValue;
    }
    return initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

function saveValue<T>(key: string, value: T, version: number = 1): void {
  try {
    window.localStorage.setItem(key, JSON.stringify({ version, value }));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}

export default function useLocalStorage<T>(
  key: string,
  initialValue: T,
  version: number = 1,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(
    readValue(key, initialValue, version),
  );

  useEffect(() => {
    saveValue(key, storedValue, version);
  }, [key, storedValue, version]);

  return [
    storedValue,
    (value: T | ((prev: T) => T)) => {
      setStoredValue((previousValue) =>
        value instanceof Function ? value(previousValue) : value,
      );
    },
  ];
}
