"use client";

import { useState, useEffect, useCallback } from "react";
import { PikAuiProvider } from "@/components/PikAuiProvider";
import { VoiceAgent } from "@/components/VoiceAgent";
import { GenerativePanel } from "@/components/GenerativePanel";
import { fetchToken } from "@/lib/livekit-config";

export default function Home() {
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [roomName] = useState(() => `pikAui-${Date.now()}`);

  useEffect(() => {
    async function getToken() {
      try {
        const identity = `user-${Date.now()}`;
        const { token: newToken } = await fetchToken(roomName, identity);
        setToken(newToken);
      } catch (err) {
        console.error("Failed to get token:", err);
        setError("Failed to connect to voice service");
      } finally {
        setIsLoading(false);
      }
    }
    getToken();
  }, [roomName]);

  const handleClear = useCallback((setComponents: (c: []) => void) => {
    setComponents([]);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Connecting to pikAui...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
          <p className="text-red-400 text-center text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-white/10 text-sm text-white hover:bg-white/20 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl safe-top">
        <div className="px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              pikAui
            </h1>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:block">Voice-Powered Generative UI</span>
        </div>
      </header>

      {/* Main Content */}
      <PikAuiProvider token={token}>
        {(components, setComponents) => (
          <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Voice Control - Top on mobile, Left on desktop */}
            <div className="flex-shrink-0 md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02]">
              <div className="flex flex-col items-center justify-center py-6 md:py-0 md:h-full">
                <VoiceAgent />
              </div>
            </div>

            {/* Generative Panel - Bottom on mobile, Right on desktop */}
            <div className="flex-1 overflow-hidden">
              <GenerativePanel
                components={components}
                onClear={() => handleClear(setComponents)}
              />
            </div>
          </main>
        )}
      </PikAuiProvider>
    </div>
  );
}
