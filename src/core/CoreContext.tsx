import React, { createContext, useContext, useState, useEffect } from "react";
import type { CoreState, CoreActions, CoreContextType, Migration } from "./types";

const STORAGE_KEY = "carolina_olive_core";
const CURRENT_SCHEMA_VERSION = 1;

const defaultCore: CoreState = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  version: "1.0.0",
  memory: {},
  emotionalState: {},
  lastPatched: null,
};

// Migration engine for future-proofing
const migrations: Record<number, Migration> = {
  1: (core) => ({
    ...defaultCore,
    ...core,
    schemaVersion: 1,
  }),
};

const migrateCore = (core: any): CoreState => {
  let migrated = { ...defaultCore, ...core };

  while (migrated.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const next = migrated.schemaVersion + 1;
    const migrate = migrations[next];
    if (!migrate) break;
    migrated = migrate(migrated);
  }

  return migrated;
};

// Core integrity validator
const validateCore = (core: CoreState): CoreState => {
  if (typeof core.schemaVersion !== "number") return defaultCore;
  if (typeof core.version !== "string") return defaultCore;
  if (typeof core.memory !== "object" || core.memory === null) core.memory = {};
  if (typeof core.emotionalState !== "object" || core.emotionalState === null) core.emotionalState = {};
  if (core.lastPatched && typeof core.lastPatched !== "string") {
    core.lastPatched = null;
  }
  return core;
};

const loadCore = (): CoreState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultCore;

    const parsed = JSON.parse(saved);
    return validateCore(migrateCore(parsed));
  } catch {
    return defaultCore;
  }
};

const incrementVersion = (v: string): string => {
  const parts = v.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join(".");
};

const CoreContext = createContext<CoreContextType | null>(null);

export const CoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [core, setCore] = useState<CoreState>(loadCore);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(core));
  }, [core]);

  // Safe state updater with validation
  const safeSetCore = (updater: (prev: CoreState) => CoreState) => {
    setCore((prev) => validateCore(updater(prev)));
  };

  const softReboot = () => {
    safeSetCore((prev) => ({
      ...prev,
      emotionalState: {},
    }));
  };

  const hardReboot = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCore(defaultCore);
  };

  const clearCache = () => {
    safeSetCore((prev) => ({
      ...prev,
      memory: {},
      emotionalState: {},
    }));
  };

  const patchCore = () => {
    safeSetCore((prev) => ({
      ...prev,
      version: incrementVersion(prev.version),
      lastPatched: new Date().toISOString(),
    }));
  };

  const exportCore = () => {
    const blob = new Blob([JSON.stringify(core, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carolina-olive-core.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateMemory = (key: string, value: any) => {
    safeSetCore((prev) => ({
      ...prev,
      memory: {
        ...prev.memory,
        [key]: value,
      },
    }));
  };

  const updateEmotion = (emotion: string, intensity = 1) => {
    safeSetCore((prev) => ({
      ...prev,
      emotionalState: {
        ...prev.emotionalState,
        [emotion]: (prev.emotionalState[emotion] ?? 0) + intensity,
      },
    }));
  };

  return (
    <CoreContext.Provider
      value={{
        ...core,
        softReboot,
        hardReboot,
        clearCache,
        patchCore,
        exportCore,
        updateMemory,
        updateEmotion,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};

export const useCore = (): CoreContextType => {
  const ctx = useContext(CoreContext);
  if (!ctx) throw new Error("useCore must be used inside CoreProvider");
  return ctx;
};
