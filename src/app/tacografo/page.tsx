'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ConfirmationModal, ScriptLine, Take } from './types';
import { useTakes } from './hooks/useTakes';
import { useCharacters } from './hooks/useCharacters';
import { ScriptLineComponent, ScriptLineProps } from './components/ScriptLine';
import { EditableTakeTitle } from './components/EditableTakeTitle';
import { ShortcutsCheatsheet } from './components/ShortcutsCheatsheet';
import { CharactersList } from './components/CharactersList';
import { ConfigModal } from './components/ConfigModal';
import { TakeConfig } from './types';
import { validateTake } from './utils/validation';
import { ValidationErrorIndicator } from './components/ValidationErrorIndicator';
import { exportScript } from './utils/export';
import { importScript } from './utils/import';
import { ModeToggle } from './components/ModeToggle';
import { AppMode } from './types';
import { exportPdf } from './utils/exportPdf';
import { splitCharacters } from './utils/characters';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VideoUpload } from './components/VideoUpload';
import { SeekButton } from './components/SeekButton';
import { ClientOnly } from './components/ClientOnly';

// Update the confirmation modal state to include the current takes
interface ExtendedConfirmationModal extends ConfirmationModal {
  currentTakes?: Take[];
}

export default function Tacografo() {
  const {
    takes,
    setTakes,
    addNewTake,
    removeTake,
    updateTakeTimer,
    updateTakeName,
    removeLine,
    updateLine,
    insertLineBetween,
    addLineTimer,
    updateLineTimer,
    removeLineTimer,
    renameCharacter,
    mergeCharacters,
    splitTakeAtLine,
    createTakeWithTimer,
    handleTimerBlur,
  } = useTakes();
  
  const { updateCharacters, getCharactersList } = useCharacters();

  const handleFocusOut = useCallback(() => {
    updateCharacters(takes);
  }, [takes, updateCharacters]);

  // Update the state type
  const [confirmModal, setConfirmModal] = useState<ExtendedConfirmationModal>({
    isOpen: false,
    takeId: null
  });
  
  const inputRefs = useRef<{ [key: string]: { char: HTMLInputElement | null, dial: HTMLInputElement | null } }>({});

  // Update the delete click handler
  const handleDeleteTakeClick = useCallback((takeId: number) => {
    setConfirmModal({ isOpen: true, takeId });
  }, []);

  // Update the confirm handler
  const handleConfirmDelete = () => {
    if (confirmModal.takeId) {
      const updatedTakes = takes.filter(take => take.id !== confirmModal.takeId);
      setTakes(updatedTakes);  // Update takes immediately
      removeTake(confirmModal.takeId);
      setConfirmModal({ isOpen: false, takeId: null });
      
      // Update characters with the filtered takes
      setTimeout(() => {
        updateCharacters(updatedTakes);
      }, 0);
    }
  };

  // Add state to track the focused take
  const [focusedTakeId, setFocusedTakeId] = useState<number | null>(null);

  // Add this function to track the focused take based on input focus
  const updateFocusedTakeFromInput = (element: HTMLElement | null) => {
    if (!element) return;
    
    // Find the take container by traversing up the DOM
    const takeContainer = element.closest('[data-take-id]');
    if (takeContainer) {
      const takeId = parseInt(takeContainer.getAttribute('data-take-id') || '');
      if (!isNaN(takeId)) {
        setFocusedTakeId(takeId);
      }
    }
  };

  // Modify the keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement;
      
      if (e.altKey && e.key.toLowerCase() === 't') {
        console.log('alt + t');
        e.preventDefault();
        if (isInputActive) {
          // Find the current line and take
          const lineContainer = activeElement.closest('[data-line-id]');
          const takeContainer = activeElement.closest('[data-take-id]');
          if (lineContainer && takeContainer) {
            const lineId = parseInt(lineContainer.getAttribute('data-line-id') || '');
            const takeId = parseInt(takeContainer.getAttribute('data-take-id') || '');
            if (!isNaN(lineId) && !isNaN(takeId)) {
              splitTakeAtLine(takeId, lineId);
              return;
            }
          }
        } else {
          addNewTake();
        }
      }

      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        if (activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
      }

      // Update take deletion shortcut
      if (e.altKey && e.key.toLowerCase() === 'p' && isInputActive) {
        e.preventDefault();
        if (activeElement instanceof HTMLElement) {
          console.log('deleting take');
          console.log('activeElement', activeElement);
          updateFocusedTakeFromInput(activeElement);
          if (focusedTakeId && takes.length > 1) {
            handleDeleteTakeClick(focusedTakeId);
          }
        }
      }

      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        exportPdf(takes);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addNewTake, takes.length, focusedTakeId, takes, splitTakeAtLine]);

  const handleLineDelete = (takeId: number, lineId: number, focusField: 'char' | 'dial') => {
    console.log('handleLineDelete called', { takeId, lineId, focusField });  // Add debug log
    const takeIndex = takes.findIndex(t => t.id === takeId);
    const lineIndex = takes[takeIndex].lines.findIndex(l => l.id === lineId);
    
    // Remove the line
    removeLine(takeId, lineId);
    updateCharacters(takes);

    // Schedule focus for next render
    setTimeout(() => {
      const take = takes[takeIndex];
      if (!take) return;

      // Always focus on character field when deleting from dialogue
      const targetField = focusField === 'dial' ? 'char' : focusField;

      // If there are more lines after this one, focus the next line
      if (lineIndex < take.lines.length - 1) {
        const nextLineId = take.lines[lineIndex + 1].id;
        const refKey = `${takeId}-${nextLineId}`;
        inputRefs.current[refKey]?.[targetField]?.focus();
      }
      // If this was the last line, focus the previous line
      else if (lineIndex > 0) {
        const prevLineId = take.lines[lineIndex - 1].id;
        const refKey = `${takeId}-${prevLineId}`;
        inputRefs.current[refKey]?.[targetField]?.focus();
      }
    }, 0);
  };

  // Add state for config
  const [config, setConfig] = useState<TakeConfig>({
    maxLinesPerTake: 8,
    maxLinesPerCharacter: 5,
    maxCharsPerLine: 60,
    actionMarks: {
      start: '(',
      end: ')'
    }
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedTakes = await importScript(file);
      setTakes(importedTakes); // Add setTakes to the useTakes hook return value
      updateCharacters(importedTakes);
    } catch (error) {
      // You might want to add proper error handling here
      alert('Error importing script: ' + (error as Error).message);
    }

    // Clear the input
    e.target.value = '';
  };

  const [mode, setMode] = useState<AppMode>('dubber');

  // Add this state after other state declarations
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());

  // Update the filter function to handle multiple characters per line
  const filterTakesByCharacters = (take: Take): boolean => {
    if (selectedCharacters.size === 0) return true;
    
    return take.lines.some(line => {
      if (!line.character.trim()) return false;
      
      // Split the line's characters and check if any of them is selected
      const lineCharacters = splitCharacters(line.character);
      return lineCharacters.some(char => selectedCharacters.has(char));
    });
  };

  // Add toggle function for character selection
  const toggleCharacter = (character: string) => {
    setSelectedCharacters(prev => {
      const next = new Set(prev);
      if (next.has(character)) {
        next.delete(character);
      } else {
        next.add(character);
      }
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    // Clear the drag over state immediately
    setDragOverTakeId(null);

    const { active, over } = event;
    if (!over) return;

    const [sourceId, sourceTakeId] = active.id.toString().split('-');
    const [overId, overTakeId] = over.id.toString().split('-');
    
    if (sourceTakeId === overTakeId) {
      // Same take, just reorder
      const takeIndex = takes.findIndex(t => t.id === parseInt(sourceTakeId));
      const take = takes[takeIndex];
      const oldIndex = take.lines.findIndex(l => l.id.toString() === sourceId);
      const newIndex = take.lines.findIndex(l => l.id.toString() === overId);

      const newTakes = takes.map(t => {
        if (t.id !== parseInt(sourceTakeId)) return t;

        const newLines = [...t.lines];
        const [movedLine] = newLines.splice(oldIndex, 1);
        newLines.splice(newIndex, 0, movedLine);

        return { ...t, lines: newLines };
      });

      setTakes(newTakes);
    } else {
      // Moving between takes
      const sourceTakeIndex = takes.findIndex(t => t.id === parseInt(sourceTakeId));
      const destTakeIndex = takes.findIndex(t => t.id === parseInt(overTakeId));
      
      const sourceTake = takes[sourceTakeIndex];
      const destTake = takes[destTakeIndex];
      
      const lineIndex = sourceTake.lines.findIndex(l => l.id.toString() === sourceId);
      const overIndex = destTake.lines.findIndex(l => l.id.toString() === overId);
      
      const newTakes = takes.map(take => {
        if (take.id === parseInt(sourceTakeId)) {
          return {
            ...take,
            lines: take.lines.filter(l => l.id.toString() !== sourceId)
          };
        }
        if (take.id === parseInt(overTakeId)) {
          const newLines = [...take.lines];
          newLines.splice(overIndex, 0, sourceTake.lines[lineIndex]);
          return { ...take, lines: newLines };
        }
        return take;
      });

      setTakes(newTakes);
    }
  };

  // Add new state for drag over
  const [dragOverTakeId, setDragOverTakeId] = useState<number | null>(null);

  // Add drag over handler
  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) {
      setDragOverTakeId(null);
      return;
    }

    const [, overTakeId] = over.id.toString().split('-');
    setDragOverTakeId(parseInt(overTakeId));
  };

  // Add these states after other state declarations
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Add this handler function
  const handleVideoUpload = (file: File | null) => {
    if (videoFile) {
      URL.revokeObjectURL(videoUrl || '');
    }
    
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoUrl(null);
    }
  };

  // Add this useEffect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or if a modal is open
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        confirmModal.isOpen ||
        isConfigOpen
      ) {
        return;
      }

      // Alt + T: New take
      if (e.altKey && e.key.toLowerCase() === 't') {
        console.log('alt + t');
        e.preventDefault();
        addNewTake();
      }
      
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addNewTake, focusedTakeId, handleDeleteTakeClick, confirmModal.isOpen, isConfigOpen]);

  const updateCharactersAfterChange = useCallback((oldName?: string, newName?: string) => {
    if (oldName && newName && selectedCharacters.has(oldName)) {
      setSelectedCharacters(prev => {
        const next = new Set(prev);
        next.delete(oldName);
        next.add(newName);
        return next;
      });
    }
    setTimeout(() => {
      updateCharacters(takes);
    }, 0);
  }, [takes, selectedCharacters, updateCharacters]);

  const handleVideoRef = useCallback((ref: HTMLVideoElement | null) => {
    console.log('Setting video ref:', ref);
    setVideoRef(ref);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Takeografo</h1>
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>
          <div className="flex items-center gap-4">
            {/* Import button */}
            <label className="cursor-pointer text-gray-600 hover:text-gray-800" title="Import script">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              📤
            </label>
            {/* Export JSON button */}
            <button
              onClick={() => exportScript(takes)}
              className="text-gray-600 hover:text-gray-800"
              title="Export as JSON"
            >
              📥
            </button>
            {/* Export PDF button */}
            <button
              onClick={() => exportPdf(takes)}
              className="text-gray-600 hover:text-gray-800"
              title="Export as PDF"
            >
              📄
            </button>
            {/* Settings button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-gray-600 hover:text-gray-800"
              title="Configure takes"
            >
              ⚙️
            </button>
          </div>
        </div>

        <ClientOnly>
          <VideoUpload
            onVideoUpload={handleVideoUpload}
            videoUrl={videoUrl}
            onVideoRef={handleVideoRef}
            onCreateTakeAtCurrentTime={(time: string) => {
              console.log('Creating take with time:', time);
              createTakeWithTimer(time);
            }}
          />
        </ClientOnly>

        <CharactersList
          characters={getCharactersList()}
          onCharacterRename={(oldName, newName) => {
            renameCharacter(oldName, newName);
            updateCharactersAfterChange(oldName, newName);
          }}
          onCharactersMerge={(oldName, newName) => {
            mergeCharacters(oldName, newName);
            updateCharactersAfterChange(oldName, newName);
          }}
          selectedCharacters={selectedCharacters}
          onToggleCharacter={toggleCharacter}
          onClearSelection={() => setSelectedCharacters(new Set())}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragCancel={() => setDragOverTakeId(null)}
        >
          {(() => {
            // Start with the first take that has prev = null
            const headTake = takes.find(take => take.prev === null);
            if (!headTake) return null;

            const orderedTakes: Take[] = [];
            let currentTake: Take | undefined = headTake;

            // Build ordered array following 'next' references
            while (currentTake) {
              if (filterTakesByCharacters(currentTake)) {
                orderedTakes.push(currentTake);
              }
              currentTake = takes.find(take => take.id === currentTake?.next);
            }

            return orderedTakes.map((take) => {
              const validationErrors = validateTake(take, config);
              const hasTakeErrors = validationErrors.some(
                error => error.type === 'take' || error.type === 'character'
              );
              
              const isDragTarget = dragOverTakeId === take.id;
              
              return (
                <div key={take.id} className="relative mb-6" data-take-id={take.id}>
                  <div 
                    className={`
                      border rounded p-4 
                      ${hasTakeErrors ? 'border-red-500' : 'border-gray-200'} 
                      ${isDragTarget ? 'border-cyan-500 border-2 bg-cyan-50' : 'bg-white'} 
                      transition-all duration-200
                    `}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <EditableTakeTitle
                          name={take.name}
                          onUpdate={(name) => updateTakeName(take.id, name)}
                        />
                        {validationErrors.length > 0 && (
                          <ValidationErrorIndicator 
                            errors={validationErrors.map(e => e.message)}
                          />
                        )}
                      </div>
                      
                      {takes.length > 1 && (
                        <button
                          onClick={() => handleDeleteTakeClick(take.id)}
                          className="opacity-0 hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 px-2"
                          title="Remove take"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={take.timer}
                        onChange={(e) => updateTakeTimer(take.id, e.target.value)}
                        onBlur={() => handleTimerBlur(take.id)}
                        placeholder="00:00"
                        maxLength={6}
                        className="border rounded px-2 py-1 w-24 text-center font-mono"
                      />
                      {videoRef && <SeekButton time={take.timer} videoRef={videoRef} />}
                    </div>
                    
                    <SortableContext
                      items={take.lines.map(line => `${line.id}-${take.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-0">
                        {take.lines.map((line, lineIndex) => {
                          // Add this line to get validation errors for this specific line
                          const lineErrors = validationErrors.filter(
                            error => error.type === 'line' && error.lineIndex === lineIndex
                          );
                          
                          return (
                            <SortableLine
                              key={line.id}
                              id={`${line.id}-${take.id}`}
                              line={line}
                              lineIndex={lineIndex}
                              take={take}
                              isLastLine={lineIndex === take.lines.length - 1}
                              canDelete={true}
                              onUpdate={(field: "character" | "dialogue" | "originalDialogue", value: string) => updateLine(take.id, line.id, field, value)}
                              onDelete={(focusField: "char" | "dial") => handleLineDelete(take.id, line.id, focusField)}
                              onTimerAdd={() => addLineTimer(take.id, line.id)}
                              onTimerUpdate={(value: string) => updateLineTimer(take.id, line.id, value)}
                              onTimerRemove={() => removeLineTimer(take.id, line.id)}
                              onInsertAfter={() => {
                                const newLineId = insertLineBetween(take.id, line.id);
                                setTimeout(() => {
                                  const refKey = `${take.id}-${newLineId}`;
                                  inputRefs.current[refKey]?.char?.focus();
                                }, 0);
                              }}
                              onBlur={handleFocusOut}
                              inputRef={(el: HTMLInputElement | null, type: "char" | "dial") => {
                                const refKey = `${take.id}-${line.id}`;
                                if (!inputRefs.current[refKey]) {
                                  inputRefs.current[refKey] = { char: null, dial: null };
                                }
                                inputRefs.current[refKey][type] = el;
                              }}
                              existingCharacters={getCharactersList()}
                              isTakeFocused={focusedTakeId === take.id}
                              config={config}
                              validationErrors={lineErrors}
                              mode={mode}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            });
          })()}
        </DndContext>

        <button
          onClick={addNewTake}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors new-take-button"
        >
          New Take
        </button>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Take</h3>
            <p className="mb-6">Are you sure you want to delete this take? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmModal({ isOpen: false, takeId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={setConfig}
      />

      <ShortcutsCheatsheet />
    </main>
  );
}

// Create a new component for the sortable line
interface SortableLineProps extends Omit<ScriptLineProps, 'line'> {
  id: string;
  line: ScriptLine;
  lineIndex: number;
  take: Take;
}

function SortableLine({ id, line, lineIndex, take, ...props }: SortableLineProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`
        flex items-center
        ${isDragging ? 'bg-cyan-100 rounded' : ''}
      `}>
        <div
          {...attributes}
          {...listeners}
          className="px-2 cursor-move text-gray-400 hover:text-gray-600"
        >
          ⋮⋮
        </div>
        <div className="flex-1">
          <ScriptLineComponent
            {...props}
            line={line}
          />
        </div>
      </div>
      {isDragging && (
        <div className="absolute inset-0 border-2 border-cyan-500 rounded pointer-events-none" />
      )}
    </div>
  );
} 