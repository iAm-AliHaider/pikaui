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
        const { token: newToken, serverUrl } = await fetchToken(roomName, identity);
        setToken(newToken);
        console.log("Token received from:", serverUrl);
      } catch (err) {
        console.error("Failed to get token:", err);
        setError("Failed to connect to voice service");
      } finally {
        setIsLoading(false);
      }
    }
    getToken();
  }, [roomName]);

  const handleClear = useCallback(() => {
    // handled by PikAuiProvider state
  }, []);

  void handleClear; // suppress unused warning

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Connecting to pikAui...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-md">
          <p className="text-red-400 text-center">{error}</p>
          <p className="text-zinc-500 text-sm text-center">Make sure your environment variables are configured correctly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PikAuiProvider token={token}>
        {(components, setComponents) => (
          <>
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      pikAui
                    </h1>
                  </div>
                  <span className="text-xs text-zinc-500">Voice-Powered Generative UI</span>
                </div>
              </div>
            </header>

            <main className="h-[calc(100vh-4rem)]">
              <div className="h-full max-w-7xl mx-auto flex">
                <div className="w-full md:w-1/3 lg:w-1/4 border-r border-white/10 bg-white/[0.02]">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-white/10">
                      <h2 className="text-sm font-medium text-zinc-400">Voice Control</h2>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <VoiceAgent />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <GenerativePanel components={components} onClear={() => setComponents([])} />
                </div>
              </div>
            </main>
          </>
        )}
      </PikAuiProvider>
    </div>
  );
}
