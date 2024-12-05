import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScriptLine, Take } from '../types';
import { ScriptLineComponent, ScriptLineProps } from './ScriptLine';

interface SortableLineProps extends Omit<ScriptLineProps, 'line'> {
  id: string;
  line: ScriptLine;
  lineIndex: number;
  take: Take;
}

export function SortableLine({ id, line, lineIndex, take, ...props }: SortableLineProps) {
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