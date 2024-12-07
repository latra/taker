import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { ScriptLine, TakeConfig, AppMode } from '../types';
import { LineTimer } from './LineTimer';
import { ValidationErrorIndicator } from './ValidationErrorIndicator';

export interface ScriptLineProps {
  line: ScriptLine;
  isLastLine: boolean;
  canDelete: boolean;
  onUpdate: (field: 'character' | 'dialogue' | 'originalDialogue', value: string) => void;
  onDelete: (focusField: 'char' | 'dial') => void;
  onTimerAdd: () => void;
  onTimerUpdate: (value: string) => void;
  onTimerRemove: () => void;
  onInsertAfter: () => void;
  inputRef: (el: HTMLInputElement | null, type: 'char' | 'dial') => void;
  onBlur: () => void;
  existingCharacters: string[];
  isTakeFocused: boolean;
  config: TakeConfig;
  validationErrors?: ValidationError[];
  mode: AppMode;
  videoRef?: HTMLVideoElement | null;
}

interface ValidationError {
  type: 'line' | 'character' | 'take';
  message: string;
}

export function ScriptLineComponent({
  line,
  isLastLine,
  canDelete,
  onUpdate,
  onDelete,
  onTimerAdd,
  onTimerUpdate,
  onTimerRemove,
  onInsertAfter,
  inputRef,
  onBlur,
  existingCharacters,
  isTakeFocused,
  config,
  validationErrors = [],
  mode,
  videoRef,
}: ScriptLineProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const updateSuggestions = (value: string) => {
    const currentInput = value.split(',').pop()?.trim() || '';
    
    if (!currentInput) {
      setSuggestions([]);
      return;
    }

    const matchingCharacters = existingCharacters.filter(char =>
      char.toLowerCase().includes(currentInput.toLowerCase())
    );
    setSuggestions(matchingCharacters);
  };

  const handleCharacterChange = (value: string) => {
    onUpdate('character', value);
    updateSuggestions(value);
    setShowSuggestions(true);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, 
    field: 'char' | 'dial'
  ) => {
    // Handle character suggestions
    if (e.shiftKey && e.code === 'Space') {
      e.preventDefault();
      if (suggestions.length > 0) {
        onUpdate('character', suggestions[0]);
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return;
    }

    // Handle delete line shortcut
    if (e.altKey && e.key.toLowerCase() === 'q' && canDelete) {
      e.preventDefault();
      onDelete(field);
      return;
    }

    // Handle character suggestions selection with Tab
    if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      if (selectedSuggestion >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedSuggestion]);
        setSuggestions([]);
        setShowSuggestions(false);
        // Move to next input
        const currentElement = e.target as HTMLElement;
        const allInputs = Array.from(
          document.querySelectorAll('input[type="text"], textarea')
        ) as HTMLElement[];
        const currentIndex = allInputs.indexOf(currentElement);
        const nextInput = allInputs[currentIndex + 1];
        if (nextInput) nextInput.focus();
        return;
      }
    }

    // Handle input field navigation (existing Tab handler)
    if (e.key === 'Tab' && (!showSuggestions || suggestions.length === 0)) {
      e.preventDefault();
      const currentElement = e.target as HTMLElement;
      const allInputs = Array.from(
        document.querySelectorAll('input[type="text"], textarea')
      ) as HTMLElement[];
      
      const currentIndex = allInputs.indexOf(currentElement);
      
      if (e.shiftKey) {
        // Move backwards
        const prevInput = allInputs[currentIndex - 1];
        if (prevInput) prevInput.focus();
      } else {
        // Move forwards
        const nextInput = allInputs[currentIndex + 1];
        if (nextInput) nextInput.focus();
      }
      return;
    }

    // Handle arrow keys for suggestions
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedSuggestion]);
        setSuggestions([]);
        setShowSuggestions(false);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }

    // Add new line shortcut
    if (e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      onInsertAfter();
      return;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const parts = line.character.split(',');
    parts.pop(); // Remove the last part
    
    const newValue = [...parts, suggestion]
      .map(p => p.trim())
      .filter(p => p)
      .join(', ');
    
    onUpdate('character', newValue);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    onBlur();
  };

  // Add auto-resize functionality for textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust height when mode changes or content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [line.dialogue, line.originalDialogue, mode]);

  const hasError = validationErrors?.some(error => error.type === 'line');

  return (
    <div 
      className="relative"
      data-line-id={line.id}
    >
      <div className="flex flex-col gap-1">
      <LineTimer
          timer={line.timer}
          onUpdate={onTimerUpdate}
          onRemove={onTimerRemove}
          onAdd={onTimerAdd}
          videoRef={videoRef || null}
        />
        <div className="flex gap-4 py-0.5">
          {validationErrors.length > 0 && (
            <ValidationErrorIndicator errors={validationErrors.map(e => e.message)} />
          )}
          <div className="relative flex-1">
            <input
              type="text"
              value={line.character}
              onChange={(e) => handleCharacterChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'char')}
              onBlur={handleBlur}
              onFocus={() => updateSuggestions(line.character)}
              placeholder="Character name"
              className="border p-2 rounded w-full"
              ref={(el) => inputRef(el, 'char')}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${
                      index === selectedSuggestion ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {mode === 'localizer' && (
            <textarea
              value={line.originalDialogue || ''}
              onChange={(e) => {
                onUpdate('originalDialogue', e.target.value);
                adjustTextareaHeight();
              }}
              placeholder="Original dialogue"
              className="border p-2 rounded flex-2 w-1/3 resize-none overflow-hidden"
              rows={1}
              style={{ minHeight: '42px' }}
            />
          )}

          <textarea
            value={line.dialogue}
            onChange={(e) => {
              onUpdate('dialogue', e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={(e) => handleKeyDown(e, 'dial')}
            placeholder={mode === 'localizer' ? "Translated dialogue" : "Dialogue"}
            className={`border p-2 rounded flex-2 ${
              mode === 'localizer' ? 'w-1/3' : 'w-2/3'
            } resize-none overflow-hidden ${
              hasError ? 'border-red-500' : ''
            }`}
            ref={textareaRef}
            rows={1}
            style={{ minHeight: '42px' }}
          />
          
          {canDelete && (
            <div className="flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked');
                  onDelete('char');
                }}
                className="opacity-0 hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 px-2"
                title="Remove line"
              >
                ×
              </button>
            </div>
          )}
        </div>

      </div>

      {!isLastLine && (
        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2">
          <button
            onClick={onInsertAfter}
            className="opacity-0 hover:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md transition-all transform hover:scale-110"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
} 