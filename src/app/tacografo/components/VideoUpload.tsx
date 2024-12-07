'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FloatingVideo } from './FloatingVideo';
import { formatVideoTime } from '../utils/time';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  videoUrl: string | null;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onCreateTakeAtCurrentTime?: (time: string) => void;
}

export function VideoUpload({ onVideoUpload, videoUrl, onVideoRef, onCreateTakeAtCurrentTime }: VideoUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      onVideoUpload(file);
    }
  }, [onVideoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    multiple: false
  });

  const [isFloating, setIsFloating] = useState(false);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Ensure video ref is set when video loads
  useEffect(() => {
    if (mainVideoRef.current) {
      onVideoRef?.(mainVideoRef.current);
    }
  }, [mainVideoRef.current, onVideoRef]);

  const handleCreateTake = useCallback(() => {
    if (!mainVideoRef.current) {
      console.warn('Video ref is null in handleCreateTake');
      return;
    }
    const currentTime = formatVideoTime(mainVideoRef.current.currentTime);
    console.log('VideoUpload: Creating take at time:', currentTime);
    onCreateTakeAtCurrentTime?.(currentTime);
  }, [onCreateTakeAtCurrentTime]);

  if (videoUrl) {
    return (
      <div className="w-full mb-8">
        <div className="max-w-2xl mx-auto">
          {!isFloating && (
            <div className="relative">
              <video
                controls
                className="w-full rounded-lg shadow-lg h-auto"
                src={videoUrl}
                ref={mainVideoRef}
                onLoadedMetadata={() => onVideoRef?.(mainVideoRef.current)}
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleCreateTake}
                  className="text-white bg-green-500 bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                  title="Create take at current time"
                >
                  +
                </button>
                <button
                  onClick={() => setIsFloating(true)}
                  className="text-white bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                  title="Float video"
                >
                  ↗
                </button>
                <button
                  onClick={() => onVideoUpload(null as any)}
                  className="text-white bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-70"
                  title="Remove video"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {isFloating && (
            <FloatingVideo
              videoUrl={videoUrl}
              mainVideoRef={mainVideoRef.current}
              onClose={() => {
                setIsFloating(false);
                // Ensure video ref is updated when returning from floating mode
                onVideoRef?.(mainVideoRef.current);
              }}
              onCreateTakeAtCurrentTime={onCreateTakeAtCurrentTime}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full mb-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <p className="text-lg mb-2">
            {isDragActive
              ? "Drop the video here..."
              : "Drag & drop a video here, or click to select"
            }
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: MP4, WebM, Ogg
          </p>
        </div>
      </div>
    </div>
  );
}
