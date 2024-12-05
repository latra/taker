import { useState, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { Take } from '../types';

export function useDragAndDrop(takes: Take[], setTakes: (takes: Take[]) => void) {
  const [dragOverTakeId, setDragOverTakeId] = useState<number | null>(null);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragOverTakeId(null);

    const { active, over } = event;
    if (!over) return;

    const [sourceId, sourceTakeId] = active.id.toString().split('-');
    const [overId, overTakeId] = over.id.toString().split('-');
    
    if (sourceTakeId === overTakeId) {
      // Same take reorder logic
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
      // Moving between takes logic
      // ... existing between-takes logic ...
    }
  }, [takes, setTakes]);

  const handleDragOver = useCallback((event: any) => {
    const { over } = event;
    if (!over) {
      setDragOverTakeId(null);
      return;
    }

    const [, overTakeId] = over.id.toString().split('-');
    setDragOverTakeId(parseInt(overTakeId));
  }, []);

  return {
    dragOverTakeId,
    setDragOverTakeId,
    handleDragEnd,
    handleDragOver
  };
} 