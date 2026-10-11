import React from "react";
import { MatchmakingState } from "@/hooks/useMatchmaking";
import { RTCConnectionStatus } from "@/hooks/useWebRTC";

interface ConnectionBadgeProps {
  matchState: MatchmakingState;
  rtcState: RTCConnectionStatus;
  sharedInterests?: string[];
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({
  matchState,
  rtcState,
  sharedInterests = [],
}) => {
  let label = "Ready";
  let color = "bg-slate-400";
  let animate = false;

  if (matchState === "CONNECTING") {
    label = "Connecting to network...";
    color = "bg-amber-400";
    animate = true;
  } else if (matchState === "SEARCHING") {
    label = "Searching for someone...";
    color = "bg-brand-accent";
    animate = true;
  } else if (matchState === "CONNECTED") {
    if (rtcState === "connected") {
      label = "Live Connection";
      color = "bg-emerald-400";
      animate = false;
    } else if (rtcState === "negotiating" || rtcState === "connecting") {
      label = "Establishing peer stream...";
      color = "bg-cyan-400";
      animate = true;
    } else if (rtcState === "failed" || rtcState === "disconnected") {
      label = "Stream interrupted";
      color = "bg-red-400";
      animate = false;
    } else {
      label = "Stranger found";
      color = "bg-brand-400";
    }
  } else if (matchState === "ENDED") {
    label = "Call Ended";
    color = "bg-slate-400";
  } else if (matchState === "ERROR") {
    label = "Connection Error";
    color = "bg-red-500";
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-glass select-none">
      <span
        className={`w-2 h-2 rounded-full ${color} ${
          animate ? "animate-ping opacity-75" : ""
        }`}
      />
      <span>{label}</span>

      {sharedInterests.length > 0 && matchState === "CONNECTED" && (
        <span className="hidden sm:inline-flex items-center text-[11px] text-brand-300 ml-1 border-l border-white/15 pl-2">
          Shared: {sharedInterests.slice(0, 2).join(", ")}
          {sharedInterests.length > 2 ? ` +${sharedInterests.length - 2}` : ""}
        </span>
      )}
    </div>
  );
};
