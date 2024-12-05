import { useTimeFormat } from '../hooks/useTimeFormat';
import { SeekButton } from './SeekButton';

interface LineTimerProps {
  timer: string | null;
  onUpdate: (value: string) => void;
  onRemove: () => void;
  onAdd: () => void;
  videoRef: HTMLVideoElement | null;
}

export function LineTimer({ timer, onUpdate, onRemove, onAdd, videoRef }: LineTimerProps) {
  const { formatTimeInput } = useTimeFormat();

  if (timer !== null) {
    return (
      <div className="ml-4 mt-1 flex items-center gap-1 group/timer">
        <input
          type="text"
          value={timer}
          onChange={(e) => onUpdate(formatTimeInput(e.target.value))}
          placeholder="00:00"
          maxLength={5}
          className="border rounded px-2 py-1 w-16 text-center font-mono text-sm"
        />
        <SeekButton time={timer} videoRef={videoRef} />
        <button
          onClick={onRemove}
          className="opacity-0 group-hover/timer:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm px-2"
          title="Remove timer"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="ml-4 mt-1 h-6 flex items-center">
      <button
        onClick={onAdd}
        className="opacity-0 hover:opacity-100 transition-opacity text-sm text-blue-500 hover:text-blue-700"
      >
        + Add timer
      </button>
    </div>
  );
} 