import { useState } from 'react';
import { EditableTakeTitle } from './EditableTakeTitle';

interface MergeConfirmation {
  isOpen: boolean;
  oldName: string;
  newName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface CharactersListProps {
  characters: string[];
  onCharacterRename: (oldName: string, newName: string) => void;
  onCharactersMerge: (oldName: string, newName: string) => void;
  selectedCharacters: Set<string>;
  onToggleCharacter: (character: string) => void;
  onClearSelection: () => void;
}

export function CharactersList({ 
  characters, 
  onCharacterRename, 
  onCharactersMerge,
  selectedCharacters,
  onToggleCharacter,
  onClearSelection
}: CharactersListProps) {
  const [mergeConfirm, setMergeConfirm] = useState<MergeConfirmation | null>(null);

  const handleNameUpdate = async (oldName: string, newName: string) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || trimmedNewName === oldName) return;

    if (characters.includes(trimmedNewName)) {
      setMergeConfirm({
        isOpen: true,
        oldName,
        newName: trimmedNewName,
        onConfirm: () => {
          onCharactersMerge(oldName, trimmedNewName);
          setMergeConfirm(null);
        },
        onCancel: () => setMergeConfirm(null)
      });
    } else {
      onCharacterRename(oldName, trimmedNewName);
    }
  };

  return (
    <div className="text-sm text-gray-600">
      <div className="font-semibold mb-1">Characters:</div>
      <div className="flex flex-wrap gap-2">
        {characters.map(character => (
          character && (
            <div
              key={character}
              onClick={() => onToggleCharacter(character)}
              className={`
                cursor-pointer transition-colors
                ${selectedCharacters.has(character) 
                  ? 'bg-blue-100 hover:bg-blue-200' 
                  : 'bg-gray-100 hover:bg-gray-200'}
              `}
            >
              <EditableTakeTitle
                name={character}
                onUpdate={(newName) => handleNameUpdate(character, newName)}
                containerClassName="px-2 py-1 rounded"
              />
            </div>
          )
        ))}
      </div>

      {/* Show clear filters button if any characters are selected */}
      {selectedCharacters.size > 0 && (
        <button
          onClick={onClearSelection}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Clear filters
        </button>
      )}

      {/* Merge Confirmation Modal */}
      {mergeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Merge Characters</h3>
            <p className="mb-6">
              The character "{mergeConfirm.newName}" already exists. Do you want to merge 
              "{mergeConfirm.oldName}" into "{mergeConfirm.newName}"? This will update all 
              existing lines.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={mergeConfirm.onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={mergeConfirm.onConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 