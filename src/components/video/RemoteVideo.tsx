"use client";

import React, { useRef, useEffect } from "react";
import { MatchmakingState, MatchPartner } from "@/hooks/useMatchmaking";
import { RTCConnectionStatus } from "@/hooks/useWebRTC";
import { Button } from "@/ui/button";
import { Video, Sparkles, User, RefreshCw, AlertCircle } from "lucide-react";

interface RemoteVideoProps {
  stream: MediaStream | null;
  matchState: MatchmakingState;
  rtcState: RTCConnectionStatus;
  partner: MatchPartner | null;
  endReason: string | null;
  errorMessage: string | null;
  onStartMatching: () => void;
  onSkip: () => void;
  className?: string;
}

export const RemoteVideo: React.FC<RemoteVideoProps> = ({
  stream,
  matchState,
  rtcState,
  partner,
  endReason,
  errorMessage,
  onStartMatching,
  onSkip,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn("[REMOTE_VIDEO_PLAY_WARNING]", err);
      });
    }
  }, [stream]);

  const hasLiveVideo =
    matchState === "CONNECTED" &&
    stream &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks()[0].enabled;

  return (
    <div
      className={`relative w-full h-full rounded-3xl overflow-hidden bg-[#07090e] border border-white/10 shadow-glass flex items-center justify-center ${className}`}
    >
      {/* Active Remote Stream Video Element */}
      {hasLiveVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* Hidden audio element if stream only has audio or video track is disabled */}
      {stream && !hasLiveVideo && (
        <audio
          ref={(audioEl) => {
            if (audioEl && stream) {
              audioEl.srcObject = stream;
              audioEl.play().catch(() => {});
            }
          }}
          autoPlay
        />
      )}

      {/* State Overlay: IDLE */}
      {matchState === "IDLE" && (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600/30 to-brand-accent/20 border border-white/15 flex items-center justify-center mb-6 shadow-glow">
            <Video className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Ready to meet someone new?
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Click Start Matching to connect with a random stranger across the globe via live video.
          </p>
          <Button size="lg" onClick={onStartMatching} className="w-full sm:w-auto min-w-[200px]">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Start Matching
          </Button>
        </div>
      )}

      {/* State Overlay: SEARCHING */}
      {matchState === "SEARCHING" && (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md animate-fade-in">
          {/* Radar Waves Animation */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            <span className="absolute w-full h-full rounded-full bg-brand-500/20 animate-ping opacity-75" />
            <span className="absolute w-20 h-20 rounded-full bg-brand-violet/30 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-brand-600/40 border border-brand-400/50 flex items-center justify-center shadow-glow">
              <RefreshCw className="w-7 h-7 text-cyan-300 animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
            Finding a connection...
          </h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Searching for an active stranger who matches your language and preferences.
          </p>
        </div>
      )}

      {/* State Overlay: CONNECTED but waiting for video negotiation */}
      {matchState === "CONNECTED" && !hasLiveVideo && (
        <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Connected with @{partner?.username || "Stranger"}
          </h3>
          <p className="text-xs text-slate-400">
            {rtcState === "negotiating" || rtcState === "connecting"
              ? "Negotiating video stream..."
              : "Stranger's camera is currently disabled"}
          </p>
        </div>
      )}

      {/* State Overlay: ENDED */}
      {matchState === "ENDED" && (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Conversation Ended</h3>
          <p className="text-xs text-slate-400 mb-6">
            {endReason || "The stranger has disconnected."}
          </p>
          <Button size="md" onClick={onSkip} className="min-w-[180px]">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Find Next Stranger
          </Button>
        </div>
      )}

      {/* State Overlay: ERROR */}
      {matchState === "ERROR" && (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Connection Problem</h3>
          <p className="text-xs text-red-300 mb-6">
            {errorMessage || "Unable to reach matchmaking server."}
          </p>
          <Button variant="secondary" size="md" onClick={onStartMatching}>
            Try Reconnecting
          </Button>
        </div>
      )}

      {/* Stranger Info Badge (Only when connected) */}
      {matchState === "CONNECTED" && partner && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">@{partner.username}</span>
        </div>
      )}
    </div>
  );
};
