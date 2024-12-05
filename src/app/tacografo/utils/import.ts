import { Take } from '../types';

interface ImportData {
  version: string;
  timestamp: string;
  takes: {
    id: number;
    name: string;
    timer: string;
    lines: {
      character: string;
      dialogue: string;
      timer: string | null;
    }[];
  }[];
}

export function importScript(file: File): Promise<Take[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ImportData;

        // Convert the imported data to our Take structure
        let lineIdCounter = 1; // Contador inicial para IDs de líneas

        const takes: Take[] = data.takes.map((take, index, array) => ({
          id: take.id,
          name: take.name,
          timer: take.timer,
          lines: take.lines.map(line => ({
            id: lineIdCounter++,
            character: line.character,
            dialogue: line.dialogue,
            timer: line.timer
          })),
          prev: index > 0 ? array[index - 1].id : null,
          next: index < array.length - 1 ? array[index + 1].id : null
        }));

        resolve(takes);
      } catch (error) {
        reject(new Error('Invalid script file format'));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
} 