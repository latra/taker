import { Take } from '../types';

export function exportScript(takes: Take[]) {
  // Create the export data
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    takes: takes.map(take => ({
      id: take.id,
      name: take.name,
      timer: take.timer,
      lines: take.lines.map(line => ({
        character: line.character,
        dialogue: line.dialogue,
        originalDialogue: line.originalDialogue || '',
        timer: line.timer
      }))
    }))
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create blob and download link
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `script-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 