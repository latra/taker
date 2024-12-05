import { useState, useCallback } from 'react';
import { Take, ScriptLine } from '../types';

export function useLinkedTakes() {
  // Store takes in a Map for O(1) access by ID
  const [takesMap, setTakesMap] = useState<Map<number, Take>>(new Map([
    [1, { 
      id: 1, 
      name: 'Take 1', 
      timer: '', 
      lines: [{ id: 0, character: '', dialogue: '', timer: null }],
      prev: null,
      next: null
    }]
  ]));
  
  // Store head and tail for easy traversal
  const [headId, setHeadId] = useState<number>(1);
  const [tailId, setTailId] = useState<number>(1);

  // Convert linked list to array for rendering
  const getTakesArray = useCallback((): Take[] => {
    const result: Take[] = [];
    let currentId: number | null = headId;
    
    while (currentId !== null) {
      const take = takesMap.get(currentId);
      if (!take) break;
      result.push(take);
      currentId = take.next;
    }
    
    return result;
  }, [takesMap, headId]);

  // Add new take
  const addNewTake = useCallback(() => {
    const newId = Math.max(...Array.from(takesMap.keys())) + 1;
    const newTake: Take = {
      id: newId,
      name: `Take ${newId}`,
      timer: '',
      lines: [{ id: Date.now(), character: '', dialogue: '', timer: null }],
      prev: tailId,
      next: null
    };

    // Update previous tail
    if (tailId) {
      const oldTail = takesMap.get(tailId);
      if (oldTail) {
        oldTail.next = newId;
        takesMap.set(tailId, oldTail);
      }
    }

    // Add new take and update tail
    takesMap.set(newId, newTake);
    setTakesMap(new Map(takesMap));
    setTailId(newId);
    
    if (!headId) setHeadId(newId);
  }, [takesMap, tailId, headId]);

  // Update take timer
  const updateTakeTimer = useCallback((takeId: number, value: string) => {
    const take = takesMap.get(takeId);
    if (!take) return;

    take.timer = value;
    takesMap.set(takeId, take);
    setTakesMap(new Map(takesMap));
  }, [takesMap]);

  // Remove take
  const removeTake = useCallback((takeId: number) => {
    const take = takesMap.get(takeId);
    if (!take) return;

    // Connect previous and next takes
    if (take.prev) {
      const prevTake = takesMap.get(take.prev);
      if (prevTake) {
        prevTake.next = take.next;
        takesMap.set(take.prev, prevTake);
      }
    }

    if (take.next) {
      const nextTake = takesMap.get(take.next);
      if (nextTake) {
        nextTake.prev = take.prev;
        takesMap.set(take.next, nextTake);
      }
    }

    // Update head/tail if necessary
    if (takeId === headId) setHeadId(take.next || 0);
    if (takeId === tailId) setTailId(take.prev || 0);

    // Remove take
    takesMap.delete(takeId);
    setTakesMap(new Map(takesMap));
  }, [takesMap, headId, tailId]);

  return {
    takes: getTakesArray(),
    addNewTake,
    removeTake,
    updateTakeTimer,
    // ... add other necessary methods
  };
} 