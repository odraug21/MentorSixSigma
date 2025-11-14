// src/hooks/useLocalStorage.js
import { useState, useEffect } from "react";

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (err) {
      console.error("❌ Error leyendo localStorage:", err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error("❌ Error guardando localStorage:", err);
    }
  }, [key, state]);

  return [state, setState];
}
