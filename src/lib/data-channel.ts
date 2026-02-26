export interface TamboRenderMessage {
  type: "tambo_render";
  component: string;
  props: Record<string, unknown>;
}

export interface DataChannelMessage {
  type: string;
  [key: string]: unknown;
}

export type UiSyncCallback = (component: string, props: Record<string, unknown>) => void;

export function createDataChannelHandler(onComponent: UiSyncCallback) {
  return (payload: Uint8Array, participant: unknown, kind: string, topic?: string) => {
    if (topic !== "ui_sync") return;
    if (kind !== "string") return;
    
    try {
      const text = new TextDecoder().decode(payload);
      const msg: DataChannelMessage = JSON.parse(text);
      
      if (msg.type === "tambo_render") {
        const renderMsg = msg as unknown as TamboRenderMessage;
        onComponent(renderMsg.component, renderMsg.props);
      }
    } catch (error) {
      console.error("Failed to parse data channel message:", error);
    }
  };
}
