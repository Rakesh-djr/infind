"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface MediaDeviceState {
  stream: MediaStream | null;
  hasAudio: boolean;
  hasVideo: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isPermissionGranted: boolean;
  permissionError: string | null;
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  selectedVideoDeviceId: string;
  selectedAudioDeviceId: string;
}

export function useMediaDevices() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;

  // Enumerate input devices
  const updateDeviceList = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
    } catch (err) {
      console.warn("[ENUMERATE_DEVICES_WARNING]", err);
    }
  }, []);

  // Request or update media stream
  const initializeMedia = useCallback(
    async (videoDeviceId?: string, audioDeviceId?: string) => {
      setPermissionError(null);

      // Clean up previous stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const constraints: MediaStreamConstraints = {
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
          video: videoDeviceId
            ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        setIsPermissionGranted(true);

        // Apply toggle states
        newStream.getAudioTracks().forEach((track) => {
          track.enabled = isAudioEnabled;
        });
        newStream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoEnabled;
        });

        await updateDeviceList();
        return newStream;
      } catch (err: unknown) {
        console.error("[GET_USER_MEDIA_ERROR]", err);
        const error = err as { name?: string; message?: string };
        let msg = "Could not access camera or microphone.";

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          msg = "Camera and microphone permissions were denied. Please allow camera and mic permissions in your browser settings.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          msg = "No camera or microphone found. Please connect a device.";
        } else if (error.name === "NotReadableError") {
          msg = "Camera or microphone is currently in use by another application.";
        }

        setPermissionError(msg);
        setIsPermissionGranted(false);
        return null;
      }
    },
    [isAudioEnabled, isVideoEnabled, updateDeviceList]
  );

  // Toggle microphone
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  }, []);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    setIsVideoEnabled((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  }, []);

  // Change camera device
  const switchVideoDevice = useCallback(
    async (deviceId: string) => {
      setSelectedVideoDeviceId(deviceId);
      await initializeMedia(deviceId, selectedAudioDeviceId);
    },
    [initializeMedia, selectedAudioDeviceId]
  );

  // Change microphone device
  const switchAudioDevice = useCallback(
    async (deviceId: string) => {
      setSelectedAudioDeviceId(deviceId);
      await initializeMedia(selectedVideoDeviceId, deviceId);
    },
    [initializeMedia, selectedVideoDeviceId]
  );

  // Clean up tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    stream,
    isAudioEnabled,
    isVideoEnabled,
    isPermissionGranted,
    permissionError,
    videoDevices,
    audioDevices,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    switchVideoDevice,
    switchAudioDevice,
  };
}
