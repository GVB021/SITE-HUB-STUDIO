import { useState, useCallback } from "react";
import { type ScriptLineOverride } from "./types";

export function useRoomScript(baseScriptLines: any[]) {
  const [lineOverrides, setLineOverrides] = useState<Record<number, ScriptLineOverride>>({});
  const [lineEditHistory, setLineEditHistory] = useState<Record<number, Array<{ field: string; before: string; after: string; by: string }>>>({});
  const [editingField, setEditingField] = useState<{ lineIndex: number; field: "character" | "text" | "timecode" } | null>(null);
  const [editingDraftValue, setEditingDraftValue] = useState("");
  const [currentLine, setCurrentLine] = useState(0);

  const applyScriptLinePatch = useCallback((lineIndex: number, patch: ScriptLineOverride) => {
    if (!Number.isInteger(lineIndex) || lineIndex < 0) return;
    setLineOverrides((prev) => {
      const current = prev[lineIndex] || {};
      return {
        ...prev,
        [lineIndex]: { ...current, ...patch },
      };
    });
  }, []);

  const pushEditHistory = useCallback((lineIndex: number, field: "character" | "text" | "timecode", before: string, after: string, by: string) => {
    if (before === after) return;
    const entry = {
      id: `${lineIndex}_${field}_${Date.now()}`,
      field,
      before,
      after,
      at: new Date().toISOString(),
      by,
    };
    setLineEditHistory((prev) => {
      const list = prev[lineIndex] || [];
      return {
        ...prev,
        [lineIndex]: [entry, ...list].slice(0, 25),
      };
    });
  }, []);

  const resetScriptState = useCallback(() => {
    setLineOverrides({});
    setLineEditHistory({});
    setEditingField(null);
    setEditingDraftValue("");
  }, []);

  return {
    lineOverrides,
    lineEditHistory,
    editingField,
    setEditingField,
    editingDraftValue,
    setEditingDraftValue,
    currentLine,
    setCurrentLine,
    applyScriptLinePatch,
    pushEditHistory,
    resetScriptState
  };
}
