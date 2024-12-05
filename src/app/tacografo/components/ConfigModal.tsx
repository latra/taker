import { useState } from 'react';
import { TakeConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TakeConfig;
  onSave: (config: TakeConfig) => void;
}

export function ConfigModal({ isOpen, onClose, config: initialConfig, onSave }: ConfigModalProps) {
  const [config, setConfig] = useState<TakeConfig>(initialConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Take Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum lines per take
            </label>
            <input
              type="number"
              value={config.maxLinesPerTake}
              onChange={(e) => setConfig({
                ...config,
                maxLinesPerTake: Math.max(1, parseInt(e.target.value) || 0)
              })}
              min="1"
              className="border rounded px-3 py-2 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              The maximum number of lines that a take can contain
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum lines per character
            </label>
            <input
              type="number"
              value={config.maxLinesPerCharacter}
              onChange={(e) => setConfig({
                ...config,
                maxLinesPerCharacter: Math.max(1, parseInt(e.target.value) || 0)
              })}
              min="1"
              className="border rounded px-3 py-2 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              The maximum lines that a character can have inside a take
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum characters per line
            </label>
            <input
              type="number"
              value={config.maxCharsPerLine}
              onChange={(e) => setConfig({
                ...config,
                maxCharsPerLine: Math.max(1, parseInt(e.target.value) || 0)
              })}
              min="1"
              className="border rounded px-3 py-2 w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              The maximum characters that a line can contain
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action marks
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.actionMarks.start}
                onChange={(e) => setConfig({
                  ...config,
                  actionMarks: { ...config.actionMarks, start: e.target.value }
                })}
                className="border rounded px-3 py-2 w-20 text-center"
                maxLength={1}
              />
              <input
                type="text"
                value={config.actionMarks.end}
                onChange={(e) => setConfig({
                  ...config,
                  actionMarks: { ...config.actionMarks, end: e.target.value }
                })}
                className="border rounded px-3 py-2 w-20 text-center"
                maxLength={1}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Characters that indicate the start and end of an action description
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 