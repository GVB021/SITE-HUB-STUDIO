export interface ScriptLine {
  character: string;
  start: number;
  end: number;
  text: string;
}

export type ScriptLineOverride = {
  character?: string;
  text?: string;
  start?: number;
};
