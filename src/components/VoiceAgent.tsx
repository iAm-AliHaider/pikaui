"use client";

import { useState, useEffect, useMemo } from "react";
import { useRoomContext, useLocalParticipant } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

interface VoiceAgentProps {
  onToggleMic?: (enabled: boolean) => void;
}

export function VoiceAgent({ onToggleMic }: VoiceAgentProps) {
  const room = useRoomContext();
  const localParticipant = useLocalParticipant();
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking] = useState(false);
  const [micError, setMicError] = useState<string>("");

  // Pre-compute bar heights to avoid Math.random in render
  const barHeights = useMemo(() => [12, 20, 8, 16, 24], []);

  useEffect(() => {
    if (!room) return;
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    if (room.state === "connected") setIsConnected(true);
    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  useEffect(() => {
    setIsMicEnabled(localParticipant?.isMicrophoneEnabled ?? false);
  }, [localParticipant?.isMicrophoneEnabled]);

  const toggleMic = async () => {
    if (!localParticipant?.localParticipant) return;

    // Check if getUserMedia is available (requires HTTPS or localhost)
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicError("Microphone requires HTTPS. Use localhost or enable HTTPS.");
      return;
    }

    try {
      setMicError("");
      const newState = !isMicEnabled;
      await localParticipant.localParticipant.setMicrophoneEnabled(newState);
      setIsMicEnabled(newState);
      onToggleMic?.(newState);
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
      setMicError("Microphone access denied. Check browser permissions.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="relative">
        <button
          onClick={toggleMic}
          disabled={!isConnected}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isMicEnabled
              ? "bg-gradient-to-br from-purple-600 to-cyan-500 shadow-lg shadow-purple-500/50 animate-pulse"
              : "bg-zinc-800 border-2 border-zinc-700 hover:border-purple-500"
          } ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}`}
        >
          {isMicEnabled ? (
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}

          {isSpeaking && (
            <span className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-75" />
          )}
        </button>

        {isMicEnabled && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400 rounded-full animate-pulse"
                style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-zinc-600"}`} />
          <span className="text-sm font-medium text-zinc-400">
            {isConnected ? (isMicEnabled ? "Listening..." : "Click to speak") : "Connecting..."}
          </span>
        </div>
        {micError && (
          <p className="text-xs text-red-400 text-center max-w-[200px]">{micError}</p>
        )}
      </div>
    </div>
  );
}
