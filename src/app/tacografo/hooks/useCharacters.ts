import { useState, useCallback } from 'react';
import { Take } from '../types';
import { splitCharacters } from '../utils/characters';

export function useCharacters() {
  const [characters, setCharacters] = useState<Set<string>>(new Set());

  const updateCharacters = useCallback((takes: Take[]) => {
    const usedCharacters = new Set<string>();
    
    takes.forEach(take => {
      take.lines.forEach(line => {
        if (line.character.trim()) {
          splitCharacters(line.character).forEach(char => {
            usedCharacters.add(char);
          });
        }
      });
    });

    setCharacters(usedCharacters);
  }, []);

  const getCharactersList = useCallback(() => {
    return Array.from(characters).sort();
  }, [characters]);

  return {
    characters,
    updateCharacters,
    getCharactersList
  };
} 