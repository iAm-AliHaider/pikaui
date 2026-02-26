"use client";

import { ReactNode, useState, useCallback, useEffect } from "react";
import { Room, RoomEvent } from "livekit-client";
import { 
  LiveKitRoom, 
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import { getLiveKitUrl } from "@/lib/livekit-config";
import { createDataChannelHandler } from "@/lib/data-channel";

interface ComponentItem {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

interface PikAuiProviderProps {
  children: (components: ComponentItem[], setComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>) => ReactNode;
  token: string;
  onComponentRender?: (component: string, props: Record<string, unknown>) => void;
}

export function PikAuiProvider({ children, token, onComponentRender }: PikAuiProviderProps) {
  const [components, setComponents] = useState<ComponentItem[]>([]);

  const handleComponent = useCallback((component: string, props: Record<string, unknown>) => {
    const id = `${component}-${Date.now()}`;
    setComponents(prev => [...prev, { id, component, props }]);
    onComponentRender?.(component, props);
  }, [onComponentRender]);

  const handleDataReceived = createDataChannelHandler(handleComponent);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={getLiveKitUrl()}
      connect={true}
      className="h-full w-full"
    >
      <RoomAudioRenderer />
      <DataChannelListener onDataReceived={(p, part, k, t) => handleDataReceived(p, part, k, t)} />
      <div className="h-full w-full flex flex-col">
        {children(components, setComponents)}
      </div>
    </LiveKitRoom>
  );
}

function DataChannelListener({ 
  onDataReceived 
}: { 
  onDataReceived: (payload: Uint8Array, participant: unknown, kind: string, topic?: string) => void 
}) {
  const room = useRoomContext();
  
  useEffect(() => {
    if (!room) return;
    
    const handleData = (payload: Uint8Array, participant: unknown, kind: any, topic?: string) => {
      onDataReceived(payload, participant, kind, topic);
    };
    
    room.on(RoomEvent.DataReceived, handleData);
    
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, onDataReceived]);
  
  return null;
}

export function useVoiceConnection() {
  const room = useRoomContext();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    if (!room) return;
    
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    
    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);
  
  return { room, isConnected, isSpeaking };
}
