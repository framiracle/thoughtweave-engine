export type CoreState = {
  schemaVersion: number;
  version: string;
  memory: Record<string, any>;
  emotionalState: Record<string, number>;
  emotionalHistory: EmotionSnapshot[];
  lastPatched: string | null;
};

export type EmotionSnapshot = {
  timestamp: string;
  emotions: Record<string, number>;
};

export type CoreActions = {
  softReboot: () => void;
  hardReboot: () => void;
  clearCache: () => void;
  patchCore: () => void;
  exportCore: () => void;
  importCore: (file: File) => Promise<boolean>;
  updateMemory: (key: string, value: any) => void;
  updateEmotion: (emotion: string, intensity?: number) => void;
  snapshotEmotions: () => void;
};

export type CoreContextType = CoreState & CoreActions;

export type Migration = (core: any) => CoreState;
