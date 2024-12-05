export interface ScriptLine {
  id: number;
  character: string;
  dialogue: string;
  originalDialogue?: string;
  timer: string | null;
}

export interface Take {
  id: number;
  name: string;
  timer: string;
  lines: ScriptLine[];
  prev: number | null;
  next: number | null;
}

export interface ConfirmationModal {
  isOpen: boolean;
  takeId: number | null;
}

export interface TakeConfig {
  maxLinesPerTake: number;
  maxLinesPerCharacter: number;
  maxCharsPerLine: number;
  actionMarks: {
    start: string;
    end: string;
  };
}

export interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TakeConfig;
  onSave: (config: TakeConfig) => void;
}

export type AppMode = 'dubber' | 'localizer';

export interface DragResult {
  source: {
    takeId: number;
    lineIndex: number;
  };
  destination: {
    takeId: number;
    lineIndex: number;
  };
} 