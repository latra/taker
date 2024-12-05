'use client';

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { formatVideoTime } from '../utils/time';

interface FloatingVideoProps {
  videoUrl: string;
  mainVideoRef: HTMLVideoElement | null;
  onClose: () => void;
  onCreateTakeAtCurrentTime?: (time: string) => void;
}

export function FloatingVideo({ videoUrl, mainVideoRef, onClose, onCreateTakeAtCurrentTime }: FloatingVideoProps) {
  const [size, setSize] = useState({ width: 320, height: 180 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const floatingVideoRef = useRef<HTMLVideoElement>(null);

  // Sync video state with main video
  useEffect(() => {
    if (!mainVideoRef || !floatingVideoRef.current) return;
    
    const syncVideo = () => {
      if (floatingVideoRef.current) {
        floatingVideoRef.current.currentTime = mainVideoRef.currentTime;
      }
    };

    // Initial sync
    syncVideo();
    
    // Keep in sync
    mainVideoRef.addEventListener('timeupdate', syncVideo);
    mainVideoRef.addEventListener('play', () => floatingVideoRef.current?.play());
    mainVideoRef.addEventListener('pause', () => floatingVideoRef.current?.pause());

    return () => {
      mainVideoRef.removeEventListener('timeupdate', syncVideo);
      mainVideoRef.removeEventListener('play', () => floatingVideoRef.current?.play());
      mainVideoRef.removeEventListener('pause', () => floatingVideoRef.current?.pause());
    };
  }, [mainVideoRef]);

  const handleCreateTake = () => {
    if (!mainVideoRef) return;
    const currentTime = formatVideoTime(mainVideoRef.currentTime);
    onCreateTakeAtCurrentTime?.(currentTime);
  };

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <Rnd
        size={size}
        position={position}
        onDragStop={(e, d) => {
          setPosition({ x: d.x, y: d.y });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          setSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          setPosition(position);
        }}
        className="pointer-events-auto"
        bounds="window"
        minWidth={200}
        minHeight={112}
      >
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={floatingVideoRef}
            src={videoUrl}
            className="w-full h-full"
            controls
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleCreateTake}
              className="pointer-events-auto text-white bg-green-500 bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
              title="Create take at current time"
            >
              +
            </button>
            <button
              onClick={onClose}
              className="pointer-events-auto text-white bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
              title="Close floating video"
            >
              ×
            </button>
          </div>
        </div>
      </Rnd>
    </div>
  );
} 