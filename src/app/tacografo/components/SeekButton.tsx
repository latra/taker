'use client';

interface SeekButtonProps {
  time: string;
  videoRef: HTMLVideoElement | null;
}

export function SeekButton({ time, videoRef }: SeekButtonProps) {
  const handleSeek = () => {
    if (!videoRef || !time) return;

    // Convert time string (MM:SS) to seconds
    const [minutes, seconds] = time.split(':').map(Number);
    const totalSeconds = (minutes || 0) * 60 + (seconds || 0);

    videoRef.currentTime = totalSeconds;
    videoRef.play().catch(() => {
      // Handle autoplay restrictions
      console.log('Autoplay prevented');
    });
  };

  if (!time) return null;

  return (
    <button
      onClick={handleSeek}
      className="ml-2 text-xs text-blue-500 hover:text-blue-700 opacity-50 hover:opacity-100"
      title={`Seek video to ${time}`}
    >
      ▶
    </button>
  );
} 