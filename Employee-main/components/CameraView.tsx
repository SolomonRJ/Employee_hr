
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    getCameraStream();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="relative w-full h-full">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-white p-4 text-center">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-center items-center">
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white bg-transparent"
          aria-label="Capture photo"
        ></button>
      </div>
       <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-lg font-bold"
          aria-label="Close camera"
        >
          X
        </button>
    </div>
  );
};

export default CameraView;
