export function splitCharacters(characterString: string): string[] {
  return characterString
    .split(',')
    .map(char => char.trim())
    .filter(char => char.length > 0);
} 