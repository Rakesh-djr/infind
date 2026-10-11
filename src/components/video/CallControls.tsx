"use client";

import React from "react";
import { MatchmakingState } from "@/hooks/useMatchmaking";
import { Button } from "@/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  FastForward,
  PhoneOff,
  MessageSquare,
  SlidersHorizontal,
  ShieldAlert,
  Ban,
  Sparkles,
  X,
} from "lucide-react";

interface CallControlsProps {
  matchState: MatchmakingState;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isChatOpen: boolean;
  activeFilterCount: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onOpenFilters: () => void;
  onStartMatching: () => void;
  onCancelMatching: () => void;
  onSkip: () => void;
  onEndCall: () => void;
  onReport: () => void;
  onBlock: () => void;
  className?: string;
}

export const CallControls: React.FC<CallControlsProps> = ({
  matchState,
  isAudioEnabled,
  isVideoEnabled,
  isChatOpen,
  activeFilterCount,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onOpenFilters,
  onStartMatching,
  onCancelMatching,
  onSkip,
  onEndCall,
  onReport,
  onBlock,
  className = "",
}) => {
  const isConnected = matchState === "CONNECTED";
  const isSearching = matchState === "SEARCHING";

  return (
    <div
      className={`flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-[#0c101c]/90 border border-white/10 backdrop-blur-xl shadow-glass ${className}`}
    >
      {/* Left controls: Safety / Filter controls */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <button
              onClick={onReport}
              title="Report Stranger"
              className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors border border-transparent hover:border-amber-500/20"
              aria-label="Report stranger"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
            <button
              onClick={onBlock}
              title="Block Stranger"
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors border border-transparent hover:border-red-500/20"
              aria-label="Block stranger"
            >
              <Ban className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenFilters}
            title="Matching Filters"
            className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
            aria-label="Matching filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Center primary controls: Video / Call buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Audio */}
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-xl transition-all ${
            isAudioEnabled
              ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
          }`}
          title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
          aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Toggle Video */}
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-xl transition-all ${
            isVideoEnabled
              ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
          }`}
          title={isVideoEnabled ? "Disable Camera" : "Enable Camera"}
          aria-label={isVideoEnabled ? "Disable camera" : "Enable camera"}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Main Action: Match / Skip / Cancel */}
        {isSearching && (
          <Button variant="secondary" onClick={onCancelMatching} className="gap-2">
            <X className="w-4 h-4" />
            Cancel Search
          </Button>
        )}

        {isConnected && (
          <>
            <Button
              variant="primary"
              onClick={onSkip}
              className="gap-2 font-semibold shadow-glow px-4 sm:px-6"
            >
              <FastForward className="w-4 h-4" />
              <span>Next</span>
            </Button>
            <Button
              variant="danger"
              size="icon"
              onClick={onEndCall}
              title="End Call"
              aria-label="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </>
        )}

        {!isConnected && !isSearching && (
          <Button
            variant="primary"
            onClick={onStartMatching}
            className="gap-2 font-semibold shadow-glow px-5 sm:px-7"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Matching</span>
          </Button>
        )}
      </div>

      {/* Right controls: Text Chat toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleChat}
          className={`p-2.5 rounded-xl transition-all border ${
            isChatOpen
              ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
              : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
          }`}
          title="Toggle Text Chat"
          aria-label="Toggle text chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
