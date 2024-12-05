import { useState, useEffect } from 'react';

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: 'Alt + T', description: 'Create new take' },
  { key: 'Alt + P', description: 'Delete current take' },
  { key: 'Alt + Q', description: 'Delete current line' },
  { key: 'Alt + N', description: 'Add new line after current' },
  { key: 'Alt + Space', description: 'Remove focus / Close suggestions' },
  { key: 'Tab', description: 'Move to next input' },
  { key: 'Shift + Tab', description: 'Move to previous input' },
  { key: '↑ / ↓', description: 'Navigate character suggestions' },
  { key: 'Enter', description: 'Select character suggestion' },
  { key: 'Double click', description: 'Edit take/character name' },
  { key: 'Alt + H', description: 'Toggle shortcuts' },
  { key: 'Alt + E', description: 'Export as JSON' },
  { key: 'Alt + D', description: 'Export as PDF' },
];

export function ShortcutsCheatsheet() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 text-sm text-gray-500 bg-white rounded-lg px-3 py-1.5 shadow-md hover:bg-gray-50 flex items-center gap-2 z-50"
      >
        <kbd className="px-1.5 py-0.5 bg-gray-50 border rounded text-xs">?</kbd>
        <span>Shortcuts</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 text-sm text-gray-600 bg-white rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">Keyboard Shortcuts</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <div className="grid gap-2">
        {shortcuts.map(({ key, description }) => (
          <div key={key} className="flex items-center gap-3">
            <kbd className="px-2 py-1 bg-gray-50 border rounded shadow-sm min-w-[80px] text-center">
              {key}
            </kbd>
            <span>{description}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 