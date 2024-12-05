import { useState, useRef, useEffect } from 'react';

interface EditableTakeTitleProps {
  name: string;
  onUpdate: (name: string) => void;
  containerClassName?: string;
}

export function EditableTakeTitle({ 
  name, 
  onUpdate,
  containerClassName = ''
}: EditableTakeTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim()) {
      onUpdate(editValue.trim());
    } else {
      setEditValue(name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(name);
    }
  };

  if (isEditing) {
    return (
      <div className={containerClassName}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-xl font-semibold bg-transparent border-b border-gray-300 outline-none focus:border-blue-500"
        />
      </div>
    );
  }

  return (
    <div 
      className={containerClassName}
      onDoubleClick={handleDoubleClick}
      title="Double click to rename"
    >
      <h2 className="text-xl font-semibold cursor-pointer hover:text-gray-600">
        {name}
      </h2>
    </div>
  );
} 