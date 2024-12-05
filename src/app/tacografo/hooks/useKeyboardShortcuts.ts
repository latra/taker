import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  addNewTake: () => void;
  splitTakeAtLine: (takeId: number, lineId: number) => void;
  isConfigOpen: boolean;
  isConfirmModalOpen: boolean;
}

export function useKeyboardShortcuts({
  addNewTake,
  splitTakeAtLine,
  isConfigOpen,
  isConfirmModalOpen
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement;
      
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (isInputActive) {
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
          const newTakeButton = document.querySelector('button.new-take-button');
          if (newTakeButton instanceof HTMLButtonElement) {
            newTakeButton.click();
          }
        }
      }
    };

    if (!isConfigOpen && !isConfirmModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [addNewTake, splitTakeAtLine, isConfigOpen, isConfirmModalOpen]);
} 