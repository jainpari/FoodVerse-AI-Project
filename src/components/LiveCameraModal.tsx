import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export const LiveCameraModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Food Photo',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    setLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings, or use image upload.'
          : 'Unable to access camera device. Please use file upload instead.'
      );
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base">{title}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-sm space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300">{error}</p>
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Overlays */}
              <div className="absolute inset-8 border-2 border-emerald-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                  <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                </div>
                <div className="text-center">
                  <span className="bg-black/50 text-white/80 text-[11px] px-3 py-1 rounded-full backdrop-blur-xs font-mono">
                    Center food or kitchen area in frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                  <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                </div>
              </div>
            </>
          )}

          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-950 flex items-center justify-between border-t border-slate-800/80">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Switch front/back camera"
          >
            <RefreshCw className="w-4 h-4" />
            Flip Camera
          </button>

          <button
            type="button"
            disabled={Boolean(error || loading)}
            onClick={handleCapture}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium rounded-full shadow-lg shadow-emerald-900/40 transition-transform active:scale-95"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white animate-pulse" />
            Snap Photo
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
