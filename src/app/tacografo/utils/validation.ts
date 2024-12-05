import { Take, TakeConfig } from '../types';
import { splitCharacters } from './characters';

export interface ValidationError {
  type: 'take' | 'character' | 'line';
  message: string;
  lineIndex?: number;
  characterName?: string;
}

export function validateTake(take: Take, config: TakeConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate take-level constraints
  if (take.lines.length > config.maxLinesPerTake) {
    errors.push({
      type: 'take',
      message: `Take exceeds maximum of ${config.maxLinesPerTake} lines`
    });
  }

  // Track character usage
  const characterLines = new Map<string, number>();
  take.lines.forEach(line => {
    if (line.character) {
      splitCharacters(line.character).forEach(char => {
        characterLines.set(
          char, 
          (characterLines.get(char) || 0) + 1
        );
      });
    }
  });

  // Validate character-level constraints
  characterLines.forEach((count, character) => {
    if (count > config.maxLinesPerCharacter) {
      errors.push({
        type: 'character',
        message: `Character "${character}" exceeds maximum of ${config.maxLinesPerCharacter} lines`,
        characterName: character
      });
    }
  });

  // Validate line-level constraints
  take.lines.forEach((line, index) => {
    // Remove action text before counting characters
    let dialogueLength = line.dialogue.replace(
      new RegExp(`\\${config.actionMarks.start}.*?\\${config.actionMarks.end}`, 'g'),
      ''
    );
    
    if (dialogueLength.length > config.maxCharsPerLine) {
      errors.push({
        type: 'line',
        message: `Line ${index + 1} exceeds maximum of ${config.maxCharsPerLine} characters`,
        lineIndex: index
      });
    }
  });

  return errors;
} 