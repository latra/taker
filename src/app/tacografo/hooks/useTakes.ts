import { useState, useCallback } from 'react';
import { Take, ScriptLine } from '../types';
import { useTimeFormat } from './useTimeFormat';
import { splitCharacters } from '../utils/characters';

export function useTakes() {
  const [takes, setTakes] = useState<Take[]>([
    { id: 1, name: 'Take 1', timer: '', lines: [{ id: 0, character: '', dialogue: '', timer: null }], prev: null, next: null }
  ]);
  
  const { formatTimeInput } = useTimeFormat();

  // Memoize utility functions
  const getNextLineId = useCallback(() => {
    const allLineIds = takes.flatMap(t => t.lines.map(l => l.id));
    return Math.max(...allLineIds, 0) + 1;
  }, [takes]);

  const getNextTakeId = useCallback(() => {
    return Math.max(...takes.map(t => t.id), 0) + 1;
  }, [takes]);

  const createEmptyLine = useCallback((id: number): ScriptLine => ({
    id,
    character: '',
    dialogue: '',
    timer: null
  }), []);
  const focusTimer = () => {
    const allTakes = document.querySelectorAll('[data-take-id]');
    const lastTake = allTakes[allTakes.length - 1];
    if (lastTake) {
      const timerInput = lastTake.querySelector('input[placeholder="00:00"]');
      if (timerInput instanceof HTMLInputElement) {
        // remove the current focus
        (document.activeElement as HTMLElement)?.blur();

        timerInput.focus();
        timerInput.select();
      }
    }
  };
  // Memoize addNewTake function
  const addNewTake = useCallback(() => {

    const newTakeId = getNextTakeId();
    const newLineId = getNextLineId();
    
    setTakes(prev => [...prev, {
      id: newTakeId,
      name: `Take ${newTakeId}`,
      timer: '',
      lines: [createEmptyLine(newLineId)],
      prev: prev[prev.length - 1]?.id || null,
      next: null
    }]);

    // More robust focus handling


    // Try multiple times in case of race conditions
    setTimeout(focusTimer, 0);
    setTimeout(focusTimer, 50);  // Backup attempt
  }, [getNextTakeId, getNextLineId, createEmptyLine]);

  const removeTake = useCallback((takeId: number) => {
    if (takes.length <= 1) return;
    
    setTakes(prev => prev.filter(take => take.id !== takeId));
  }, [takes.length]);

  const updateTakeTimer = (takeId: number, value: string) => {
    setTakes(takes.map(take => 
      take.id === takeId 
        ? { ...take, timer: formatTimeInput(value) }
        : take
    ));
  };

  const updateTakeName = (takeId: number, name: string) => {
    setTakes(takes.map(take => 
      take.id === takeId 
        ? { ...take, name }
        : take
    ));
  };

  // Line management functions
  const addNewLine = (takeId: number) => {
    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;
      return {
        ...take,
        lines: [...take.lines, createEmptyLine(getNextLineId())]
      };
    }));
  };

  const removeLine = (takeId: number, lineId: number) => {
    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;
      if (take.lines.length <= 1) return take;
      return {
        ...take,
        lines: take.lines.filter(line => line.id !== lineId)
      };
    }));
  };

  const updateLine = (
    takeId: number, 
    lineId: number, 
    field: 'character' | 'dialogue' | 'originalDialogue', 
    value: string
  ) => {
    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;

      const updatedLines = take.lines.map(line => {
        if (line.id !== lineId) return line;
        return { ...line, [field]: value };
      });

      // Only add new line if editing dialogue field and it's the last line
      const isLastLine = lineId === take.lines[take.lines.length - 1].id;
      if (isLastLine && value.length === 1 && field === 'dialogue') {
        updatedLines.push(createEmptyLine(getNextLineId()));
      }

      return { ...take, lines: updatedLines };
    }));
  };

  const insertLineBetween = (takeId: number, afterLineId: number): number => {
    const newLineId = getNextLineId();

    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;
      
      const insertIndex = take.lines.findIndex(l => l.id === afterLineId) + 1;
      
      return {
        ...take,
        lines: [
          ...take.lines.slice(0, insertIndex),
          createEmptyLine(newLineId),
          ...take.lines.slice(insertIndex)
        ]
      };
    }));

    return newLineId;
  };

  // Timer functions
  const addLineTimer = (takeId: number, lineId: number) => {
    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;
      return {
        ...take,
        lines: take.lines.map(line => 
          line.id === lineId 
            ? { ...line, timer: '' }
            : line
        )
      };
    }));
  };

  const updateLineTimer = (takeId: number, lineId: number, value: string) => {
    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;
      return {
        ...take,
        lines: take.lines.map(line => 
          line.id === lineId 
            ? { ...line, timer: formatTimeInput(value) }
            : line
        )
      };
    }));
  };

  const removeLineTimer = (takeId: number, lineId: number) => {
    setTakes(takes.map(take => {
      if (take.id !== takeId) return take;
      return {
        ...take,
        lines: take.lines.map(line => 
          line.id === lineId 
            ? { ...line, timer: null }
            : line
        )
      };
    }));
  };

  // Character management functions
  const renameCharacter = (oldName: string, newName: string) => {
    setTakes(takes.map(take => ({
      ...take,
      lines: take.lines.map(line => ({
        ...line,
        character: splitCharacters(line.character)
          .map(char => char === oldName ? newName : char)
          .join(', ')
      }))
    })));
  };

  const mergeCharacters = (oldName: string, newName: string) => {
    setTakes(takes.map(take => ({
      ...take,
      lines: take.lines.map(line => ({
        ...line,
        character: splitCharacters(line.character)
          .map(char => char === oldName ? newName : char)
          .join(', ')
      }))
    })));
  };

  // Take operations
  const splitTakeAtLine = (takeId: number, lineId: number) => {
    const takeIndex = takes.findIndex(t => t.id === takeId);
    const take = takes[takeIndex];
    const lineIndex = take.lines.findIndex(l => l.id === lineId);
    
    // Safety checks
    if (takeIndex === -1 || lineIndex === -1) return;
    
    const selectedLine = take.lines[lineIndex];
    const isEmptyLine = !selectedLine.character.trim() && !selectedLine.dialogue.trim();
    let nextLineId = getNextLineId();

    // Create new take
    const newTake = {
      id: getNextTakeId(),
      name: `Take ${getNextTakeId()}`,
      timer: '',
      lines: [
        ...take.lines.slice(lineIndex + 1).filter(line => 
          line.character.trim() || line.dialogue.trim()
        ),
        createEmptyLine(nextLineId++)
      ],
      prev: takeId,
      next: null
    };

    // Update original take
    const updatedTakes = takes.map(t => {
      if (t.id !== takeId) return t;
      return {
        ...t,
        lines: [
          ...t.lines.slice(0, lineIndex + 1),
          ...(isEmptyLine ? [] : [createEmptyLine(nextLineId++)])
        ]
      };
    });

    setTakes([
      ...updatedTakes.slice(0, takeIndex + 1).map(t => ({ ...t, next: newTake.id })),
      newTake,
      ...updatedTakes.slice(takeIndex + 1).map(t => ({ ...t, prev: newTake.id }))
    ]);
    setTimeout(focusTimer, 0);
    setTimeout(focusTimer, 50)
  };

  // const mergeTakes = (firstTakeId: number, secondTakeId: number) => {
  //   const firstTakeIndex = takes.findIndex(t => t.id === firstTakeId);
  //   const secondTakeIndex = takes.findIndex(t => t.id === secondTakeId);
    
  //   // Safety check
  //   if (firstTakeIndex === -1 || secondTakeIndex === -1) return;
    
  //   const firstTake = takes[firstTakeIndex];
  //   const secondTake = takes[secondTakeIndex];

  //   // Get non-empty lines from both takes
  //   const nonEmptyLines = [
  //     ...firstTake.lines.filter(line => 
  //       line.character.trim() || line.dialogue.trim()
  //     ),
  //     ...secondTake.lines.filter(line => 
  //       line.character.trim() || line.dialogue.trim()
  //     ),
  //     createEmptyLine(getNextLineId())
  //   ];

  //   setTakes(
  //     takes
  //       .map(take => take.id === firstTakeId ? { ...take, lines: nonEmptyLines } : take)
  //       .filter(take => take.id !== secondTakeId)
  //   );
  // };

  const createTakeWithTimer = useCallback((timer: string) => {
    const newTakeId = getNextTakeId();
    const newLineId = getNextLineId();
    
    setTakes(prev => [...prev, {
      id: newTakeId,
      name: `Take ${newTakeId}`,
      timer,
      lines: [createEmptyLine(newLineId)],
      prev: prev[prev.length - 1]?.id || null,
      next: null
    }]);

    // Schedule focus for next render
    setTimeout(() => {
      const refKey = `${newTakeId}-${newLineId}`;
      const charInput = document.querySelector(`[data-take-id="${newTakeId}"] input[type="text"]`);
      if (charInput instanceof HTMLInputElement) {
        charInput.focus();
      }
    }, 0);
  }, [getNextTakeId, getNextLineId, createEmptyLine]);

  return {
    takes,
    setTakes,
    addNewTake,
    removeTake,
    updateTakeTimer,
    updateTakeName,
    addNewLine,
    removeLine,
    updateLine,
    insertLineBetween,
    addLineTimer,
    updateLineTimer,
    removeLineTimer,
    renameCharacter,
    mergeCharacters,
    splitTakeAtLine,
    // mergeTakes,
    createTakeWithTimer,
  };
} 