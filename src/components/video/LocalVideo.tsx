"use client";

import React, { useRef, useEffect } from "react";
import { MicOff, VideoOff, User } from "lucide-react";

interface LocalVideoProps {
  stream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isPermissionGranted: boolean;
  onGrantPermission?: () => void;
  className?: string;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({
  stream,
  isAudioEnabled,
  isVideoEnabled,
  isPermissionGranted,
  onGrantPermission,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0c101c] border border-white/15 shadow-glass group ${className}`}
    >
      {/* Video Element */}
      {isPermissionGranted && isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Always mute local video to prevent audio feedback loop
          className="w-full h-full object-cover transform -scale-x-100" // Mirror local preview
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#0f1422] to-[#07090e]">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
            {!isPermissionGranted ? (
              <User className="w-6 h-6 text-slate-400" />
            ) : (
              <VideoOff className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <p className="text-xs font-medium text-slate-300">
            {!isPermissionGranted ? "Camera is off" : "Camera muted"}
          </p>
          {!isPermissionGranted && onGrantPermission && (
            <button
              onClick={onGrantPermission}
              className="mt-2 text-xs text-brand-400 hover:text-brand-300 underline font-medium"
            >
              Enable camera
            </button>
          )}
        </div>
      )}

      {/* Local Badge & Audio status overlay */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none select-none">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10">
          You
        </span>
        <div className="flex items-center gap-1">
          {!isAudioEnabled && (
            <span className="p-1 rounded-md bg-red-600/80 backdrop-blur-md text-white">
              <MicOff className="w-3 h-3" />
            </span>
          )}
          {!isVideoEnabled && (
            <span className="p-1 rounded-md bg-amber-600/80 backdrop-blur-md text-white">
              <VideoOff className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
