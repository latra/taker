import { AppMode } from '../types';

interface ModeToggleProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      <button
        className={`px-3 py-1 rounded ${
          mode === 'dubber' 
            ? 'bg-white shadow text-blue-600' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
        onClick={() => onModeChange('dubber')}
      >
        Dubber
      </button>
      <button
        className={`px-3 py-1 rounded ${
          mode === 'localizer' 
            ? 'bg-white shadow text-blue-600' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
        onClick={() => onModeChange('localizer')}
      >
        Localizer
      </button>
    </div>
  );
} 