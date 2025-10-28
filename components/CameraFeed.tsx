import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export type CameraFeedHandle = {
  captureFrame: () => string | null;
};

interface CameraFeedProps {
  videoSrc?: string;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(({ videoSrc }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Prefer rear camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        // Fallback to any camera if environment fails
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
        } catch (fallbackErr) {
            console.error("Fallback camera access error: ", fallbackErr);
        }
      }
    };
    
    if (videoSrc) {
        if(videoRef.current) {
            videoRef.current.srcObject = null; // Clear any existing camera stream
            videoRef.current.src = videoSrc;
            videoRef.current.loop = true;
        }
    } else {
        if (videoRef.current) {
            videoRef.current.src = ''; // Clear any existing video src
        }
        startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoSrc]);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          // Set canvas dimensions to match video to avoid distortion
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          return canvas.toDataURL('image/jpeg', 0.9);
        }
      }
      return null;
    },
  }));

  return (
    <div className="w-full h-full relative aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg shadow-md bg-black"
        controls={!!videoSrc} // Show controls only if it's an uploaded video
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 border-4 border-dashed border-white/50 rounded-lg flex items-center justify-center pointer-events-none">
        <div className="w-3/5 h-3/5 border-2 border-white rounded-md bg-black/10"></div>
      </div>
    </div>
  );
});
