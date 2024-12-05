import { useState, useCallback } from 'react';

export function useVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const handleVideoUpload = useCallback((file: File | null) => {
    if (videoFile) {
      URL.revokeObjectURL(videoUrl || '');
    }
    
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoUrl(null);
    }
  }, [videoFile, videoUrl]);

  return {
    videoFile,
    videoUrl,
    videoRef,
    setVideoRef,
    handleVideoUpload
  };
} 