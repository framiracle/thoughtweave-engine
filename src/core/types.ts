export type CoreState = {
  schemaVersion: number;
  version: string;
  memory: Record<string, any>;
  emotionalState: Record<string, number>;
  lastPatched: string | null;
};

export type CoreActions = {
  softReboot: () => void;
  hardReboot: () => void;
  clearCache: () => void;
  patchCore: () => void;
  exportCore: () => void;
  updateMemory: (key: string, value: any) => void;
  updateEmotion: (emotion: string, intensity?: number) => void;
};

export type CoreContextType = CoreState & CoreActions;

export type Migration = (core: any) => CoreState;
