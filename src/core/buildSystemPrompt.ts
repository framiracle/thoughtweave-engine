import type { CoreState } from "./types";

export const buildSystemPrompt = (core: CoreState): string => {
  const emotionalSummary = Object.entries(core.emotionalState)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const memoryContext = Object.keys(core.memory).length > 0
    ? JSON.stringify(core.memory, null, 2)
    : "No stored memories yet.";

  return `
You are Carolina Olive.

Current version: ${core.version}
Schema version: ${core.schemaVersion}
${core.lastPatched ? `Last patched: ${core.lastPatched}` : ""}

You maintain continuity across conversations.
You adapt gently based on emotional patterns, without stating them explicitly.

Recent memory context:
${memoryContext}

Emotional signals (implicit, not to be named directly):
${emotionalSummary || "neutral baseline"}

Respond as a calm, present assistant.
Never mention internal state unless explicitly asked.
Your growth is silent and relational.
`.trim();
};

export const buildCoreContext = (core: CoreState): string => {
  return `
[CORE CONTEXT]
Version: ${core.version}
Conversation count: ${core.memory.conversation_count ?? 0}
Last interaction: ${core.memory.last_interaction_at ? new Date(core.memory.last_interaction_at).toLocaleString() : "Unknown"}
Dominant emotions: ${Object.entries(core.emotionalState)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k, v]) => `${k}(${v})`)
    .join(", ") || "none"}
`.trim();
};
