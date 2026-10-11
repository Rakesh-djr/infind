"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { LocalVideo } from "@/components/video/LocalVideo";
import { RemoteVideo } from "@/components/video/RemoteVideo";
import { CallControls } from "@/components/video/CallControls";
import { ConnectionBadge } from "@/components/video/ConnectionBadge";
import { TextChatPanel } from "@/components/chat/TextChatPanel";
import { MatchingFilterModal } from "@/components/filters/MatchingFilterModal";
import { ReportModal } from "@/components/safety/ReportModal";
import { BlockModal } from "@/components/safety/BlockModal";
import { useAuth } from "@/hooks/useAuth";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useWebRTC } from "@/hooks/useWebRTC";
import { MatchingFilters } from "@/lib/validations";
import { AlertCircle } from "lucide-react";

export default function VideoChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Media streams & hardware devices
  const {
    stream: localStream,
    isAudioEnabled,
    isVideoEnabled,
    isPermissionGranted,
    permissionError,
    initializeMedia,
    toggleAudio,
    toggleVideo,
  } = useMediaDevices();

  // Matchmaking & Socket.IO coordination
  const {
    socket,
    state: matchState,
    matchId,
    partner,
    sharedInterests,
    isInitiator,
    messages,
    errorMessage,
    endReason,
    startMatching,
    cancelMatching,
    skipStranger,
    endCall,
    sendChatMessage,
  } = useMatchmaking();

  // WebRTC Peer Connection
  const { remoteStream, connectionStatus: rtcState } = useWebRTC({
    socket,
    localStream,
    matchId,
    isInitiator,
  });

  // UI state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Active filters cache
  const [filters, setFilters] = useState<MatchingFilters>({
    preferredCountries: [],
    preferredLanguages: [],
    interests: [],
  });

  // Redirect if not authenticated once auth loading finishes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Sync initial preferences from user profile
  useEffect(() => {
    if (user?.preference) {
      setFilters({
        preferredCountries: user.preference.preferredCountries || [],
        preferredLanguages: user.preference.preferredLanguages || [],
        interests: user.preference.interests || [],
      });
    }
  }, [user]);

  // Request media when ready
  const handleStartMatching = async () => {
    if (!isPermissionGranted) {
      const acquired = await initializeMedia();
      if (!acquired) return;
    }
    startMatching(filters);
  };

  const handleSkip = () => {
    skipStranger();
  };

  const handleEndCall = () => {
    endCall();
  };

  const activeFilterCount =
    (filters.preferredCountries?.length || 0) +
    (filters.preferredLanguages?.length || 0) +
    (filters.interests?.length || 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col text-slate-100 overflow-hidden">
      <BrandHeader />

      {/* Main Calling Stage Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-4 h-[calc(100vh-4rem)]">
        {/* Primary Video Stage Area */}
        <div className="flex-1 flex flex-col h-full min-h-0 relative">
          {/* Top Status & Indicator Header */}
          <div className="flex items-center justify-between mb-3 px-1 select-none">
            <ConnectionBadge
              matchState={matchState}
              rtcState={rtcState}
              sharedInterests={sharedInterests}
            />

            {permissionError && (
              <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Media Permission Blocked</span>
              </span>
            )}
          </div>

          {/* Video Panes Stage Container */}
          <div className="relative flex-1 min-h-0 w-full rounded-3xl overflow-hidden bg-[#0c101c] border border-white/10 shadow-glass flex items-center justify-center">
            {/* Remote Stranger Video Display (Full Stage) */}
            <RemoteVideo
              stream={remoteStream}
              matchState={matchState}
              rtcState={rtcState}
              partner={partner}
              endReason={endReason}
              errorMessage={errorMessage}
              onStartMatching={handleStartMatching}
              onSkip={handleSkip}
            />

            {/* Local Camera Preview PiP (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 z-30 w-36 sm:w-56 aspect-[4/3] sm:aspect-video">
              <LocalVideo
                stream={localStream}
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                isPermissionGranted={isPermissionGranted}
                onGrantPermission={initializeMedia}
              />
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="mt-3">
            <CallControls
              matchState={matchState}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              isChatOpen={isChatOpen}
              activeFilterCount={activeFilterCount}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              onOpenFilters={() => setIsFilterModalOpen(true)}
              onStartMatching={handleStartMatching}
              onCancelMatching={cancelMatching}
              onSkip={handleSkip}
              onEndCall={handleEndCall}
              onReport={() => setIsReportModalOpen(true)}
              onBlock={() => setIsBlockModalOpen(true)}
            />
          </div>
        </div>

        {/* Collapsible Text Chat Side Panel (Desktop Side Panel / Mobile Overlay) */}
        {isChatOpen && (
          <aside className="w-full lg:w-80 h-72 lg:h-full shrink-0 animate-fade-in">
            <TextChatPanel
              messages={messages}
              currentUserId={user?.id}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              onSendMessage={sendChatMessage}
              isConnected={matchState === "CONNECTED"}
            />
          </aside>
        )}
      </main>

      {/* Filter Preferences Modal */}
      <MatchingFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={filters}
        onSaveFilters={(newFilters) => setFilters(newFilters)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportedUserId={partner?.userId || null}
        reportedUsername={partner?.username || null}
        matchSessionId={matchId}
        onReportSuccess={() => {
          skipStranger();
        }}
      />

      {/* Block Modal */}
      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        blockedUserId={partner?.userId || null}
        blockedUsername={partner?.username || null}
        onBlockSuccess={() => {
          endCall();
        }}
      />
    </div>
  );
}
